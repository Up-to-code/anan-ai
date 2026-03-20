import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { requireOfferSession, requireSender } from "../access";
import { notifyOfferSenderStatus } from "./sideEffects";

function assertOfferCanBeResponded(offer: any, access: any, authUserId: string) {
  const isRecipient =
    offer.recipientAuthUserId === authUserId ||
    (offer.toBrokerId && offer.toBrokerId === access.brokerId) ||
    (offer.toREDId && offer.toREDId === access.REDId);
  if (!isRecipient) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Unauthorized" });
  }
  if (offer.status !== "pending") {
    throw new ConvexError({ code: "INVALID_STATE", message: "Offer was already processed" });
  }
}

async function createDealForAcceptedOffer(ctx: MutationCtx, offer: any, authUserId: string) {
  const property = (await ctx.db.get(offer.propertyId)) as any;
  await ctx.db.insert("deals", {
    title: `عرض مقبول — ${property?.title ?? "عقار"}`,
    description: offer.description ?? offer.message ?? "",
    value: offer.price,
    stage: "new",
    REDId: offer.fromREDId ?? offer.toREDId,
    brokerId: offer.fromBrokerId ?? offer.toBrokerId,
    propertyId: offer.propertyId,
    offerId: offer._id,
    lastUpdatedBy: authUserId,
  });
}

/**
 * WHY:   Recipient responses need one focused transition that owns authorization, status mutation, deal creation, and sender notifications.
 * WHAT:  Accepts or rejects one offer for the current recipient when allowed.
 * HOW:   Verifies recipient visibility, patches the offer status, creates a deal on acceptance, and notifies the sender.
 */
export async function updateOfferStatusService(
  ctx: MutationCtx,
  args: { id: Id<"offers">; status: "accepted" | "rejected" },
) {
  const access = await requireSender(ctx);
  const { authUserId } = await requireOfferSession(ctx);

  const offer = await ctx.db.get(args.id);
  if (!offer) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Offer not found",
    });
  }
  assertOfferCanBeResponded(offer, access, authUserId);

  await ctx.db.patch(args.id, { status: args.status });

  if (args.status === "accepted") {
    await createDealForAcceptedOffer(ctx, offer, authUserId);
  }

  await notifyOfferSenderStatus(ctx, {
    offer,
    status: args.status,
  });
}
