import type { Doc, Id } from "../../../_generated/dataModel";
import type { MutationCtx } from "../../../_generated/server";
import { appendInboxOfferEvent } from "../../inbox";
import { createWorkspaceNotification } from "../../notifications";

type OfferPartyArgs = {
  brokerId?: Id<"brokers">;
  redId?: Id<"RED">;
};

async function findWorkspaceProfileByParty(ctx: MutationCtx, args: OfferPartyArgs) {
  const profiles = await ctx.db.query("userProfiles").collect();
  return profiles.find((profile) => (args.brokerId && profile.brokerId === args.brokerId) || (args.redId && profile.REDId === args.redId));
}

async function findWorkspaceProfileByAuthUserId(ctx: MutationCtx, authUserId?: string) {
  if (!authUserId) {
    return null;
  }

  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
    .first();
}

async function getOrganizationNameByParty(ctx: MutationCtx, args: OfferPartyArgs) {
  if (args.brokerId) {
    return (await ctx.db.get(args.brokerId))?.name ?? null;
  }

  if (args.redId) {
    return (await ctx.db.get(args.redId))?.name ?? null;
  }

  return null;
}

export type OfferDeliveryResult = {
  conversationId: Id<"inboxConversations"> | null;
  starterMessageCreated: boolean;
  notification: null | {
    notificationId: Id<"workspaceNotifications">;
    targetUserId: string;
    targetName: string;
    organizationName: string;
    href: string;
    pushStatus: "pending";
  };
};

/**
 * WHY:   New offers should generate one consistent recipient inbox event and optional workspace notification.
 * WHAT:  Creates the recipient-side offer event side effects for a newly created offer.
 * HOW:   Appends the inbox event first, then looks up the recipient profile and sends a workspace notification when possible.
 */
export async function notifyOfferRecipient(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    offerId: Id<"offers">;
    propertyId: Id<"properties">;
    propertyTitle: string;
    price: number;
    visibility: "public" | "private";
    toBrokerId?: Id<"brokers">;
    toREDId?: Id<"RED">;
    recipientAuthUserId?: string;
    message?: string;
    notificationType?: "offer_sent" | "offer_approved";
    notificationTitle?: string;
    notificationSummary?: string;
    notificationSeverity?: "info" | "warning" | "success";
    starterBody?: string;
    bootstrapSource?: "offer_send" | "offer_apply" | "offer_detail";
  },
): Promise<OfferDeliveryResult> {
  const recipientConversation = await appendInboxOfferEvent(ctx, {
    senderUserId: args.senderUserId,
    targetUserId: args.recipientAuthUserId,
    recipientBrokerId: args.toBrokerId,
    recipientREDId: args.toREDId,
    offerId: args.offerId,
    propertyId: args.propertyId,
    title: args.propertyTitle,
    body: args.starterBody ?? `تم إرسال عرض جديد على ${args.propertyTitle}`,
    href: `/ws/offers/${args.offerId}`,
    price: args.price,
    visibility: args.visibility,
    bootstrapSource: args.bootstrapSource ?? "offer_send",
    metadata: {
      propertyId: args.propertyId,
      price: args.price,
      visibility: args.visibility,
    },
  });

  const recipientProfile = await findWorkspaceProfileByParty(ctx, {
    brokerId: args.toBrokerId,
    redId: args.toREDId,
  });
  const targetedRecipientProfile = await findWorkspaceProfileByAuthUserId(ctx, args.recipientAuthUserId);
  const organizationName = (await getOrganizationNameByParty(ctx, {
    brokerId: args.toBrokerId,
    redId: args.toREDId,
  })) ?? targetedRecipientProfile?.name ?? recipientProfile?.name ?? "مستخدم عنان";

  const notificationTargetUserId = args.recipientAuthUserId ?? recipientProfile?.authUserId;
  if (!notificationTargetUserId) {
    return {
      conversationId: recipientConversation?.conversationId ?? null,
      starterMessageCreated: recipientConversation?.starterMessageCreated ?? false,
      notification: null,
    };
  }

  const href = recipientConversation
    ? `/ws/inbox/${recipientConversation.conversationId}`
    : `/ws/offers/${args.offerId}`;
  const notificationId = await createWorkspaceNotification(ctx, {
    userId: notificationTargetUserId,
    type: args.notificationType ?? "offer_sent",
    title: args.notificationTitle ?? `عرض جديد: ${args.propertyTitle}`,
    summary: args.notificationSummary ?? args.message ?? `تم إرسال عرض بقيمة ${args.price}`,
    href,
    source: "العروض",
    severity: args.notificationSeverity ?? "info",
    entityType: "offer",
    entityId: args.offerId,
    metadata: {
      propertyId: args.propertyId,
    },
  });

  return {
    conversationId: recipientConversation?.conversationId ?? null,
    starterMessageCreated: recipientConversation?.starterMessageCreated ?? false,
    notification: {
      notificationId,
      targetUserId: notificationTargetUserId,
      targetName:
        targetedRecipientProfile?.name ??
        recipientProfile?.name ??
        targetedRecipientProfile?.email ??
        recipientProfile?.email ??
        "مستخدم عنان",
      organizationName,
      href,
      pushStatus: "pending",
    },
  };
}

