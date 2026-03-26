import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { isOfferOwner, requireVerifiedSender } from "../access";
import { notifyOfferRecipient } from "./sideEffects";

async function loadOwnedOfferForPublish(
  ctx: MutationCtx,
  offerId: Id<"offers">,
) {
  const access = await requireVerifiedSender(ctx);
  const offer = await ctx.db.get(offerId);
  if (!offer) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Offer not found",
    });
  }

  if (!isOfferOwner(offer, access)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Only offer owner can publish draft",
    });
  }

  return { access, offer };
}

function assertOfferIsPublishable(offer: {
  publicationState?: "draft" | "published" | "archived";
  status: "pending" | "accepted" | "rejected";
}) {
  if ((offer.publicationState ?? "draft") !== "draft") {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "Only draft offers can be published",
    });
  }

  if (offer.status !== "pending") {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "Only pending offers can be published",
    });
  }
}

/**
 * WHY:   Publishing should stay isolated from other offer transitions so ownership and verification rules remain easy to audit.
 * WHAT:  Publishes one owned draft offer.
 * HOW:   Requires a verified sender, loads the offer, validates ownership, then patches the publication state.
 */
export async function publishOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offers"> },
) {
  const { offer } = await loadOwnedOfferForPublish(ctx, args.id);
  assertOfferIsPublishable(offer);

  await ctx.db.patch(args.id, { publicationState: "published" });
  return { ok: true } as const;
}

/**
 * WHY:   Inbox-originated drafts should notify the intended recipient only when the sender explicitly activates the offer.
 * WHAT:  Publishes one conversation-linked private offer and creates its inbox + notification side effects.
 * HOW:   Validates sender ownership, checks the linked conversation id, publishes the draft, then reuses the shared recipient delivery helper.
 */
export async function publishConversationOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offers">; conversationId: Id<"inboxConversations"> },
) {
  const { access, offer } = await loadOwnedOfferForPublish(ctx, args.id);
  assertOfferIsPublishable(offer);

  if (offer.visibility !== "private") {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "Only private offers can be published from a conversation",
    });
  }

  if (offer.sourceConversationId !== args.conversationId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Offer does not belong to this conversation",
    });
  }

  const property = await ctx.db.get(offer.propertyId);
  if (!property) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Property not found",
    });
  }

  await ctx.db.patch(args.id, { publicationState: "published" });

  const delivery = await notifyOfferRecipient(ctx, {
    senderUserId: access.authUserId,
    offerId: offer._id,
    propertyId: offer.propertyId,
    propertyTitle: property.title,
    price: offer.price,
    visibility: offer.visibility ?? "private",
    toBrokerId: offer.toBrokerId ?? undefined,
    toREDId: offer.toREDId ?? undefined,
    recipientAuthUserId: offer.recipientAuthUserId,
    message: offer.message,
  });

  return {
    offerId: offer._id,
    ...delivery,
  };
}
