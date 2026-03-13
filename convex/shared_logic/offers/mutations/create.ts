import { ConvexError } from "convex/values";
import type { MutationCtx } from "../../../_generated/server";
import { requireSender } from "../access";
import { resolveOfferRecipient } from "../recipients";
import { notifyOfferRecipient, type OfferDeliveryResult } from "./sideEffects";
import type { CreateOfferArgs } from "./types";

/**
 * WHY:   Offer creation should keep sender authorization, recipient lookup, persistence, and side effects in one focused flow.
 * WHAT:  Creates a draft offer owned by the current broker or RED.
 * HOW:   Resolves the sender, loads the property, resolves any private recipient, inserts the offer, and triggers recipient side effects.
 */
export async function createOfferService(ctx: MutationCtx, args: CreateOfferArgs) {
  const access = await requireSender(ctx);
  const property = await ctx.db.get(args.propertyId);
  if (!property) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Property not found",
    });
  }

  const visibility = args.visibility ?? "private";
  const { toBrokerId, toREDId } = await resolveOfferRecipient(ctx, {
    visibility,
    toBrokerId: args.toBrokerId,
    toREDId: args.toREDId,
    recipientAuthUserId: args.recipientAuthUserId,
    recipientEmail: args.recipientEmail,
    recipientPhone: args.recipientPhone,
  });

  if (visibility === "private" && (!args.recipientAuthUserId || (!toBrokerId && !toREDId))) {
    throw new ConvexError({
      code: "INVALID_TARGET",
      message: "Private offers require one resolved recipient user and organization",
    });
  }

  const offerId = await ctx.db.insert("offers", {
    propertyId: args.propertyId,
    fromBrokerId: access.brokerId,
    fromREDId: access.REDId,
    toBrokerId,
    toREDId,
    recipientAuthUserId: args.recipientAuthUserId,
    price: args.price,
    message: args.message,
    description: args.description,
    publicationState: "draft",
    visibility,
    recipientEmail: args.recipientEmail,
    recipientPhone: args.recipientPhone,
    attachments: args.attachments,
    status: "pending",
  });

  const delivery: OfferDeliveryResult = await notifyOfferRecipient(ctx, {
    senderUserId: access.authUserId,
    offerId,
    propertyId: args.propertyId,
    propertyTitle: property.title,
    price: args.price,
    visibility,
    toBrokerId,
    toREDId,
    recipientAuthUserId: args.recipientAuthUserId,
    message: args.message,
  });

  return {
    offerId,
    ...delivery,
  };
}
