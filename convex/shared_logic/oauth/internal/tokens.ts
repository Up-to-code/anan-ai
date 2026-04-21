import { ConvexError, v } from "convex/values";
import { internalMutation } from "../../../_generated/server";
import { getClientOrThrow } from "./helpers";
import { loadOrganizationBundle } from "./subjects";
import { revokeAuthorizationAccessTokens } from "./tokens/common";
export {
  getAccessTokenContext,
  revokeRefreshTokenFamily,
  touchAccessToken,
} from "./tokens/accessLifecycle";

function assertClientCredentials(client: any, clientSecretHash: string | undefined) {
  if (client.clientType !== "confidential") return;
  if (!client.clientSecretHash || client.clientSecretHash !== clientSecretHash) {
    throw new ConvexError({ code: "INVALID_CLIENT", message: "Invalid client credentials" });
  }
}

function requireOrganizationOwner(args: {
  ownerType?: "broker" | "RED";
  ownerBrokerId?: any;
  ownerREDId?: any;
  tenantOrgId?: string;
}) {
  if (!args.ownerType || !args.tenantOrgId) {
    throw new ConvexError({ code: "INVALID_GRANT", message: "Legacy user authorization requires reconnect" });
  }
  if (args.ownerType === "broker" && args.ownerBrokerId) {
    return {
      ownerType: "broker" as const,
      ownerBrokerId: args.ownerBrokerId,
      authUserId: "",
      tenantOrgId: args.tenantOrgId,
    };
  }
  if (args.ownerType === "RED" && args.ownerREDId) {
    return {
      ownerType: "RED" as const,
      ownerREDId: args.ownerREDId,
      authUserId: "",
      tenantOrgId: args.tenantOrgId,
    };
  }
  throw new ConvexError({ code: "INVALID_GRANT", message: "Organization authorization is malformed" });
}

async function getAuthorizationCodeOrThrow(ctx: any, args: any) {
  const code = await ctx.db
    .query("oauthAuthCodes")
    .withIndex("codeHash", (q: any) => q.eq("codeHash", args.codeHash))
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
  return code;
}

async function getActiveAuthorizationOrThrow(ctx: any, authorizationId: any) {
  const authorization = await ctx.db.get(authorizationId);
  if (!authorization || authorization.revokedAt) {
    throw new ConvexError({ code: "INVALID_GRANT", message: "Authorization grant is no longer active" });
  }
  return authorization;
}

async function insertAccessToken(ctx: any, args: any, tokenArgs: any) {
  await ctx.db.insert("oauthAccessTokens", {
    jti: tokenArgs.jti,
    clientId: args.clientId,
    tenantOrgId: tokenArgs.tenantOrgId,
    ownerType: tokenArgs.ownerType,
    ownerBrokerId: tokenArgs.ownerBrokerId,
    ownerREDId: tokenArgs.ownerREDId,
    approvedByUserId: tokenArgs.approvedByUserId,
    authorizationId: tokenArgs.authorizationId,
    sessionId: tokenArgs.sessionId,
    scopes: tokenArgs.scopes,
    expiresAt: tokenArgs.expiresAt,
    createdAt: args.now,
    lastUsedAt: args.now,
  });
}

async function insertRefreshTokenFromCode(ctx: any, args: any, code: any) {
  if (!code.scopes.includes("offline_access")) return;
  if (!(args.refreshTokenHash && args.refreshTokenExpiresAt && args.refreshFamilyId)) return;
  await ctx.db.insert("oauthRefreshTokens", {
    tokenHash: args.refreshTokenHash,
    familyId: args.refreshFamilyId,
    clientId: args.clientId,
    tenantOrgId: code.tenantOrgId,
    ownerType: code.ownerType,
    ownerBrokerId: code.ownerBrokerId,
    ownerREDId: code.ownerREDId,
    approvedByUserId: code.approvedByUserId,
    authorizationId: code.authorizationId,
    scopes: code.scopes,
    expiresAt: args.refreshTokenExpiresAt,
    createdAt: args.now,
  });
}

