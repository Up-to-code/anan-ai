import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { requireSender } from "../access";
import { resolveOfferRecipient } from "../recipients";
import { notifyOfferRecipient, type OfferDeliveryResult } from "./sideEffects";
import type { CreateOfferArgs } from "./types";

function assertPrivateRecipientIsResolved(args: {
  visibility: "public" | "private";
  recipientAuthUserId?: string;
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
}) {
  if (args.visibility !== "private") return;
  if (args.recipientAuthUserId && (args.toBrokerId || args.toREDId)) return;
  throw new ConvexError({
    code: "INVALID_TARGET",
    message: "Private offers require one resolved recipient user and organization",
  });
}

async function loadCreateOfferContext(ctx: MutationCtx, args: CreateOfferArgs) {
  const access = await requireSender(ctx);
  const property = await ctx.db.get(args.propertyId);
  if (!property) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Property not found",
    });
  }
  const visibility = args.visibility ?? "private";
  const recipient = await resolveOfferRecipient(ctx, {
    visibility,
    toBrokerId: args.toBrokerId,
    toREDId: args.toREDId,
    recipientAuthUserId: args.recipientAuthUserId,
    recipientEmail: args.recipientEmail,
    recipientPhone: args.recipientPhone,
  });
  assertPrivateRecipientIsResolved({
    visibility,
    recipientAuthUserId: args.recipientAuthUserId,
    toBrokerId: recipient.toBrokerId,
    toREDId: recipient.toREDId,
  });
  return { access, property, visibility, ...recipient };
}

function buildCreateOfferPayload(args: {
  access: Awaited<ReturnType<typeof requireSender>>;
  toBrokerId?: Id<"brokers">;
  toREDId?: Id<"RED">;
  visibility: "public" | "private";
  request: CreateOfferArgs;
}) {
  const request = args.request;
  return {
    propertyId: request.propertyId,
    fromBrokerId: args.access.brokerId,
    fromREDId: args.access.REDId,
    toBrokerId: args.toBrokerId,
    toREDId: args.toREDId,
    recipientAuthUserId: request.recipientAuthUserId,
    price: request.price,
    message: request.message,
    description: request.description,
    publicationState: "draft" as const,
    visibility: args.visibility,
    recipientEmail: request.recipientEmail,
    recipientPhone: request.recipientPhone,
    sourceConversationId: request.sourceConversationId,
    attachments: request.attachments,
    status: "pending" as const,
  };
}

async function insertOfferRecord(
  ctx: MutationCtx,
  args: {
    access: Awaited<ReturnType<typeof requireSender>>;
    toBrokerId?: Id<"brokers">;
    toREDId?: Id<"RED">;
    visibility: "public" | "private";
    request: CreateOfferArgs;
  },
) {
  return ctx.db.insert(
    "offers",
    buildCreateOfferPayload({
      access: args.access,
      toBrokerId: args.toBrokerId,
      toREDId: args.toREDId,
      visibility: args.visibility,
      request: args.request,
    }),
  );
}

function buildDraftCreateResult(offerId: Id<"offers">) {
  return {
    offerId,
    conversationId: null,
    starterMessageCreated: false,
    notification: null,
  };
}

/**
 * WHY:   Offer creation should keep sender authorization, recipient lookup, persistence, and side effects in one focused flow.
 * WHAT:  Creates a draft offer owned by the current broker or RED.
 * HOW:   Resolves the sender, loads the property, resolves any private recipient, inserts the offer, and triggers recipient side effects.
 */
export async function createOfferService(ctx: MutationCtx, args: CreateOfferArgs) {
  const context = await loadCreateOfferContext(ctx, args);
  const offerId = await insertOfferRecord(ctx, {
    access: context.access,
    toBrokerId: context.toBrokerId,
    toREDId: context.toREDId,
    visibility: context.visibility,
    request: args,
  });
  const delivery: OfferDeliveryResult = await notifyOfferRecipient(ctx, {
    senderUserId: context.access.authUserId,
    offerId,
    propertyId: args.propertyId,
    propertyTitle: context.property.title,
    price: args.price,
    visibility: context.visibility,
    toBrokerId: context.toBrokerId,
    toREDId: context.toREDId,
    recipientAuthUserId: args.recipientAuthUserId,
    message: args.message,
  });
  return {
    offerId,
    ...delivery,
  };
}

/**
 * WHY:   Inbox-originated private offers need a true draft mode that does not notify the recipient before activation.
 * WHAT:  Creates a private draft offer owned by the current broker or RED and linked to an inbox conversation when provided.
 * HOW:   Reuses the standard sender/recipient validation flow, inserts the offer, and skips all recipient side effects.
 */
export async function createOfferDraftService(ctx: MutationCtx, args: CreateOfferArgs) {
  const context = await loadCreateOfferContext(ctx, args);
  const offerId = await insertOfferRecord(ctx, {
    access: context.access,
    toBrokerId: context.toBrokerId,
    toREDId: context.toREDId,
    visibility: context.visibility,
    request: args,
  });
  return buildDraftCreateResult(offerId);
}
