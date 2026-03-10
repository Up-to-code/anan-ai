import { ConvexError } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  isOfferOwner,
  requireOfferSession,
  requireSender,
  requireVerifiedSender,
} from "./access";
import { resolveOfferRecipient } from "./recipients";

type CreateOfferArgs = {
  propertyId: Id<"properties">;
  price: number;
  message?: string;
  description?: string;
  visibility?: "public" | "private";
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
  recipientEmail?: string;
  recipientPhone?: string;
  documentIds?: Id<"_storage">[];
};

/**
 * WHY:   Offer creation should keep sender auth and recipient lookup separate from query logic.
 * WHAT:  Creates a draft offer owned by the current broker or RED.
 * HOW:   Resolves the sender, loads the property, resolves private recipients, and inserts the offer row.
 */
export async function createOfferService(ctx: MutationCtx, args: CreateOfferArgs) {
  const access = await requireSender(ctx);
  const property = await ctx.db.get(args.propertyId);
  if (!property) throw new Error("Property not found");

  const visibility = args.visibility ?? "private";
  const { toBrokerId, toREDId } = await resolveOfferRecipient(ctx, {
    visibility,
    toBrokerId: args.toBrokerId,
    toREDId: args.toREDId,
    recipientEmail: args.recipientEmail,
    recipientPhone: args.recipientPhone,
  });

  return ctx.db.insert("offers", {
    propertyId: args.propertyId,
    fromBrokerId: access.brokerId,
    fromREDId: access.REDId,
    toBrokerId,
    toREDId,
    price: args.price,
    message: args.message,
    description: args.description,
    publicationState: "draft",
    visibility,
    recipientEmail: args.recipientEmail,
    recipientPhone: args.recipientPhone,
    documentIds: args.documentIds,
    status: "pending",
  });
}

/**
 * WHY:   Only the sender of a verified organization should be able to publish an offer.
 * WHAT:  Publishes one owned draft offer.
 * HOW:   Enforces verification, loads the offer, validates ownership, then patches the publication state.
 */
export async function publishOfferService(
  ctx: MutationCtx,
  args: { id: Id<"offers"> },
) {
  const access = await requireVerifiedSender(ctx);
  const offer = await ctx.db.get(args.id);
  if (!offer) throw new Error("Offer not found");

  if (!isOfferOwner(offer, access)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Only offer owner can publish draft",
    });
  }

  await ctx.db.patch(args.id, { publicationState: "published" });
  return { ok: true } as const;
}

/**
 * WHY:   Offer recipients need to accept or reject targeted/public offers and create deals on acceptance.
 * WHAT:  Updates the offer status for the current recipient when allowed.
 * HOW:   Validates recipient visibility, patches the status, then inserts a deal for accepted offers.
 */
export async function updateOfferStatusService(
  ctx: MutationCtx,
  args: { id: Id<"offers">; status: "accepted" | "rejected" },
) {
  const access = await requireSender(ctx);
  const { authUserId } = await requireOfferSession(ctx);

  const offer = await ctx.db.get(args.id);
  if (!offer) throw new Error("Offer not found");

  const isRecipient =
    (offer.toBrokerId && offer.toBrokerId === access.brokerId) ||
    (offer.toREDId && offer.toREDId === access.REDId);

  if (!isRecipient && offer.visibility !== "public") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Unauthorized" });
  }

  await ctx.db.patch(args.id, { status: args.status });

  if (args.status === "accepted") {
    const property = await ctx.db.get(offer.propertyId);
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
}

/**
 * WHY:   Public offers need a separate apply flow for verified brokers and REDs.
 * WHAT:  Accepts a public offer on behalf of the current verified sender and creates the linked deal.
 * HOW:   Validates the offer visibility/publication state, patches recipient fields, then inserts the deal.
 */
export async function applyToOfferService(
  ctx: MutationCtx,
  args: { offerId: Id<"offers">; message?: string },
) {
  const access = await requireVerifiedSender(ctx);

  const offer = await ctx.db.get(args.offerId);
  if (!offer) throw new Error("Offer not found");
  if (offer.visibility !== "public") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Cannot apply to a private offer",
    });
  }
  if (
    offer.publicationState === "draft" ||
    offer.publicationState === "archived"
  ) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Cannot apply to an unpublished offer",
    });
  }

  await ctx.db.patch(args.offerId, {
    status: "accepted",
    toBrokerId: access.brokerId,
    toREDId: access.REDId,
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
}
