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
  const ownerParticipant = offer.participants?.find((participant: any) => participant.role === "inventory_owner")
    ?? offer.participants?.find((participant: any) => participant.role === "client_owner")
    ?? null;
  const executionPartner = offer.participants?.find((participant: any) => participant.role === "execution_partner") ?? null;
  const isCurrentUserSender =
    ownerParticipant &&
    (ownerParticipant.authUserId === access.authUserId ||
      (access.brokerId ? ownerParticipant.organizationId === String(access.brokerId) : false) ||
      (access.REDId ? ownerParticipant.organizationId === String(access.REDId) : false));
  return {
    targetUserId: isCurrentUserSender ? executionPartner?.authUserId ?? undefined : ownerParticipant?.authUserId ?? undefined,
    targetBrokerId: isCurrentUserSender
      ? executionPartner?.organizationType === "broker"
        ? executionPartner.organizationId
        : undefined
      : ownerParticipant?.organizationType === "broker"
        ? ownerParticipant.organizationId
        : undefined,
    targetREDId: isCurrentUserSender
      ? executionPartner?.organizationType === "developer"
        ? executionPartner.organizationId
        : undefined
      : ownerParticipant?.organizationType === "developer"
        ? ownerParticipant.organizationId
        : undefined,
  };
}

export function assertMessageableOfferTarget(targets: {
  targetUserId?: string;
  targetBrokerId?: string;
  targetREDId?: string;
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
  targets: { targetUserId?: string; targetBrokerId?: string; targetREDId?: string };
}) {
  const { offer, propertyTitle, senderUserId, targets } = args;
  return {
    senderUserId,
    targetUserId: targets.targetUserId,
    recipientBrokerId: targets.targetBrokerId as Id<"brokers"> | undefined,
    recipientREDId: targets.targetREDId as Id<"RED"> | undefined,
    offerId: offer.id,
    propertyId: offer.propertyId,
    title: propertyTitle ?? offer.message ?? offer.description ?? "عرض عقاري",
    body: `نبدأ الحديث حول ${propertyTitle ?? offer.message ?? "هذا العرض"}`,
    href: `/ws/offers/${offer.id}`,
    price: offer.price,
    visibility: offer.visibility ?? "private",
    bootstrapSource: "offer_detail" as const,
    metadata: {
      description: offer.description ?? null,
    },
  };
}
