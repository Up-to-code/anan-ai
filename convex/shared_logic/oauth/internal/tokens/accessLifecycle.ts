import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../../../../_generated/server";
import { getAuthorizationExpiryMs, isAuthorizationExpired } from "../../../../_core/oauth/constants";
import { getClientOrThrow } from "../helpers";
import { loadOrganizationBundle } from "../subjects";
import { revokeAuthorizationAccessTokens } from "./common";

function assertConfidentialClientCredentials(client: any, providedSecretHash: string | undefined) {
  if (client.clientType !== "confidential") {
    return;
  }
  if (!client.clientSecretHash || client.clientSecretHash !== providedSecretHash) {
    throw new ConvexError({ code: "INVALID_CLIENT", message: "Invalid client credentials" });
  }
}

async function revokeRefreshFamily(ctx: any, familyId: string, now: number) {
  const family = await ctx.db
    .query("oauthRefreshTokens")
    .withIndex("familyId", (q: any) => q.eq("familyId", familyId))
    .collect();
  await Promise.all(
    family.map((token: any) =>
      ctx.db.patch(token._id, {
        revokedAt: now,
      }),
    ),
  );
  return family;
}

function requireOrganizationOwnerFromAuthorization(authorization: any) {
  if (!authorization.ownerType || !authorization.tenantOrgId) {
    throw new ConvexError({ code: "INVALID_TOKEN", message: "Legacy user authorization requires reconnect" });
  }
  if (authorization.ownerType === "broker" && authorization.ownerBrokerId) {
    return {
      ownerType: "broker" as const,
      ownerBrokerId: authorization.ownerBrokerId,
      authUserId: "",
      tenantOrgId: authorization.tenantOrgId,
    };
  }
  if (authorization.ownerType === "RED" && authorization.ownerREDId) {
    return {
      ownerType: "RED" as const,
      ownerREDId: authorization.ownerREDId,
      authUserId: "",
      tenantOrgId: authorization.tenantOrgId,
    };
  }
  throw new ConvexError({ code: "INVALID_TOKEN", message: "Organization authorization is malformed" });
}

/**
 * WHY:   Bearer tokens must be checked against server-side revocation and org ownership state.
 * WHAT:  Resolves the active access-token context plus organization and subject details.
 * HOW:   Looks up the token by JTI, validates related grant/client rows, and returns the hydrated organization bundle.
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
    if (isAuthorizationExpired(authorization, Date.now())) {
      throw new ConvexError({ code: "AUTHORIZATION_EXPIRED", message: "Organization authorization expired" });
    }

    const owner = requireOrganizationOwnerFromAuthorization(authorization);
    const bundle = await loadOrganizationBundle(ctx, owner, args.clientId);
    return {
      accessToken,
      client,
      authorization,
      organization: bundle.organization,
      pairwiseSubject: bundle.subjectMapping.pairwiseSubject,
    };
  },
});

/**
 * WHY:   Security center and audit trails need observable token usage timestamps.
 * WHAT:  Updates last-used timestamps for access tokens and grants after successful bearer-token use.
 * HOW:   Patches the token and authorization documents.
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
    const authorization = await ctx.db.get(accessToken.authorizationId);
    const client = authorization ? await getClientOrThrow(ctx, authorization.clientId) : null;
    await ctx.db.patch(accessToken.authorizationId, {
      lastUsedAt: args.now,
      updatedAt: args.now,
      expiresAt: client ? args.now + getAuthorizationExpiryMs() : undefined,
    });
    return { ok: true } as const;
  },
});

/**
 * WHY:   OAuth clients need a standard token revocation path that invalidates the connected organization grant.
 * WHAT:  Revokes the matching refresh-token family and its related org authorization.
 * HOW:   Accepts a hashed refresh token, revokes all family members, and marks the organization grant inactive.
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
    assertConfidentialClientCredentials(client, args.clientSecretHash);

    const refresh = await ctx.db
      .query("oauthRefreshTokens")
      .withIndex("tokenHash", (q) => q.eq("tokenHash", args.refreshTokenHash))
      .unique();
    if (!refresh || refresh.clientId !== args.clientId) {
      return { revoked: false } as const;
    }

    const family = await revokeRefreshFamily(ctx, refresh.familyId, args.now);
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
      tenantOrgId: refresh.tenantOrgId,
      ownerType: refresh.ownerType,
      ownerBrokerId: refresh.ownerBrokerId,
      ownerREDId: refresh.ownerREDId,
      clientId: args.clientId,
      userId: refresh.approvedByUserId,
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
