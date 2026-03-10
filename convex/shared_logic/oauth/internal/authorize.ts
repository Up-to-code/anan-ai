import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";
import { normalizeRequestedScopes } from "../../../_core/oauth/constants";
import { ensureRedirectUri, ensureScopes, getClientOrThrow } from "./helpers";

/**
 * WHY:   `/authorize` must validate clients and requested scopes before any UI redirect.
 * WHAT:  Checks client existence, redirect URI, scope allowlist, and PKCE requirements.
 * HOW:   Returns a sanitized request envelope consumed by the HTTP authorization route.
 */
export const validateAuthorizationRequest = internalQuery({
  args: {
    clientId: v.string(),
    redirectUri: v.string(),
    scope: v.optional(v.string()),
    state: v.string(),
    nonce: v.optional(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: v.literal("S256"),
  },
  handler: async (ctx, args) => {
    const client = await getClientOrThrow(ctx, args.clientId);
    ensureRedirectUri(client, args.redirectUri);
    const requestedScopes = normalizeRequestedScopes(args.scope);
    ensureScopes(client, requestedScopes);
    return {
      clientId: client.clientId,
      redirectUri: args.redirectUri,
      requestedScopes,
      state: args.state,
      nonce: args.nonce,
      codeChallenge: args.codeChallenge,
      codeChallengeMethod: args.codeChallengeMethod,
    };
  },
});

/**
 * WHY:   The web consent page needs a durable server-side record of the incoming auth request.
 * WHAT:  Persists a short-lived OAuth authorization flow state row.
 * HOW:   Stores validated request fields with expiry so user approval does not rely on raw query params alone.
 */
export const createAuthorizationFlow = internalMutation({
  args: {
    clientId: v.string(),
    redirectUri: v.string(),
    requestedScopes: v.array(v.string()),
    state: v.string(),
    nonce: v.optional(v.string()),
    codeChallenge: v.string(),
    codeChallengeMethod: v.literal("S256"),
    expiresAt: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const flowId = await ctx.db.insert("oauthFlowState", {
      clientId: args.clientId,
      redirectUri: args.redirectUri,
      requestedScopes: args.requestedScopes,
      state: args.state,
      nonce: args.nonce,
      codeChallenge: args.codeChallenge,
      codeChallengeMethod: args.codeChallengeMethod,
      expiresAt: args.expiresAt,
      createdAt: args.now,
    });
    await ctx.db.insert("oauthAuditLogs", {
      eventType: "authorize.requested",
      clientId: args.clientId,
      metadata: {
        requestedScopes: args.requestedScopes,
        redirectUri: args.redirectUri,
      },
      createdAt: args.now,
    });
    return { flowId };
  },
});
