import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";

const orderStatusValidator = v.union(
  v.literal("new_lead"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("offer_made"),
  v.literal("under_contract"),
  v.literal("closed_won"),
  v.literal("closed_lost"),
);

const orderChannelValidator = v.union(
  v.literal("whatsapp"),
  v.literal("app"),
  v.literal("web"),
);

const assignmentFilterValidator = v.union(
  v.literal("all"),
  v.literal("assigned"),
  v.literal("unassigned"),
);

export const listOrders = query({
  args: {
    status: v.optional(orderStatusValidator),
    sourceChannel: v.optional(orderChannelValidator),
    assignment: v.optional(assignmentFilterValidator),
  },
  handler: async (ctx, { status, sourceChannel, assignment }) => {
    await requireAdminAccess(ctx);
    const assignmentMode = assignment ?? "all";
    const baseOrders = status
      ? await ctx.db
          .query("orders")
          .withIndex("status", (q) => q.eq("status", status))
          .collect()
      : await ctx.db.query("orders").collect();

    const filtered = baseOrders.filter((order) => {
      if (sourceChannel && order.sourceChannel !== sourceChannel) {
        return false;
      }
      if (assignmentMode === "assigned" && !order.assignedTo) {
        return false;
      }
      if (assignmentMode === "unassigned" && order.assignedTo) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => b._creationTime - a._creationTime);

    return filtered;
  },
});

export const getOrder = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    await requireAdminAccess(ctx);
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
    await requireAdminAccess(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "Order not found" });
    const filtered = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    if (Object.keys(filtered).length > 0) {
      await ctx.db.patch(id, filtered);
    }
  },
});
