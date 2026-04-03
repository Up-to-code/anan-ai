import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import type { Id } from "../../_generated/dataModel";
import { requireRole } from "../../_core/security/accessPolicy";
import { createWorkspaceNotification } from "../notifications";
import { enforceHttpRateLimit } from "../lib/middleware/rateLimit";
import { getConversationParticipant, resolveConversationInternal } from "./conversations";
import { getProfileByAuthUserId } from "./profiles";
import { appendInboxOfferEvent } from "./offerEvents";
import { getOfferLiveStateService } from "../offers/index";
import {
  assertNonEmptyMessage,
  assertMessageableOfferTarget,
  buildSendConversationResponse,
  buildOfferBootstrapEventPayload,
  resolveOfferConversationTargets,
} from "./mutationHelpers";

export const resolveDirectConversation = mutation({
  args: {
    targetUserId: v.string(),
  },
  handler: async (ctx, { targetUserId }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const conversation = await resolveConversationInternal(ctx, access.authUserId, targetUserId);
    return conversation._id;
  },
});

async function resolveConversationForSend(params: {
  ctx: any;
  access: any;
  conversationId?: Id<"inboxConversations">;
  targetUserId?: string;
}) {
  const { ctx, access, conversationId, targetUserId } = params;
  if (conversationId) {
    return (await ctx.db.get(conversationId)) ?? null;
  }
  if (targetUserId) {
    return await resolveConversationInternal(ctx, access.authUserId, targetUserId);
  }
  return null;
}

function withClientRequestMetadata(
  metadata: unknown,
  clientRequestId: string | undefined
): Record<string, unknown> {
  const base = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {};
  return {
    ...base,
    ...(clientRequestId ? { clientRequestId } : {}),
  };
}

async function notifyRecipient(params: {
  ctx: any;
  recipientUserId: string;
  senderUserId: string;
  conversationId: Id<"inboxConversations">;
  body: string;
}) {
  const { ctx, recipientUserId, senderUserId, conversationId, body } = params;
  const senderProfile = await getProfileByAuthUserId(ctx, senderUserId);
  await createWorkspaceNotification(ctx, {
    userId: recipientUserId,
    type: "message",
    title: `رسالة جديدة من ${senderProfile?.name ?? senderProfile?.email ?? "مستخدم عنان"}`,
    summary: body.slice(0, 160),
    href: `/ws/inbox/${conversationId}`,
    source: "البريد الوارد",
    severity: "info",
    entityType: "conversation",
    entityId: conversationId,
    metadata: {
      conversationId,
      senderUserId,
    },
  });
}

async function resolveSendParticipants(params: {
  ctx: any;
  access: { authUserId: string };
  conversationId?: Id<"inboxConversations">;
  targetUserId?: string;
}) {
  const conversation = await resolveConversationForSend(params);
  if (!conversation) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found" });
  }

  const membership = await getConversationParticipant(params.ctx, conversation._id, params.access.authUserId);
  if (!membership) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Conversation not found" });
  }

  const recipientMembership = await getConversationParticipant(params.ctx, conversation._id, membership.otherUserId);
  if (!recipientMembership) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Recipient not found" });
  }

  return { conversation, membership, recipientMembership };
}

async function persistMessage(params: {
  ctx: any;
  conversationId: Id<"inboxConversations">;
  senderUserId: string;
  recipientUserId: string;
  type?: "text" | "offer_event" | "file_share" | "project_share" | "deal_share" | "invite_event" | "role_event";
  body: string;
  metadata: unknown;
  clientRequestId?: string;
}) {
  const now = Date.now();
  const messageId = await params.ctx.db.insert("inboxMessages", {
    conversationId: params.conversationId,
    senderUserId: params.senderUserId,
    recipientUserId: params.recipientUserId,
    type: params.type ?? "text",
    body: params.body,
    metadata: withClientRequestMetadata(params.metadata, params.clientRequestId),
    createdAt: now,
  });
  return { messageId, now };
}

async function syncConversationReadState(params: {
  ctx: any;
  now: number;
  conversationId: Id<"inboxConversations">;
  senderUserId: string;
  messagePreview: string;
  senderMembershipId: Id<"inboxConversationParticipants">;
  recipientMembershipId: Id<"inboxConversationParticipants">;
  recipientUnreadCount: number;
}) {
  await params.ctx.db.patch(params.conversationId, {
    updatedAt: params.now,
    lastMessageAt: params.now,
    lastMessagePreview: params.messagePreview,
    lastMessageSenderId: params.senderUserId,
  });
  await params.ctx.db.patch(params.senderMembershipId, {
    lastReadAt: params.now,
    unreadCount: 0,
    archivedAt: undefined,
    conversationUpdatedAt: params.now,
    lastMessageAt: params.now,
    lastMessagePreview: params.messagePreview,
    lastMessageSenderId: params.senderUserId,
  });
  await params.ctx.db.patch(params.recipientMembershipId, {
    unreadCount: params.recipientUnreadCount + 1,
    archivedAt: undefined,
    conversationUpdatedAt: params.now,
    lastMessageAt: params.now,
    lastMessagePreview: params.messagePreview,
    lastMessageSenderId: params.senderUserId,
  });
}

