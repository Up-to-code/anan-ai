import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { isOfferOwner, requireSender } from "../access";
import type { CreateOfferArgs } from "./types";

function assertEditablePrivateDraft(args: {
  offer: {
    visibility?: "public" | "private";
    publicationState?: "draft" | "published" | "archived";
    status: "pending" | "accepted" | "rejected";
    sourceConversationId?: Id<"inboxConversations">;
  };
  conversationId?: Id<"inboxConversations">;
}) {
  if ((args.offer.visibility ?? "private") !== "private") {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "Only private offers can be edited as conversation drafts",
    });
  }

  if ((args.offer.publicationState ?? "draft") !== "draft" || args.offer.status !== "pending") {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "Only pending draft offers can be edited",
    });
  }

  if (args.conversationId && args.offer.sourceConversationId !== args.conversationId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Offer does not belong to this conversation",
    });
  }
}

async function loadOwnedDraftContext(
  ctx: MutationCtx,
  args: { id: Id<"offers">; conversationId?: Id<"inboxConversations"> },
) {
  const access = await requireSender(ctx);
  const offer = await ctx.db.get(args.id);
  if (!offer) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Offer not found",
    });
  }

  if (!isOfferOwner(offer, access)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Only offer owner can edit draft",
    });
  }

  assertEditablePrivateDraft({
    offer,
    conversationId: args.conversationId,
  });

  return { access, offer };
}

/**
 * WHY:   Inbox-originated private drafts need a narrow owner-only update path before activation.
 * WHAT:  Updates the editable fields of one private draft offer while it remains pending.
 * HOW:   Requires sender ownership, validates the linked conversation when provided, reloads the property, then patches the draft fields.
 */
export async function updateOfferDraftService(
  ctx: MutationCtx,
  args: {
    id: Id<"offers">;
    conversationId?: Id<"inboxConversations">;
    propertyId: Id<"properties">;
    price: number;
    message?: string;
    description?: string;
    attachments?: CreateOfferArgs["attachments"];
  },
) {
  const { offer } = await loadOwnedDraftContext(ctx, {
    id: args.id,
    conversationId: args.conversationId,
  });

  const property = await ctx.db.get(args.propertyId);
  if (!property) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Property not found",
    });
  }

  await ctx.db.patch(args.id, {
    propertyId: args.propertyId,
    price: args.price,
    message: args.message,
    description: args.description,
    attachments: args.attachments,
    sourceConversationId: offer.sourceConversationId,
  });

  return { ok: true } as const;
}
