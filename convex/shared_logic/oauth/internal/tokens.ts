import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";
import { getClientOrThrow } from "./helpers";
import { loadUserBundle } from "./subjects";

async function revokeAuthorizationAccessTokens(args: {
  ctx: any;
  clientId: string;
  authorizationId: any;
  now: number;
}) {
  const issuedForClient = await args.ctx.db
    .query("oauthAccessTokens")
    .withIndex("clientId", (q: any) => q.eq("clientId", args.clientId))
    .collect();
  const matching = issuedForClient.filter(
    (token: any) =>
      token.authorizationId === args.authorizationId
      && token.revokedAt === undefined,
  );

  await Promise.all(
    matching.map((token: any) =>
      args.ctx.db.patch(token._id, {
        revokedAt: args.now,
      }),
    ),
  );

  return matching.length;
}

/**
 * WHY:   Token issuance must atomically consume auth codes and persist new token records.
 * WHAT:  Validates a code exchange and stores the resulting access/refresh token rows.
 * HOW:   Checks client auth, PKCE, grant status, and one-time code usage before writing token state.
 */
export const exchangeAuthorizationCode = internalMutation({
  args: {
    clientId: v.string(),
    clientSecretHash: v.optional(v.string()),
    codeHash: v.string(),
    redirectUri: v.string(),
    codeVerifierChallenge: v.string(),
    accessTokenJti: v.string(),
    accessTokenExpiresAt: v.number(),
    refreshTokenHash: v.optional(v.string()),
    refreshTokenExpiresAt: v.optional(v.number()),
    refreshFamilyId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const client = await getClientOrThrow(ctx, args.clientId);
    if (client.clientType === "confidential") {
      if (!client.clientSecretHash || client.clientSecretHash !== args.clientSecretHash) {
        throw new ConvexError({ code: "INVALID_CLIENT", message: "Invalid client credentials" });
      }
    }

    const code = await ctx.db
      .query("oauthAuthCodes")
      .withIndex("codeHash", (q) => q.eq("codeHash", args.codeHash))
      .unique();
    if (!code || code.clientId !== args.clientId || code.redirectUri !== args.redirectUri) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Authorization code is invalid" });
    }
    if (code.usedAt || code.expiresAt <= args.now) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Authorization code is expired or already used" });
    }
    if (code.codeChallenge !== args.codeVerifierChallenge) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "PKCE verification failed" });
    }

    const authorization = await ctx.db.get(code.authorizationId);
    if (!authorization || authorization.revokedAt) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Authorization grant is no longer active" });
    }

    await ctx.db.patch(code._id, { usedAt: args.now });
    await ctx.db.insert("oauthAccessTokens", {
      jti: args.accessTokenJti,
      clientId: args.clientId,
      userId: code.userId,
      authorizationId: code.authorizationId,
      sessionId: args.sessionId,
      scopes: code.scopes,
      expiresAt: args.accessTokenExpiresAt,
      createdAt: args.now,
      lastUsedAt: args.now,
    });

    if (
      code.scopes.includes("offline_access") &&
      args.refreshTokenHash &&
      args.refreshTokenExpiresAt &&
      args.refreshFamilyId
    ) {
      await ctx.db.insert("oauthRefreshTokens", {
        tokenHash: args.refreshTokenHash,
        familyId: args.refreshFamilyId,
        clientId: args.clientId,
        userId: code.userId,
        authorizationId: code.authorizationId,
        scopes: code.scopes,
        expiresAt: args.refreshTokenExpiresAt,
        createdAt: args.now,
      });
    }

    await ctx.db.patch(authorization._id, {
      lastUsedAt: args.now,
      updatedAt: args.now,
    });

    await ctx.db.insert("oauthAuditLogs", {
      eventType: "token.code_exchanged",
      clientId: args.clientId,
      userId: code.userId,
      authorizationId: code.authorizationId,
      accessTokenJti: args.accessTokenJti,
      refreshFamilyId: args.refreshFamilyId,
      metadata: {
        scopes: code.scopes,
      },
      createdAt: args.now,
    });

    const bundle = await loadUserBundle(ctx, code.userId, args.clientId);
    return {
      clientId: args.clientId,
      userId: code.userId,
      authorizationId: code.authorizationId,
      scopes: code.scopes,
      nonce: code.nonce ?? null,
      pairwiseSubject: bundle.subjectMapping.pairwiseSubject,
      user: bundle.user,
      profile: bundle.profile,
    };
  },
});

