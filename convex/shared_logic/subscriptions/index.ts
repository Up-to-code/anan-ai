import { query } from "../../_generated/server";
import { requireCurrentProfile } from "../lib/profile";

export type AssistantEntitlement = {
  verified: boolean;
  hasActiveSubscription: boolean;
  actionModeEnabled: boolean;
  mode: "action" | "qa";
  subscription: unknown | null;
};

export function buildDefaultEntitlement(): AssistantEntitlement {
  return {
    verified: false,
    hasActiveSubscription: false,
    actionModeEnabled: false,
    mode: "qa",
    subscription: null,
  };
}

function isActiveSubscriptionStatus(status: string | undefined) {
  return status === "active" || status === "trial";
}

async function getSubscriptionForProfile(ctx: any, profile: any) {
  if (profile.brokerId) {
    return ctx.db
      .query("subscriptions")
      .withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", profile.brokerId))
      .first();
  }
  if (profile.developerId) {
    return ctx.db
      .query("subscriptions")
      .withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", profile.developerId))
      .first();
  }
  return null;
}

async function resolveVerifiedState(ctx: any, profile: any) {
  if (profile.brokerId) {
    return (await ctx.db.get(profile.brokerId))?.isVerified === true;
  }
  if (profile.developerId) {
    return (await ctx.db.get(profile.developerId))?.isVerified === true;
  }
  return true;
}

export async function resolveAssistantEntitlementForProfile(ctx: any, profile: any): Promise<AssistantEntitlement> {
  const [verified, sub] = await Promise.all([
    resolveVerifiedState(ctx, profile),
    getSubscriptionForProfile(ctx, profile),
  ]);
  const hasActiveSubscription = !!sub && isActiveSubscriptionStatus(sub.status);
  const actionModeEnabled = verified && hasActiveSubscription && sub?.actionModeEnabled === true;
  return {
    verified,
    hasActiveSubscription,
    actionModeEnabled,
    mode: actionModeEnabled ? "action" : "qa",
    subscription: sub ?? null,
  };
}

export async function resolveAssistantEntitlementForCurrentProfile(
  ctx: any,
  options?: { safe?: boolean },
): Promise<AssistantEntitlement> {
  if (options?.safe) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return buildDefaultEntitlement();
    }
    try {
      const profile = await requireCurrentProfile(ctx);
      return resolveAssistantEntitlementForProfile(ctx, profile);
    } catch (_error) {
      return buildDefaultEntitlement();
    }
  }

  const profile = await requireCurrentProfile(ctx);
  return resolveAssistantEntitlementForProfile(ctx, profile);
}

export const getAssistantEntitlement = query({
  args: {},
  handler: async (ctx) => resolveAssistantEntitlementForCurrentProfile(ctx),
});

/**
 * Safe variant for bootstrap: returns a non-throwing entitlement when auth is not ready.
 */
export const getAssistantEntitlementSafe = query({
  args: {},
  handler: async (ctx) =>
    resolveAssistantEntitlementForCurrentProfile(ctx, { safe: true }),
});