async function logCodeExchangeAudit(ctx: any, args: any, code: any) {
  await ctx.db.insert("oauthAuditLogs", {
    eventType: "token.code_exchanged",
    tenantOrgId: code.tenantOrgId,
    ownerType: code.ownerType,
    ownerBrokerId: code.ownerBrokerId,
    ownerREDId: code.ownerREDId,
    clientId: args.clientId,
    userId: code.approvedByUserId,
    authorizationId: code.authorizationId,
    accessTokenJti: args.accessTokenJti,
    refreshFamilyId: args.refreshFamilyId,
    metadata: { scopes: code.scopes },
    createdAt: args.now,
  });
}

function buildExchangeResponse(args: any, code: any, bundle: any) {
  return {
    clientId: args.clientId,
    tenantOrgId: code.tenantOrgId,
    ownerType: code.ownerType,
    ownerBrokerId: code.ownerBrokerId,
    ownerREDId: code.ownerREDId,
    approvedByUserId: code.approvedByUserId,
    authorizationId: code.authorizationId,
    scopes: code.scopes,
    nonce: code.nonce ?? null,
    pairwiseSubject: bundle.subjectMapping.pairwiseSubject,
    organization: bundle.organization,
  };
}

async function getRefreshTokenOrThrow(ctx: any, args: any) {
  const refresh = await ctx.db
    .query("oauthRefreshTokens")
    .withIndex("tokenHash", (q: any) => q.eq("tokenHash", args.refreshTokenHash))
    .unique();
  if (!refresh || refresh.clientId !== args.clientId) {
    throw new ConvexError({ code: "INVALID_GRANT", message: "Refresh token is invalid" });
  }
  if (refresh.revokedAt || refresh.expiresAt <= args.now) {
    throw new ConvexError({ code: "INVALID_GRANT", message: "Refresh token is expired or revoked" });
  }
  return refresh;
}

async function handleRefreshReplay(ctx: any, args: any, refresh: any) {
  const family = await ctx.db
    .query("oauthRefreshTokens")
    .withIndex("familyId", (q: any) => q.eq("familyId", refresh.familyId))
    .collect();
  await Promise.all(
    family.map((token: any) =>
      ctx.db.patch(token._id, { revokedAt: args.now, replayDetectedAt: args.now }),
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
    tenantOrgId: refresh.tenantOrgId,
    ownerType: refresh.ownerType,
    ownerBrokerId: refresh.ownerBrokerId,
    ownerREDId: refresh.ownerREDId,
    clientId: args.clientId,
    userId: refresh.approvedByUserId,
    authorizationId: refresh.authorizationId,
    refreshFamilyId: refresh.familyId,
    metadata: { revokedRefreshTokenCount: family.length, revokedAccessTokenCount },
    createdAt: args.now,
  });
  return { replayDetected: true as const };
}

async function rotateTokenRows(ctx: any, args: any, refresh: any, authorization: any) {
  await ctx.db.patch(refresh._id, { usedAt: args.now });
  await insertAccessToken(ctx, args, {
    jti: args.accessTokenJti,
    tenantOrgId: refresh.tenantOrgId,
    ownerType: refresh.ownerType,
    ownerBrokerId: refresh.ownerBrokerId,
    ownerREDId: refresh.ownerREDId,
    approvedByUserId: refresh.approvedByUserId,
    authorizationId: refresh.authorizationId,
    scopes: refresh.scopes,
    expiresAt: args.accessTokenExpiresAt,
  });
  await ctx.db.insert("oauthRefreshTokens", {
    tokenHash: args.nextRefreshTokenHash,
    familyId: refresh.familyId,
    parentTokenId: refresh._id,
    clientId: args.clientId,
    tenantOrgId: refresh.tenantOrgId,
    ownerType: refresh.ownerType,
    ownerBrokerId: refresh.ownerBrokerId,
    ownerREDId: refresh.ownerREDId,
    approvedByUserId: refresh.approvedByUserId,
    authorizationId: refresh.authorizationId,
    scopes: refresh.scopes,
    expiresAt: args.nextRefreshTokenExpiresAt,
    createdAt: args.now,
  });
  await ctx.db.patch(authorization._id, { lastUsedAt: args.now, updatedAt: args.now });
}

