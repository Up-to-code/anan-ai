import { query } from "../../_generated/server";
import { requireCurrentProfile } from "../lib/profile";

export const getAssistantEntitlement = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireCurrentProfile(ctx);

    const broker = profile.brokerId ? await ctx.db.get(profile.brokerId) : null;
    const red = profile.REDId ? await ctx.db.get(profile.REDId) : null;

    const verified = profile.brokerId ? broker?.isVerified === true : profile.REDId ? red?.isVerified === true : true;

    const sub =
      profile.brokerId
        ? await ctx.db
            .query("subscriptions")
            .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", profile.brokerId!))
            .first()
        : profile.REDId
          ? await ctx.db
              .query("subscriptions")
              .withIndex("ownerREDId", (q) => q.eq("ownerREDId", profile.REDId!))
              .first()
          : null;

    const hasActiveSubscription = !!sub && (sub.status === "active" || sub.status === "trial");
    const actionModeEnabled = verified && hasActiveSubscription && sub?.actionModeEnabled === true;

    return {
      verified,
      hasActiveSubscription,
      actionModeEnabled,
      mode: actionModeEnabled ? ("action" as const) : ("qa" as const),
      subscription: sub ?? null,
    };
  },
});

/**
 * Safe variant for bootstrap: returns a non-throwing entitlement when auth is not ready.
 */
export const getAssistantEntitlementSafe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        verified: false,
        hasActiveSubscription: false,
        actionModeEnabled: false,
        mode: "qa" as const,
      subscription: null,
    };
    }
    try {
      const profile = await requireCurrentProfile(ctx);

      const broker = profile.brokerId ? await ctx.db.get(profile.brokerId) : null;
      const red = profile.REDId ? await ctx.db.get(profile.REDId) : null;

      const verified = profile.brokerId ? broker?.isVerified === true : profile.REDId ? red?.isVerified === true : true;

      const sub =
        profile.brokerId
          ? await ctx.db
              .query("subscriptions")
              .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", profile.brokerId!))
              .first()
          : profile.REDId
            ? await ctx.db
                .query("subscriptions")
                .withIndex("ownerREDId", (q) => q.eq("ownerREDId", profile.REDId!))
                .first()
            : null;

      const hasActiveSubscription = !!sub && (sub.status === "active" || sub.status === "trial");
      const actionModeEnabled = verified && hasActiveSubscription && sub?.actionModeEnabled === true;

      return {
        verified,
        hasActiveSubscription,
        actionModeEnabled,
        mode: actionModeEnabled ? ("action" as const) : ("qa" as const),
        subscription: sub ?? null,
      };
    } catch (_e) {
      return {
        verified: false,
        hasActiveSubscription: false,
        actionModeEnabled: false,
        mode: "qa" as const,
        subscription: null,
      };
    }
  },
});
