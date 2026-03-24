import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { action, query } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { AUTHORIZATION_CODE_TTL_MS } from "../../_core/oauth/constants";
import { createPairwiseSubject, randomToken, sha256Hex } from "../../_core/oauth/crypto";

// Avoid type cycles due to `internal.*` being derived from the full module graph (including this file).
const oauthInternal = internal.shared_logic.oauth.internal as any;

/**
 * WHY:   The consent page must load app metadata and the user's current grant state.
 * WHAT:  Returns the sanitized consent prompt for a pending authorization flow.
 * HOW:   Resolves the authenticated Convex Auth user id and delegates to an internal query.
 */
export const getAuthorizationPrompt = query({
  args: {
    flowId: v.id("oauthFlowState"),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }
    return ctx.runQuery(oauthInternal.getAuthorizationPrompt, {
      flowId: args.flowId,
      userId,
    });
  },
});

/**
 * WHY:   App approval needs a public entry point reachable from the consent page.
 * WHAT:  Creates an authorization grant and returns the partner redirect URL containing the auth code.
 * HOW:   Generates raw code material in an action, persists only its hash, and builds the redirect response.
 */
export const approveAuthorization = action({
  args: {
    flowId: v.id("oauthFlowState"),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }

    const code = randomToken(32);
    const codeHash = await sha256Hex(code);
    const pairwiseSubject = await createPairwiseSubject(String(userId), (await ctx.runQuery(
      oauthInternal.getAuthorizationPrompt,
      { flowId: args.flowId, userId },
    )).client.clientId);
    const now = Date.now();

    const result = await ctx.runMutation(oauthInternal.persistAuthorizationApproval, {
      flowId: args.flowId,
      userId,
      pairwiseSubject,
      codeHash,
      expiresAt: now + AUTHORIZATION_CODE_TTL_MS,
      now,
    });
    const redirect = new URL(result.redirectUri);
    redirect.searchParams.set("code", code);
    redirect.searchParams.set("state", result.state);
    return {
      redirectUrl: redirect.toString(),
    };
  },
});

/**
 * WHY:   The user security center needs a concise list of all currently connected apps.
 * WHAT:  Returns active app grants for the signed-in user.
 * HOW:   Resolves the auth user id and delegates to an internal listing query.
 */
export const listAuthorizedApps = query({
  args: {},
  handler: async (ctx): Promise<unknown> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }
    return ctx.runQuery(oauthInternal.listAuthorizationsForUser, { userId });
  },
});

/**
 * WHY:   Users need an app-specific detail screen before revoking access.
 * WHAT:  Returns one connected app grant for the signed-in user.
 * HOW:   Looks up the grant by current user id and requested client id.
 */
export const getAuthorizedAppDetail = query({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }
    return ctx.runQuery(oauthInternal.getAuthorizationDetailForUser, {
      userId,
      clientId: args.clientId,
    });
  },
});

/**
 * WHY:   Connected apps must be revocable directly from the user security center.
 * WHAT:  Revokes the signed-in user's authorization for the selected client.
 * HOW:   Delegates the revocation write to an internal mutation keyed by current auth user id.
 */
export const revokeAuthorizedApp = action({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }
    return ctx.runMutation(oauthInternal.revokeAuthorizationForUser, {
      userId,
      clientId: args.clientId,
      now: Date.now(),
    });
  },
});
