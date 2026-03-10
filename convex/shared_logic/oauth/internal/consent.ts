import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";
import { OAUTH_CONSENT_VERSION, OAUTH_SCOPE_LABELS, diffScopes } from "../../../_core/oauth/constants";
import { getAuthorizationRecord, getClientOrThrow } from "./helpers";
import { getSubjectMapping } from "./subjects";

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
    const flow = await ctx.db.get(args.flowId);
    if (!flow || flow.expiresAt <= Date.now() || flow.usedAt) {
      throw new ConvexError({ code: "INVALID_REQUEST", message: "Authorization flow is expired" });
    }

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
      requestedScopes: flow.requestedScopes.map((scope) => ({
        id: scope,
        label: OAUTH_SCOPE_LABELS[scope as keyof typeof OAUTH_SCOPE_LABELS] ?? scope,
        newlyRequested: pendingScopes.includes(scope),
      })),
      offlineAccess: flow.requestedScopes.includes("offline_access"),
      requiresConsent,
      existingAuthorization: authorization
        ? {
            grantedScopes: authorization.grantedScopes,
            createdAt: authorization.createdAt,
            updatedAt: authorization.updatedAt,
            lastUsedAt: authorization.lastUsedAt ?? null,
          }
        : null,
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
    const flow = await ctx.db.get(args.flowId);
    if (!flow || flow.expiresAt <= args.now || flow.usedAt) {
      throw new ConvexError({ code: "INVALID_REQUEST", message: "Authorization flow is expired" });
    }

    const client = await getClientOrThrow(ctx, flow.clientId);
    const existingAuthorization = await getAuthorizationRecord(ctx, args.userId, client.clientId);
    const grantedScopes = [...new Set([...(existingAuthorization?.grantedScopes ?? []), ...flow.requestedScopes])].sort();
    const authorizationId = existingAuthorization?._id ??
      (await ctx.db.insert("oauthAuthorizations", {
        userId: args.userId,
        clientId: client.clientId,
        grantedScopes,
        offlineAccess: grantedScopes.includes("offline_access"),
        consentVersion: OAUTH_CONSENT_VERSION,
        createdAt: args.now,
        updatedAt: args.now,
        lastUsedAt: args.now,
      }));

    if (existingAuthorization) {
      await ctx.db.patch(existingAuthorization._id, {
        grantedScopes,
        offlineAccess: grantedScopes.includes("offline_access"),
        consentVersion: OAUTH_CONSENT_VERSION,
        updatedAt: args.now,
        revokedAt: undefined,
        lastUsedAt: args.now,
      });
    }

    const existingSubject = await getSubjectMapping(ctx, args.userId, client.clientId);
    if (!existingSubject) {
      await ctx.db.insert("oauthSubjectMappings", {
        clientId: client.clientId,
        userId: args.userId,
        pairwiseSubject: args.pairwiseSubject,
        createdAt: args.now,
      });
    }

    await ctx.db.insert("oauthAuthCodes", {
      codeHash: args.codeHash,
      clientId: client.clientId,
      userId: args.userId,
      authorizationId,
      redirectUri: flow.redirectUri,
      scopes: flow.requestedScopes,
      nonce: flow.nonce,
      codeChallenge: flow.codeChallenge,
      codeChallengeMethod: flow.codeChallengeMethod,
      expiresAt: args.expiresAt,
      createdAt: args.now,
    });

    await ctx.db.patch(args.flowId, { usedAt: args.now });
    await ctx.db.insert("oauthAuditLogs", {
      eventType: "authorize.approved",
      clientId: client.clientId,
      userId: args.userId,
      authorizationId,
      metadata: {
        scopes: flow.requestedScopes,
      },
      createdAt: args.now,
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
