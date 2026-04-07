import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { mobileBuyerViewerValidator } from "./contracts";

/**
 * WHY:   The buyer mobile app needs one lightweight signed-in identity surface for account, handoff, and release-readiness states.
 * WHAT:  Returns the current buyer viewer profile when the request is authenticated, otherwise `null`.
 * HOW:   Resolves the auth user id, joins the persisted buyer profile and auth user row when available, and summarizes the buyer's qualified orders.
 */
export const getViewer = query({
  args: {},
  returns: v.union(mobileBuyerViewerValidator, v.null()),
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;

    const [profile, orders] = await Promise.all([
      ctx.db.query("userProfiles").withIndex("authUserId", (q) => q.eq("authUserId", authUserId)).first(),
      ctx.db.query("orders").withIndex("userId", (q) => q.eq("userId", authUserId)).collect(),
    ]);

    const normalizedUserId = ctx.db.normalizeId("users", authUserId);
    const authUser = normalizedUserId ? await ctx.db.get(normalizedUserId) : null;
    const qualifiedOrdersCount = orders.filter((order) =>
      order.status === "qualified" || order.status === "offer_made" || order.status === "under_contract" || order.status === "closed_won",
    ).length;

    return {
      id: normalizedUserId ? String(normalizedUserId) : undefined,
      authUserId,
      displayName:
        profile?.name ??
        authUser?.displayName ??
        authUser?.name ??
        authUser?.email ??
        "مستخدم عنان",
      email: profile?.email ?? authUser?.email ?? undefined,
      phone: authUser?.phone ?? undefined,
      role: profile?.role ?? "user",
      isAuthenticated: true,
      qualifiedOrdersCount,
    };
  },
});