/**
 * WHY:   Offer senders should receive one consistent notification when a recipient accepts or rejects their offer.
 * WHAT:  Notifies the sending organization about a private/public offer status change.
 * HOW:   Resolves the sender profile from the offer owners and sends a status-specific workspace notification when present.
 */
export async function notifyOfferSenderStatus(
  ctx: MutationCtx,
  args: {
    offer: Doc<"offers">;
    status: "accepted" | "rejected";
  },
) {
  const senderProfile = await findWorkspaceProfileByParty(ctx, {
    brokerId: args.offer.fromBrokerId ?? undefined,
    redId: args.offer.fromREDId ?? undefined,
  });

  if (!senderProfile?.authUserId) {
    return;
  }

  await createWorkspaceNotification(ctx, {
    userId: senderProfile.authUserId,
    type: args.status === "accepted" ? "offer_approved" : "offer_rejected",
    title: args.status === "accepted" ? "تمت الموافقة على العرض" : "تم رفض العرض",
    summary: args.offer.message ?? args.offer.description ?? "تم تحديث حالة العرض من خلال المستلم.",
    href: `/ws/offers/${args.offer._id}`,
    source: "العروض",
    severity: args.status === "accepted" ? "success" : "warning",
    entityType: "offer",
    entityId: args.offer._id,
  });
}

/**
 * WHY:   Public-offer applications should create the same conversation + notification handoff as targeted offer sends.
 * WHAT:  Delivers the applicant's starter card and notification to the original offer owner.
 * HOW:   Treats the applicant as the sender and the original offer owner as the targeted recipient while reusing the shared delivery helper.
 */
export async function notifyOfferSenderApplied(
  ctx: MutationCtx,
  args: {
    applicantUserId: string;
    offer: Doc<"offers">;
    propertyTitle: string;
  },
) {
  return notifyOfferRecipient(ctx, {
    senderUserId: args.applicantUserId,
    offerId: args.offer._id,
    propertyId: args.offer.propertyId,
    propertyTitle: args.propertyTitle,
    price: args.offer.price,
    visibility: args.offer.visibility ?? "public",
    toBrokerId: args.offer.fromBrokerId ?? undefined,
    toREDId: args.offer.fromREDId ?? undefined,
    message: args.offer.message,
    notificationType: "offer_approved",
    notificationTitle: "تم قبول عرض عام",
    notificationSummary: args.offer.message ?? "تم ربط العرض العام بطرف مهتم جديد.",
    notificationSeverity: "success",
    starterBody: `يوجد طرف مهتم بهذا العرض: ${args.propertyTitle}`,
    bootstrapSource: "offer_apply",
  });
}
