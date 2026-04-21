import { ConvexError, v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { buildQualificationNotes } from "../mobile/assistant";
import { mobileQualificationContextValidator } from "../mobile/contracts";
import { isPropertyDistributionReady } from "../../shared_logic/projects/readiness";

/**
 * WHY:   WhatsApp-qualified buyers must land in the same CRM pipeline used by the rest of the buyer surfaces.
 * WHAT:  Persists a qualified property order for a WhatsApp buyer conversation.
 * HOW:   Reuses the mobile qualification note builder while stamping WhatsApp-specific source metadata.
 */
export const createQualifiedWhatsAppHandoff = internalMutation({
  args: {
    propertyId: v.id("properties"),
    userId: v.string(),
    message: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    qualification: v.optional(mobileQualificationContextValidator),
  },
  returns: v.object({
    orderId: v.id("orders"),
    status: v.literal("qualified"),
  }),
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property || !isPropertyDistributionReady(property)) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Property not found for WhatsApp handoff" });
    }

    // Preserve the assistant thread reference so review/debug can trace the CRM handoff to the chat turn.
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      type: "property",
      status: "qualified",
      propertyId: args.propertyId,
      REDId: property.REDId,
      intent: "whatsapp_ai_handoff",
      notes: buildQualificationNotes(
        args.message,
        args.qualification,
        property.title,
        "WhatsApp AI",
      ),
      assignedTo: property.brokerId ? `broker:${String(property.brokerId)}` : undefined,
      sourceChannel: "whatsapp",
      threadId: args.threadId ? String(args.threadId) : undefined,
    });

    return {
      orderId,
      status: "qualified" as const,
    };
  },
});