/**
 * WHY:   Refresh-token replay must invalidate the whole token family instead of silently reissuing tokens.
 * WHAT:  Rotates a refresh token, detects replay, and writes replacement token rows.
 * HOW:   Marks the current token used, inserts successor records, and revokes the family on suspicious reuse.
 */
export const rotateRefreshToken = internalMutation({
  args: {
    clientId: v.string(),
    clientSecretHash: v.optional(v.string()),
    refreshTokenHash: v.string(),
    accessTokenJti: v.string(),
    accessTokenExpiresAt: v.number(),
    nextRefreshTokenHash: v.string(),
    nextRefreshTokenExpiresAt: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const client = await getClientOrThrow(ctx, args.clientId);
    if (client.clientType === "confidential") {
      if (!client.clientSecretHash || client.clientSecretHash !== args.clientSecretHash) {
        throw new ConvexError({ code: "INVALID_CLIENT", message: "Invalid client credentials" });
      }
    }

    const refresh = await ctx.db
      .query("oauthRefreshTokens")
      .withIndex("tokenHash", (q) => q.eq("tokenHash", args.refreshTokenHash))
      .unique();
    if (!refresh || refresh.clientId !== args.clientId) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Refresh token is invalid" });
    }

    if (refresh.revokedAt || refresh.expiresAt <= args.now) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Refresh token is expired or revoked" });
    }

    if (refresh.usedAt) {
      const family = await ctx.db
        .query("oauthRefreshTokens")
        .withIndex("familyId", (q) => q.eq("familyId", refresh.familyId))
        .collect();
      await Promise.all(
        family.map((token) =>
          ctx.db.patch(token._id, {
            revokedAt: args.now,
            replayDetectedAt: args.now,
          }),
        ),
      );
      const revokedAccessTokenCount = await revokeAuthorizationAccessTokens({
        ctx,
        clientId: args.clientId,
        authorizationId: refresh.authorizationId,
        now: args.now,
      });
      await ctx.db.insert("oauthAuditLogs", {
        eventType: "token.refresh_replay_detected",
        clientId: args.clientId,
        userId: refresh.userId,
        authorizationId: refresh.authorizationId,
        refreshFamilyId: refresh.familyId,
        metadata: {
          revokedRefreshTokenCount: family.length,
          revokedAccessTokenCount,
        },
        createdAt: args.now,
      });
      return {
        replayDetected: true as const,
      };
    }

    const authorization = await ctx.db.get(refresh.authorizationId);
    if (!authorization || authorization.revokedAt) {
      throw new ConvexError({ code: "INVALID_GRANT", message: "Authorization grant is no longer active" });
    }

    await ctx.db.patch(refresh._id, { usedAt: args.now });
    await ctx.db.insert("oauthAccessTokens", {
      jti: args.accessTokenJti,
      clientId: args.clientId,
      userId: refresh.userId,
      authorizationId: refresh.authorizationId,
      scopes: refresh.scopes,
      expiresAt: args.accessTokenExpiresAt,
      createdAt: args.now,
      lastUsedAt: args.now,
    });
    await ctx.db.insert("oauthRefreshTokens", {
      tokenHash: args.nextRefreshTokenHash,
      familyId: refresh.familyId,
      parentTokenId: refresh._id,
      clientId: args.clientId,
      userId: refresh.userId,
      authorizationId: refresh.authorizationId,
      scopes: refresh.scopes,
      expiresAt: args.nextRefreshTokenExpiresAt,
      createdAt: args.now,
    });
    await ctx.db.patch(authorization._id, {
      lastUsedAt: args.now,
      updatedAt: args.now,
    });
    await ctx.db.insert("oauthAuditLogs", {
      eventType: "token.refresh_rotated",
      clientId: args.clientId,
      userId: refresh.userId,
      authorizationId: refresh.authorizationId,
      accessTokenJti: args.accessTokenJti,
      refreshFamilyId: refresh.familyId,
      createdAt: args.now,
    });

    const bundle = await loadUserBundle(ctx, refresh.userId, args.clientId);
    return {
      replayDetected: false as const,
      clientId: args.clientId,
      userId: refresh.userId,
      authorizationId: refresh.authorizationId,
      scopes: refresh.scopes,
      pairwiseSubject: bundle.subjectMapping.pairwiseSubject,
      user: bundle.user,
      profile: bundle.profile,
      refreshFamilyId: refresh.familyId,
    };
  },
});