async function logRefreshRotationAudit(ctx: any, args: any, refresh: any) {
  await ctx.db.insert("oauthAuditLogs", {
    eventType: "token.refresh_rotated",
    tenantOrgId: refresh.tenantOrgId,
    ownerType: refresh.ownerType,
    ownerBrokerId: refresh.ownerBrokerId,
    ownerREDId: refresh.ownerREDId,
    clientId: args.clientId,
    userId: refresh.approvedByUserId,
    authorizationId: refresh.authorizationId,
    accessTokenJti: args.accessTokenJti,
    refreshFamilyId: refresh.familyId,
    createdAt: args.now,
  });
}

function buildRefreshRotationResponse(args: any, refresh: any, bundle: any) {
  return {
    replayDetected: false as const,
    clientId: args.clientId,
    tenantOrgId: refresh.tenantOrgId,
    ownerType: refresh.ownerType,
    ownerBrokerId: refresh.ownerBrokerId,
    ownerREDId: refresh.ownerREDId,
    approvedByUserId: refresh.approvedByUserId,
    authorizationId: refresh.authorizationId,
    scopes: refresh.scopes,
    pairwiseSubject: bundle.subjectMapping.pairwiseSubject,
    organization: bundle.organization,
    refreshFamilyId: refresh.familyId,
  };
}

/**
 * WHY:   Token issuance must atomically consume auth codes and persist new org-bound token records.
 * WHAT:  Validates a code exchange and stores the resulting access/refresh token rows.
 * HOW:   Checks client auth, PKCE, grant status, and one-time code usage before writing org-scoped token state.
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
    assertClientCredentials(client, args.clientSecretHash);
    const code = await getAuthorizationCodeOrThrow(ctx, args);
    const authorization = await getActiveAuthorizationOrThrow(ctx, code.authorizationId);
    await ctx.db.patch(code._id, { usedAt: args.now });
    await insertAccessToken(ctx, args, {
      jti: args.accessTokenJti,
      tenantOrgId: code.tenantOrgId,
      ownerType: code.ownerType,
      ownerBrokerId: code.ownerBrokerId,
      ownerREDId: code.ownerREDId,
      approvedByUserId: code.approvedByUserId,
      authorizationId: code.authorizationId,
      sessionId: args.sessionId,
      scopes: code.scopes,
      expiresAt: args.accessTokenExpiresAt,
    });
    await insertRefreshTokenFromCode(ctx, args, code);
    await ctx.db.patch(authorization._id, { lastUsedAt: args.now, updatedAt: args.now });
    await logCodeExchangeAudit(ctx, args, code);
    const owner = requireOrganizationOwner(code);
    const bundle = await loadOrganizationBundle(ctx, owner, args.clientId);
    return buildExchangeResponse(args, code, bundle);
  },
});

/**
 * WHY:   Refresh-token replay must invalidate the whole token family instead of silently reissuing org tokens.
 * WHAT:  Rotates a refresh token, detects replay, and writes replacement org-bound token rows.
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
    assertClientCredentials(client, args.clientSecretHash);
    const refresh = await getRefreshTokenOrThrow(ctx, args);
    if (refresh.usedAt) {
      return handleRefreshReplay(ctx, args, refresh);
    }
    const authorization = await getActiveAuthorizationOrThrow(ctx, refresh.authorizationId);
    await rotateTokenRows(ctx, args, refresh, authorization);
    await logRefreshRotationAudit(ctx, args, refresh);
    const owner = requireOrganizationOwner(refresh);
    const bundle = await loadOrganizationBundle(ctx, owner, args.clientId);
    return buildRefreshRotationResponse(args, refresh, bundle);
  },
});
