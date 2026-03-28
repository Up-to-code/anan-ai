import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { requireVerifiedSender } from "../access";
import { notifyOfferSenderApplied } from "./sideEffects";

function assertOfferCanBeApplied(offer: any) {
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
}

async function acceptOfferForApplicant(ctx: MutationCtx, args: {
  offerId: Id<"offers">;
  offer: any;
  access: Awaited<ReturnType<typeof requireVerifiedSender>>;
  message?: string;
}) {
  await ctx.db.patch(args.offerId, {
    status: "accepted",
    toBrokerId: args.access.brokerId,
    toREDId: args.access.REDId,
    recipientAuthUserId: args.access.authUserId,
    message: args.message ?? args.offer.message,
  });
}

async function insertAppliedOfferDeal(ctx: MutationCtx, args: {
  offer: any;
  access: Awaited<ReturnType<typeof requireVerifiedSender>>;
  propertyTitle?: string;
}) {
  const now = Date.now();
  await ctx.db.insert("deals", {
    createdAt: now,
    title: `عرض عام مقبول — ${args.propertyTitle ?? "عقار"}`,
    value: args.offer.price,
    stage: "new",
    relationType: "broker_managed",
    REDId: args.offer.fromREDId ?? args.access.REDId,
    brokerId: args.offer.fromBrokerId ?? args.access.brokerId,
    relatedBrokerId: args.offer.fromBrokerId ?? args.access.brokerId,
    propertyId: args.offer.propertyId,
    offerId: args.offer._id,
    lastUpdatedBy: args.access.authUserId,
  });
}

type ApplyToOfferArgs = { offerId: Id<"offers">; message?: string };

/**
 * WHY:   Public-offer applications should stay separate from targeted recipient responses because the access and patch rules differ.
 * WHAT:  Accepts a public offer on behalf of the current verified sender and creates the linked deal.
 * HOW:   Verifies the offer is public and publishable, patches the recipient fields, creates the deal, and notifies the sender.
 */
export async function applyToOfferService(
  ctx: MutationCtx,
  args: ApplyToOfferArgs,
) {
  const access = await requireVerifiedSender(ctx);
  const offer = await ctx.db.get(args.offerId);
  if (!offer) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Offer not found",
    });
  }
  assertOfferCanBeApplied(offer);
  const property = await ctx.db.get(offer.propertyId);
  await Promise.all([
    acceptOfferForApplicant(ctx, {
      offerId: args.offerId,
      offer,
      access,
      message: args.message,
    }),
    insertAppliedOfferDeal(ctx, {
      offer,
      access,
      propertyTitle: property?.title,
    }),
  ]);
  const delivery = await notifyOfferSenderApplied(ctx, {
    applicantUserId: access.authUserId,
    offer,
    propertyTitle: property?.title ?? offer.message ?? offer.description ?? "عرض عام",
  });
  return { offerId: offer._id, ...delivery };
}