/**
 * WHY:   Bearer tokens must be checked against server-side revocation and expiry state.
 * WHAT:  Resolves the active access-token context plus user and subject details.
 * HOW:   Looks up the token by JTI, validates related grant/client rows, and returns the hydrated bundle.
 */
export const getAccessTokenContext = internalQuery({
  args: {
    jti: v.string(),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("jti", (q) => q.eq("jti", args.jti))
      .unique();
    if (!accessToken || accessToken.clientId !== args.clientId) {
      throw new ConvexError({ code: "INVALID_TOKEN", message: "Access token is invalid" });
    }
    if (accessToken.revokedAt || accessToken.expiresAt <= Date.now()) {
      throw new ConvexError({ code: "INVALID_TOKEN", message: "Access token is expired or revoked" });
    }

    const [client, authorization] = await Promise.all([
      getClientOrThrow(ctx, args.clientId),
      ctx.db.get(accessToken.authorizationId),
    ]);
    if (!authorization || authorization.revokedAt) {
      throw new ConvexError({ code: "INVALID_TOKEN", message: "Authorization grant is revoked" });
    }

    const bundle = await loadUserBundle(ctx, accessToken.userId, args.clientId);
    return {
      accessToken,
      client,
      authorization,
      user: bundle.user,
      profile: bundle.profile,
      pairwiseSubject: bundle.subjectMapping.pairwiseSubject,
    };
  },
});

/**
 * WHY:   Security center and audit trails need observable token usage timestamps.
 * WHAT:  Updates last-used timestamps for access tokens and grants after successful bearer-token use.
 * HOW:   Patches the token and authorization documents and records an audit event.
 */
export const touchAccessToken = internalMutation({
  args: {
    jti: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("jti", (q) => q.eq("jti", args.jti))
      .unique();
    if (!accessToken) return { ok: false } as const;
    await ctx.db.patch(accessToken._id, { lastUsedAt: args.now });
    await ctx.db.patch(accessToken.authorizationId, {
      lastUsedAt: args.now,
      updatedAt: args.now,
    });
    return { ok: true } as const;
  },
});

/**
 * WHY:   Users and clients need a standard token revocation path.
 * WHAT:  Revokes the matching refresh-token family and its related grant.
 * HOW:   Accepts a hashed refresh token, revokes all family members, and marks the authorization inactive.
 */
export const revokeRefreshTokenFamily = internalMutation({
  args: {
    clientId: v.string(),
    clientSecretHash: v.optional(v.string()),
    refreshTokenHash: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const client = await getClientOrThrow(ctx, args.clientId);
    if (client.clientType === "confidential") {
      if (!client.clientSecretHash || client.clientSecretHash !== args.clientSecretHash) {
        throw new ConvexError({ code: "INVALID_CLIENT", message: "Invalid client credentials" });
      }
    }

    const refresh = await ctx.db
      .query("oauthRefreshTokens")
      .withIndex("tokenHash", (q) => q.eq("tokenHash", args.refreshTokenHash))
      .unique();
    if (!refresh || refresh.clientId !== args.clientId) {
      return { revoked: false } as const;
    }

    const family = await ctx.db
      .query("oauthRefreshTokens")
      .withIndex("familyId", (q) => q.eq("familyId", refresh.familyId))
      .collect();
    await Promise.all(
      family.map((token) =>
        ctx.db.patch(token._id, {
          revokedAt: args.now,
        }),
      ),
    );
    const revokedAccessTokenCount = await revokeAuthorizationAccessTokens({
      ctx,
      clientId: args.clientId,
      authorizationId: refresh.authorizationId,
      now: args.now,
    });
    await ctx.db.patch(refresh.authorizationId, {
      revokedAt: args.now,
      updatedAt: args.now,
    });
    await ctx.db.insert("oauthAuditLogs", {
      eventType: "token.revoked",
      clientId: args.clientId,
      userId: refresh.userId,
      authorizationId: refresh.authorizationId,
      refreshFamilyId: refresh.familyId,
      metadata: {
        revokedRefreshTokenCount: family.length,
        revokedAccessTokenCount,
      },
      createdAt: args.now,
    });
    return { revoked: true } as const;
  },
});
