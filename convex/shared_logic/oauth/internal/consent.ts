import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";
import { OAUTH_CONSENT_VERSION, OAUTH_SCOPE_LABELS, diffScopes } from "../../../_core/oauth/constants";
import { getAuthorizationRecord, getClientOrThrow } from "./helpers";
import { getSubjectMapping } from "./subjects";

function requireActiveFlow<T extends { expiresAt: number; usedAt?: number } | null>(
  flow: T,
  now: number,
): Exclude<T, null> {
  if (!flow || flow.expiresAt <= now || flow.usedAt) {
    throw new ConvexError({ code: "INVALID_REQUEST", message: "Authorization flow is expired" });
  }
  return flow as Exclude<T, null>;
}

function buildRequestedScopes(requestedScopes: string[], pendingScopes: string[]) {
  return requestedScopes.map((scope) => ({
    id: scope,
    label: OAUTH_SCOPE_LABELS[scope as keyof typeof OAUTH_SCOPE_LABELS] ?? scope,
    newlyRequested: pendingScopes.includes(scope),
  }));
}

function toExistingAuthorization(authorization: any) {
  return authorization
    ? {
        grantedScopes: authorization.grantedScopes,
        createdAt: authorization.createdAt,
        updatedAt: authorization.updatedAt,
        lastUsedAt: authorization.lastUsedAt ?? null,
      }
    : null;
}

function mergeGrantedScopes(existingScopes: string[] | undefined, requestedScopes: string[]) {
  return [...new Set([...(existingScopes ?? []), ...requestedScopes])].sort();
}

async function upsertAuthorizationGrant(args: {
  ctx: any;
  existingAuthorization: any;
  clientId: string;
  userId: any;
  grantedScopes: string[];
  now: number;
}) {
  if (args.existingAuthorization) {
    await args.ctx.db.patch(args.existingAuthorization._id, {
      grantedScopes: args.grantedScopes,
      offlineAccess: args.grantedScopes.includes("offline_access"),
      consentVersion: OAUTH_CONSENT_VERSION,
      updatedAt: args.now,
      revokedAt: undefined,
      lastUsedAt: args.now,
    });
    return args.existingAuthorization._id;
  }
  return args.ctx.db.insert("oauthAuthorizations", {
    userId: args.userId,
    clientId: args.clientId,
    grantedScopes: args.grantedScopes,
    offlineAccess: args.grantedScopes.includes("offline_access"),
    consentVersion: OAUTH_CONSENT_VERSION,
    createdAt: args.now,
    updatedAt: args.now,
    lastUsedAt: args.now,
  });
}

async function ensureSubjectMapping(args: {
  ctx: any;
  userId: any;
  clientId: string;
  pairwiseSubject: string;
  now: number;
}) {
  const existingSubject = await getSubjectMapping(args.ctx, args.userId, args.clientId);
  if (existingSubject) return;
  await args.ctx.db.insert("oauthSubjectMappings", {
    clientId: args.clientId,
    userId: args.userId,
    pairwiseSubject: args.pairwiseSubject,
    createdAt: args.now,
  });
}

async function insertAuthCodeAndAudit(args: {
  ctx: any;
  flow: any;
  userId: any;
  clientId: string;
  authorizationId: any;
  codeHash: string;
  expiresAt: number;
  now: number;
  flowId: any;
}) {
  await args.ctx.db.insert("oauthAuthCodes", {
    codeHash: args.codeHash,
    clientId: args.clientId,
    userId: args.userId,
    authorizationId: args.authorizationId,
    redirectUri: args.flow.redirectUri,
    scopes: args.flow.requestedScopes,
    nonce: args.flow.nonce,
    codeChallenge: args.flow.codeChallenge,
    codeChallengeMethod: args.flow.codeChallengeMethod,
    expiresAt: args.expiresAt,
    createdAt: args.now,
  });
  await args.ctx.db.patch(args.flowId, { usedAt: args.now });
  await args.ctx.db.insert("oauthAuditLogs", {
    eventType: "authorize.approved",
    clientId: args.clientId,
    userId: args.userId,
    authorizationId: args.authorizationId,
    metadata: { scopes: args.flow.requestedScopes },
    createdAt: args.now,
  });
}

/**
 * WHY:   The consent page must render app metadata and know whether approval can be reused.
 * WHAT:  Returns the pending flow, client details, translated scopes, and consent status for the caller.
 * HOW:   Resolves the signed-in user, loads any existing grant, and compares the requested scopes with the stored grant.
 */
export const getAuthorizationPrompt = internalQuery({
  args: {
    flowId: v.id("oauthFlowState"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const flow = requireActiveFlow(await ctx.db.get(args.flowId), Date.now());

    const client = await getClientOrThrow(ctx, flow.clientId);
    const authorization = await getAuthorizationRecord(ctx, args.userId, flow.clientId);
    const pendingScopes = diffScopes(flow.requestedScopes, authorization?.grantedScopes ?? []);
    const requiresConsent =
      !authorization ||
      authorization.revokedAt !== undefined ||
      authorization.consentVersion !== OAUTH_CONSENT_VERSION ||
      pendingScopes.length > 0;
    const user = await ctx.db.get(args.userId);

    return {
      flowId: args.flowId,
      client: {
        clientId: client.clientId,
        name: client.name,
        publisherName: client.publisherName,
        logoUrl: client.logoUrl,
        trusted: client.trusted,
      },
      user: {
        email: user?.email ?? null,
        name: user?.name ?? user?.displayName ?? null,
        image: user?.image ?? null,
      },
      state: flow.state,
      redirectUri: flow.redirectUri,
      requestedScopes: buildRequestedScopes(flow.requestedScopes, pendingScopes),
      offlineAccess: flow.requestedScopes.includes("offline_access"),
      requiresConsent,
      existingAuthorization: toExistingAuthorization(authorization),
    };
  },
});

/**
 * WHY:   User approval must produce a durable grant and a one-time authorization code atomically.
 * WHAT:  Upserts the authorization grant, stores the pairwise subject mapping, and creates an auth code row.
 * HOW:   Validates the pending flow, merges scopes onto the grant, marks the flow used, and returns redirect metadata.
 */
export const persistAuthorizationApproval = internalMutation({
  args: {
    flowId: v.id("oauthFlowState"),
    userId: v.id("users"),
    pairwiseSubject: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const flow = requireActiveFlow(await ctx.db.get(args.flowId), args.now);
    const client = await getClientOrThrow(ctx, flow.clientId);
    const existingAuthorization = await getAuthorizationRecord(ctx, args.userId, client.clientId);
    const grantedScopes = mergeGrantedScopes(existingAuthorization?.grantedScopes, flow.requestedScopes);
    const authorizationId = await upsertAuthorizationGrant({
      ctx,
      existingAuthorization,
      clientId: client.clientId,
      userId: args.userId,
      grantedScopes,
      now: args.now,
    });
    await ensureSubjectMapping({
      ctx,
      userId: args.userId,
      clientId: client.clientId,
      pairwiseSubject: args.pairwiseSubject,
      now: args.now,
    });
    await insertAuthCodeAndAudit({
      ctx,
      flow,
      userId: args.userId,
      clientId: client.clientId,
      authorizationId,
      codeHash: args.codeHash,
      expiresAt: args.expiresAt,
      now: args.now,
      flowId: args.flowId,
    });
    return {
      clientId: client.clientId,
      redirectUri: flow.redirectUri,
      state: flow.state,
      scopes: flow.requestedScopes,
      authorizationId,
      userId: args.userId,
    };
  },
});
