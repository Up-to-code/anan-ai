import { ConvexError } from "convex/values";
import type { Id } from "../../_generated/dataModel";

export function assertNonEmptyMessage(body: string) {
  const trimmed = body.trim();
  if (!trimmed) {
    throw new ConvexError({ code: "INVALID_MESSAGE", message: "Message body is required" });
  }
  return trimmed;
}

export function buildSendConversationResponse(args: {
  conversationId: Id<"inboxConversations">;
  messageId: Id<"inboxMessages">;
  clientRequestId?: string;
}) {
  return {
    conversationId: args.conversationId,
    messageId: args.messageId,
    clientRequestId: args.clientRequestId ?? null,
  };
}

export function resolveOfferConversationTargets(offer: any, access: any) {
  const isCurrentUserSender =
    (access.brokerId && offer.fromBrokerId === access.brokerId) ||
    (access.REDId && offer.fromREDId === access.REDId);
  return {
    targetUserId: isCurrentUserSender ? offer.recipientAuthUserId ?? undefined : undefined,
    targetBrokerId: isCurrentUserSender ? offer.toBrokerId ?? undefined : offer.fromBrokerId ?? undefined,
    targetREDId: isCurrentUserSender ? offer.toREDId ?? undefined : offer.fromREDId ?? undefined,
  };
}

export function assertMessageableOfferTarget(targets: {
  targetUserId?: string;
  targetBrokerId?: Id<"brokers">;
  targetREDId?: Id<"RED">;
}) {
  if (targets.targetUserId || targets.targetBrokerId || targets.targetREDId) {
    return;
  }
  throw new ConvexError({
    code: "INVALID_TARGET",
    message: "No messageable offer partner is available for this offer",
  });
}

export function buildOfferBootstrapEventPayload(args: {
  offer: any;
  propertyTitle: string | undefined;
  senderUserId: string;
  targets: { targetUserId?: string; targetBrokerId?: Id<"brokers">; targetREDId?: Id<"RED"> };
}) {
  const { offer, propertyTitle, senderUserId, targets } = args;
  return {
    senderUserId,
    targetUserId: targets.targetUserId,
    recipientBrokerId: targets.targetBrokerId,
    recipientREDId: targets.targetREDId,
    offerId: offer._id,
    propertyId: offer.propertyId,
    title: propertyTitle ?? offer.message ?? offer.description ?? "عرض عقاري",
    body: `نبدأ الحديث حول ${propertyTitle ?? offer.message ?? "هذا العرض"}`,
    href: `/ws/offers/${offer._id}`,
    price: offer.price,
    visibility: offer.visibility ?? "private",
    bootstrapSource: "offer_detail" as const,
    metadata: {
      description: offer.description ?? null,
    },
  };
}
