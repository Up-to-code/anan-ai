import { getAuthUserId } from "../../_core/security/authIdentity";
import { ConvexError, v } from "convex/values";
import { action, query } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { AUTHORIZATION_CODE_TTL_MS } from "../../_core/oauth/constants";
import { createPairwiseSubject, randomToken, sha256Hex } from "../../_core/oauth/crypto";
import { requireOrganizationMembership } from "../agencies/repositories/membership";
import { requireCurrentProfile } from "../lib/profile";

// Avoid type cycles due to `internal.*` being derived from the full module graph (including this file).
const oauthInternal = internal.shared_logic.oauth.internal as any;

function buildOwnerSubjectSeed(args: {
  ownerType: "broker" | "RED";
  ownerBrokerId?: string;
  ownerREDId?: string;
  tenantOrgId?: string;
}) {
  if (args.tenantOrgId) {
    return args.tenantOrgId;
  }
  return args.ownerType === "broker"
    ? `broker:${args.ownerBrokerId}`
    : `red:${args.ownerREDId}`;
}

/**
 * WHY:   The consent page must load app metadata and organization approval state for the signed-in user.
 * WHAT:  Returns the sanitized consent prompt for a pending authorization flow.
 * HOW:   Resolves the current auth profile and delegates to the internal org-aware prompt query.
 */
export const getAuthorizationPrompt = query({
  args: {
    flowId: v.id("oauthFlowState"),
    tenantOrgId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const profile = await requireCurrentProfile(ctx);
    return ctx.runQuery(oauthInternal.getAuthorizationPrompt, {
      flowId: args.flowId,
      authUserId: profile.authUserId,
      selectedTenantOrgId: args.tenantOrgId,
    });
  },
});

/**
 * WHY:   App approval needs a public entry point reachable from the consent page.
 * WHAT:  Creates an organization-scoped authorization grant and returns the partner redirect URL containing the auth code.
 * HOW:   Enforces manager access, generates raw code material in an action, persists only its hash, and builds the redirect response.
 */
export const approveAuthorization = action({
  args: {
    flowId: v.id("oauthFlowState"),
    tenantOrgId: v.string(),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }
    const prompt = await ctx.runQuery(oauthInternal.getAuthorizationPrompt, {
      flowId: args.flowId,
      authUserId: actorUserId,
      selectedTenantOrgId: args.tenantOrgId,
    });
    if (prompt.requiresOrganizationSelection || !prompt.selectedTenantOrgId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Organization selection is required" });
    }

    const code = randomToken(32);
    const codeHash = await sha256Hex(code);
    const pairwiseSubject = await createPairwiseSubject(
      buildOwnerSubjectSeed({
        ownerType: prompt.selectedOrganization.ownerType,
        tenantOrgId: prompt.selectedTenantOrgId,
      }),
      prompt.client.clientId,
    );
    const now = Date.now();

    const result = prompt.requiresConsent
      ? await (async () => {
          if (!prompt.canApproveSelectedOrganization) {
            throw new ConvexError({ code: "FORBIDDEN", message: "Manager role required" });
          }
          return ctx.runMutation(oauthInternal.persistAuthorizationApproval, {
            flowId: args.flowId,
            authUserId: actorUserId,
            actorUserId,
            selectedTenantOrgId: args.tenantOrgId,
            pairwiseSubject,
            codeHash,
            expiresAt: now + AUTHORIZATION_CODE_TTL_MS,
            now,
          });
        })()
      : await ctx.runMutation(oauthInternal.issueAuthorizationCodeForExistingGrant, {
          flowId: args.flowId,
          authUserId: actorUserId,
          actorUserId,
          selectedTenantOrgId: args.tenantOrgId,
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
 * WHY:   Organization settings need a concise list of all currently connected apps for the active org.
 * WHAT:  Returns active app grants for the signed-in user's current organization.
 * HOW:   Resolves the current organization membership and delegates to an internal org listing query.
 */
export const listAuthorizedApps = query({
  args: {},
  handler: async (ctx): Promise<unknown> => {
    const { owner } = await requireOrganizationMembership(ctx);
    return ctx.runQuery(oauthInternal.listAuthorizationsForOwner, {
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
    });
  },
});

/**
 * WHY:   Hidden compatibility routes may still resolve one connected app in the organization context.
 * WHAT:  Returns one connected app grant for the current organization.
 * HOW:   Looks up the grant by current owner scope and requested client id.
 */
export const getAuthorizedAppDetail = query({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const { owner } = await requireOrganizationMembership(ctx);
    return ctx.runQuery(oauthInternal.getAuthorizationDetailForOwner, {
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      clientId: args.clientId,
    });
  },
});

/**
 * WHY:   Connected apps must be revocable directly from organization settings by managers.
 * WHAT:  Revokes the current organization's authorization for the selected client.
 * HOW:   Enforces manager membership, then delegates the write to the internal owner-scoped revocation mutation.
 */
export const revokeAuthorizedApp = action({
  args: {
    clientId: v.string(),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
    }
    const { owner } = await ctx.runQuery(
      internal.shared_logic.agencies.repositories.membership.requireManagerAccessForCurrentUser,
      {},
    );
    return ctx.runMutation(oauthInternal.revokeAuthorizationForOwner, {
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      clientId: args.clientId,
      actorUserId,
      now: Date.now(),
    });
  },
});