async function deliverConversationMessage(params: {
  ctx: any;
  access: { authUserId: string };
  conversation: { _id: Id<"inboxConversations"> };
  membership: { _id: Id<"inboxConversationParticipants">; otherUserId: string };
  recipientMembership: { _id: Id<"inboxConversationParticipants">; unreadCount: number };
  trimmedBody: string;
  clientRequestId?: string;
  type?: "text" | "offer_event" | "file_share" | "project_share" | "deal_share" | "invite_event" | "role_event";
  metadata: unknown;
}) {
  const { messageId, now } = await persistMessage({
    ctx: params.ctx,
    conversationId: params.conversation._id,
    senderUserId: params.access.authUserId,
    recipientUserId: params.membership.otherUserId,
    type: params.type,
    body: params.trimmedBody,
    metadata: params.metadata,
    clientRequestId: params.clientRequestId,
  });
  await syncConversationReadState({
    ctx: params.ctx,
    now,
    conversationId: params.conversation._id,
    senderUserId: params.access.authUserId,
    messagePreview: params.trimmedBody.slice(0, 140),
    senderMembershipId: params.membership._id,
    recipientMembershipId: params.recipientMembership._id,
    recipientUnreadCount: params.recipientMembership.unreadCount,
  });
  await notifyRecipient({
    body: params.trimmedBody,
    conversationId: params.conversation._id,
    ctx: params.ctx,
    recipientUserId: params.membership.otherUserId,
    senderUserId: params.access.authUserId,
  });
  return messageId;
}

export const sendConversationMessage = mutation({
  args: {
    conversationId: v.optional(v.id("inboxConversations")),
    targetUserId: v.optional(v.string()),
    body: v.string(),
    clientRequestId: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("text"),
        v.literal("offer_event"),
        v.literal("file_share"),
        v.literal("project_share"),
        v.literal("deal_share"),
        v.literal("invite_event"),
        v.literal("role_event")
      )
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { conversationId, targetUserId, body, clientRequestId, type, metadata }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    await enforceHttpRateLimit(ctx, { key: `inbox:${access.authUserId}` });
    const trimmedBody = assertNonEmptyMessage(body);
    const { conversation, membership, recipientMembership } = await resolveSendParticipants({
      access,
      ctx,
      conversationId,
      targetUserId,
    });
    const messageId = await deliverConversationMessage({
      ctx,
      access,
      conversation,
      membership,
      recipientMembership,
      trimmedBody,
      clientRequestId,
      type,
      metadata,
    });
    return buildSendConversationResponse({
      conversationId: conversation._id,
      messageId,
      clientRequestId,
    });
  },
});

export const bootstrapOfferConversation = mutation({
  args: {
    offerId: v.string(),
  },
  handler: async (ctx, { offerId }) => {
    const access = await requireRole(ctx, ["broker", "RED"]);
    const offer = await getOfferLiveStateService(ctx, { offerId });
    if (!offer) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Offer not found" });
    }

    const targets = resolveOfferConversationTargets(offer, access);
    assertMessageableOfferTarget(targets);
    const starter = await appendInboxOfferEvent(
      ctx,
      buildOfferBootstrapEventPayload({
        offer,
        propertyTitle: offer.property?.title,
        senderUserId: access.authUserId,
        targets,
      }),
    );

    if (!starter) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Conversation participant not found",
      });
    }

    return {
      conversationId: starter.conversationId,
      starterMessageCreated: starter.starterMessageCreated,
    };
  },
});

export const markConversationRead = mutation({
  args: {
    conversationId: v.id("inboxConversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const membership = await getConversationParticipant(ctx, conversationId, access.authUserId);
    if (!membership) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Conversation not found" });
    }

    await ctx.db.patch(membership._id, {
      unreadCount: 0,
      lastReadAt: Date.now(),
    });
  },
});

export const setConversationArchived = mutation({
  args: {
    conversationId: v.id("inboxConversations"),
    archived: v.boolean(),
  },
  handler: async (ctx, { conversationId, archived }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const membership = await getConversationParticipant(ctx, conversationId, access.authUserId);
    if (!membership) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Conversation not found" });
    }

    await ctx.db.patch(membership._id, {
      archivedAt: archived ? Date.now() : undefined,
    });
  },
});
