import { mutation, query } from "../../_generated/server";
import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

async function getCurrentProfile(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q: any) => q.eq("authUserId", identity.subject))
    .first();
  return { identity, profile };
}

export const getBrokerProfile = query({
  args: {},
  handler: async (ctx) => {
    const current = await getCurrentProfile(ctx);
    if (!current?.profile || current.profile.isActive === false || !current.profile.brokerId) return null;
    return ctx.db.get(current.profile.brokerId);
  },
});

export const getREDProfile = query({
  args: {},
  handler: async (ctx) => {
    const current = await getCurrentProfile(ctx);
    if (!current?.profile || current.profile.isActive === false || !current.profile.REDId) return null;
    return ctx.db.get(current.profile.REDId);
  },
});

export const deactivateMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const current = await getCurrentProfile(ctx);
    if (!current?.profile) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
    }
    await ctx.db.patch(current.profile._id, { isActive: false });
    return { ok: true } as const;
  },
});
