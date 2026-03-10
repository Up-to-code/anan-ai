import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

const orderStatusValidator = v.union(
  v.literal("new_lead"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("offer_made"),
  v.literal("under_contract"),
  v.literal("closed_won"),
  v.literal("closed_lost"),
);

export const listOrders = query({
  args: { status: v.optional(orderStatusValidator) },
  handler: async (ctx, { status }) => {
    await requireRole(ctx, ["admin"]);
    if (status) {
      return ctx.db
        .query("orders")
        .withIndex("status", (q) => q.eq("status", status))
        .collect();
    }
    return ctx.db.query("orders").collect();
  },
});

export const getOrder = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin"]);
    return ctx.db.get(id);
  },
});

export const updateOrder = mutation({
  args: {
    id: v.id("orders"),
    status: v.optional(orderStatusValidator),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireRole(ctx, ["admin"]);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Order not found");
    const filtered = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    if (Object.keys(filtered).length > 0) {
      await ctx.db.patch(id, filtered);
    }
  },
});
