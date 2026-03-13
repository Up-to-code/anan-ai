import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { requireVerifiedSender } from "../access";
import { notifyOfferSenderApplied } from "./sideEffects";

/**
 * WHY:   Public-offer applications should stay separate from targeted recipient responses because the access and patch rules differ.
 * WHAT:  Accepts a public offer on behalf of the current verified sender and creates the linked deal.
 * HOW:   Verifies the offer is public and publishable, patches the recipient fields, creates the deal, and notifies the sender.
 */
export async function applyToOfferService(
  ctx: MutationCtx,
  args: { offerId: Id<"offers">; message?: string },
) {
  const access = await requireVerifiedSender(ctx);

  const offer = await ctx.db.get(args.offerId);
  if (!offer) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Offer not found",
    });
  }
  if (offer.visibility !== "public") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Cannot apply to a private offer",
    });
  }
  if (offer.publicationState === "draft" || offer.publicationState === "archived") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Cannot apply to an unpublished offer",
    });
  }
  if (offer.status !== "pending" || offer.toBrokerId || offer.toREDId || offer.recipientAuthUserId) {
    throw new ConvexError({
      code: "INVALID_STATE",
      message: "This public offer is no longer available",
    });
  }

  await ctx.db.patch(args.offerId, {
    status: "accepted",
    toBrokerId: access.brokerId,
    toREDId: access.REDId,
    recipientAuthUserId: access.authUserId,
    message: args.message ?? offer.message,
  });

  const property = await ctx.db.get(offer.propertyId);
  await ctx.db.insert("deals", {
    title: `عرض عام مقبول — ${property?.title ?? "عقار"}`,
    value: offer.price,
    stage: "new",
    REDId: offer.fromREDId ?? access.REDId,
    brokerId: offer.fromBrokerId ?? access.brokerId,
    propertyId: offer.propertyId,
    offerId: offer._id,
  });

  const delivery = await notifyOfferSenderApplied(ctx, {
    applicantUserId: access.authUserId,
    offer,
    propertyTitle: property?.title ?? offer.message ?? offer.description ?? "عرض عام",
  });

  return {
    offerId: offer._id,
    ...delivery,
  };
}
