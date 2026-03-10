import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

/** Minimal notifications feed - recent orders requiring attention. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    await requireRole(ctx, ["admin"]);
    const orders = await ctx.db.query("orders").order("desc").take(limit ?? 20);
    return orders.map((o) => ({
      id: o._id,
      type: "order" as const,
      userId: o.userId,
      status: o.status,
      createdAt: o._creationTime,
      orderId: o._id,
    }));
  },
});
