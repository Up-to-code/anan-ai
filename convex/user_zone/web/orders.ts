import { getAuthUserId } from "../../_core/security/authIdentity";
import { v } from "convex/values";
import { query } from "../../_generated/server";
import { buildMobilePropertyFeedItem } from "../mobile/feed";
import { clientOrderDetailValidator } from "./contracts";

/**
 * WHY:   The buyer handoff confirmation page should read the real CRM order instead of local browser state.
 * WHAT:  Returns one buyer-owned order with optional linked property detail.
 * HOW:   Checks the signed-in buyer id against the order owner, then maps the property through the shared buyer DTO builder.
 */
export const getClientOrderDetail = query({
  args: {
    orderId: v.id("orders"),
  },
  returns: v.union(clientOrderDetailValidator, v.null()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) return null;

    const property =
      order.propertyId
        ? await ctx.db.get(order.propertyId)
        : null;

    return {
      orderId: order._id,
      status: order.status,
      type: order.type,
      intent: order.intent,
      notes: order.notes,
      assignedTo: order.assignedTo,
      threadId: order.threadId,
      sourceChannel: order.sourceChannel,
      property:
        property && (!property.publicationState || property.publicationState === "published")
          ? await buildMobilePropertyFeedItem(ctx as never, property as never)
          : null,
    };
  },
});
