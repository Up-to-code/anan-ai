import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { getOrganizationNameByOwner, getProfileByAuthUserId, getUserImageByEmail } from "./profiles";
import { isOfferCardMetadata } from "./types";
import { normalizeDirectPair } from "./utils";

type ReadCtx = QueryCtx | MutationCtx;

export async function getConversationParticipant(
  ctx: ReadCtx,
  conversationId: Id<"inboxConversations">,
  userId: string
) {
  return ctx.db
    .query("inboxConversationParticipants")
    .withIndex("userId_conversationId", (q) =>
      q.eq("userId", userId).eq("conversationId", conversationId)
    )
    .unique();
}

function assertConversationParticipantsAreActive(args: {
  currentProfile: Awaited<ReturnType<typeof getProfileByAuthUserId>>;
  targetProfile: Awaited<ReturnType<typeof getProfileByAuthUserId>>;
}) {
  if (
    !args.currentProfile ||
    args.currentProfile.isActive === false ||
    !args.targetProfile ||
    args.targetProfile.isActive === false
  ) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Conversation participant not found",
    });
  }
}

async function createDirectConversation(ctx: MutationCtx, args: {
  currentUserId: string;
  pair: ReturnType<typeof normalizeDirectPair>;
}) {
  const now = Date.now();
  const conversationId = await ctx.db.insert("inboxConversations", {
    ...args.pair,
    createdByUserId: args.currentUserId,
    createdAt: now,
    updatedAt: now,
  });
  await Promise.all([
    ctx.db.insert("inboxConversationParticipants", {
      conversationId,
      userId: args.pair.firstParticipantUserId,
      otherUserId: args.pair.secondParticipantUserId,
      joinedAt: now,
      unreadCount: 0,
      archivedAt: undefined,
      conversationUpdatedAt: now,
      lastMessageAt: undefined,
      lastMessagePreview: undefined,
      lastMessageSenderId: undefined,
    }),
    ctx.db.insert("inboxConversationParticipants", {
      conversationId,
      userId: args.pair.secondParticipantUserId,
      otherUserId: args.pair.firstParticipantUserId,
      joinedAt: now,
      unreadCount: 0,
      archivedAt: undefined,
      conversationUpdatedAt: now,
      lastMessageAt: undefined,
      lastMessagePreview: undefined,
      lastMessageSenderId: undefined,
    }),
  ]);
  return conversationId;
}

export async function resolveConversationInternal(
  ctx: MutationCtx,
  currentUserId: string,
  targetUserId: string
) {
  if (currentUserId === targetUserId) {
    throw new ConvexError({
      code: "INVALID_TARGET",
      message: "Cannot start a conversation with yourself",
    });
  }
  const [currentProfile, targetProfile] = await Promise.all([
    getProfileByAuthUserId(ctx, currentUserId),
    getProfileByAuthUserId(ctx, targetUserId),
  ]);
  assertConversationParticipantsAreActive({ currentProfile, targetProfile });
  const pair = normalizeDirectPair(currentUserId, targetUserId);
  const existing = await ctx.db
    .query("inboxConversations")
    .withIndex("directKey", (q) => q.eq("directKey", pair.directKey))
    .unique();
  if (existing) return existing;
  const conversationId = await createDirectConversation(ctx, { currentUserId, pair });
  return (await ctx.db.get(conversationId))!;
}

async function loadConversationMembershipPair(ctx: MutationCtx, args: {
  conversationId: Id<"inboxConversations">;
  senderUserId: string;
  recipientUserId: string;
}) {
  const [senderMembership, recipientMembership] = await Promise.all([
    getConversationParticipant(ctx, args.conversationId, args.senderUserId),
    getConversationParticipant(ctx, args.conversationId, args.recipientUserId),
  ]);
  if (!senderMembership || !recipientMembership) {
    return null;
  }
  return { senderMembership, recipientMembership };
}

type ConversationEventArgs = {
  senderUserId: string;
  recipientUserId: string;
  type:
    | "text"
    | "offer_event"
    | "file_share"
    | "project_share"
    | "deal_share"
    | "invite_event"
    | "role_event";
  body: string;
  metadata: Record<string, unknown>;
};

async function persistConversationEvent(ctx: MutationCtx, args: {
  conversationId: Id<"inboxConversations">;
  event: ConversationEventArgs;
  senderMembershipId: Id<"inboxConversationParticipants">;
  recipientMembershipId: Id<"inboxConversationParticipants">;
  recipientUnreadCount: number;
}) {
  const now = Date.now();
  const messageId = await ctx.db.insert("inboxMessages", {
    conversationId: args.conversationId,
    senderUserId: args.event.senderUserId,
    recipientUserId: args.event.recipientUserId,
    type: args.event.type,
    body: args.event.body,
    metadata: args.event.metadata,
    createdAt: now,
  });
  await Promise.all([
    ctx.db.patch(args.conversationId, {
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: args.event.body.slice(0, 140),
      lastMessageSenderId: args.event.senderUserId,
    }),
    ctx.db.patch(args.senderMembershipId, {
      lastReadAt: now,
      unreadCount: 0,
      conversationUpdatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: args.event.body.slice(0, 140),
      lastMessageSenderId: args.event.senderUserId,
    }),
    ctx.db.patch(args.recipientMembershipId, {
      unreadCount: args.recipientUnreadCount + 1,
      conversationUpdatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: args.event.body.slice(0, 140),
      lastMessageSenderId: args.event.senderUserId,
    }),
  ]);
  return messageId;
}

export async function appendConversationEvent(
  ctx: MutationCtx,
  args: ConversationEventArgs
) {
  const conversation = await resolveConversationInternal(
    ctx,
    args.senderUserId,
    args.recipientUserId
  );
  const memberships = await loadConversationMembershipPair(ctx, {
    conversationId: conversation._id,
    senderUserId: args.senderUserId,
    recipientUserId: args.recipientUserId,
  });
  if (!memberships) {
    return null;
  }
  const messageId = await persistConversationEvent(ctx, {
    conversationId: conversation._id,
    event: args,
    senderMembershipId: memberships.senderMembership._id,
    recipientMembershipId: memberships.recipientMembership._id,
    recipientUnreadCount: memberships.recipientMembership.unreadCount,
  });
  return {
    conversationId: conversation._id,
    messageId,
    recipientUserId: args.recipientUserId,
  };
}

export function mapConversationMessage(message: Doc<"inboxMessages">) {
  return {
    id: message._id,
    senderUserId: message.senderUserId,
    recipientUserId: message.recipientUserId,
    type: message.type,
    body: message.body,
    metadata: message.metadata ?? null,
    createdAt: message.createdAt,
  };
}

async function loadConversationPreview(
  ctx: QueryCtx,
  participant: Doc<"inboxConversationParticipants">
) {
  const conversation = await ctx.db.get(participant.conversationId);
  if (!conversation) return null;

  const otherProfile = await getProfileByAuthUserId(ctx, participant.otherUserId);
  const [otherOrganizationName, otherUserImage] = await Promise.all([
    getOrganizationNameByOwner(ctx, {
      brokerId: otherProfile?.brokerId ?? undefined,
      REDId: otherProfile?.REDId ?? undefined,
    }),
    getUserImageByEmail(ctx, otherProfile?.email),
  ]);
  const latestMessage = await ctx.db
    .query("inboxMessages")
    .withIndex("conversationId_createdAt", (q) =>
      q.eq("conversationId", participant.conversationId)
    )
    .order("desc")
    .first();

  return { conversation, latestMessage, otherOrganizationName, otherProfile, otherUserImage };
}

function resolveOrganizationType(otherProfile: Awaited<ReturnType<typeof getProfileByAuthUserId>>) {
  if (otherProfile?.brokerId) return "broker" as const;
  return otherProfile?.REDId ? ("developer" as const) : null;
}

export async function mapConversationSummary(
  ctx: QueryCtx,
  participant: Doc<"inboxConversationParticipants">
) {
  const loaded = await loadConversationPreview(ctx, participant);
  if (!loaded) return null;
  const { conversation, latestMessage, otherOrganizationName, otherProfile, otherUserImage } = loaded;
  return {
    id: conversation._id,
    directKey: conversation.directKey,
    otherUser: {
      id: participant.otherUserId,
      name: otherProfile?.name ?? otherProfile?.email ?? "مستخدم عنان",
      email: otherProfile?.email ?? null,
      username: otherProfile?.username ?? null,
      image: otherUserImage,
      role: otherProfile?.role === "RED" ? "developer" : otherProfile?.role ?? "user",
      brokerId: otherProfile?.brokerId ?? null,
      redId: otherProfile?.REDId ?? null,
      organizationName: otherOrganizationName,
      organizationType: resolveOrganizationType(otherProfile),
      membershipState: null,
      conversationId: conversation._id,
    },
    lastMessage: latestMessage
      ? {
          id: latestMessage._id,
          type: latestMessage.type,
          body: latestMessage.body,
          createdAt: latestMessage.createdAt,
          senderUserId: latestMessage.senderUserId,
        }
      : null,
    lastMessagePreview: participant.lastMessagePreview ?? conversation.lastMessagePreview ?? latestMessage?.body ?? "",
    updatedAt: participant.conversationUpdatedAt ?? conversation.updatedAt,
    unreadCount: participant.unreadCount,
    archivedAt: participant.archivedAt ?? null,
  };
}

export async function findExistingOfferStarterMessage(
  ctx: MutationCtx,
  conversationId: Id<"inboxConversations">,
  offerId: string
) {
  const messages = await ctx.db
    .query("inboxMessages")
    .withIndex("conversationId_createdAt", (q) => q.eq("conversationId", conversationId))
    .collect();

  return (
    messages.find(
      (message) =>
        message.type === "offer_event" &&
        isOfferCardMetadata(message.metadata) &&
        message.metadata.offerId === offerId
    ) ?? null
  );
}
