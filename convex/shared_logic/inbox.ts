import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { requireRole } from "../_core/security/accessPolicy";
import { createWorkspaceNotification } from "./notifications";
import { enforceHttpRateLimit } from "./lib/middleware/rateLimit";
import { buildOwnerContext, resolveTenantOrgIdForOwner } from "./agencies/repositories/core";
import { tenants } from "../tenants";

function normalizeDirectPair(userA: string, userB: string) {
  const [first, second] = [userA.trim(), userB.trim()].sort();
  return {
    firstParticipantUserId: first,
    secondParticipantUserId: second,
    directKey: `${first}__${second}`,
  };
}

async function getProfileByAuthUserId(ctx: QueryCtx | MutationCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .unique();
}

function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

function normalizeComparableText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

async function getProfileByOrganizationTarget(
  ctx: QueryCtx | MutationCtx,
  args: { brokerId?: Id<"brokers">; REDId?: Id<"RED"> },
) {
  const profiles = await ctx.db.query("userProfiles").collect();
  return profiles.find((profile) =>
    (args.brokerId && profile.brokerId === args.brokerId) ||
    (args.REDId && profile.REDId === args.REDId),
  ) ?? null;
}

type OfferCardMetadata = {
  contextType: "offer_card";
  bootstrapSource: "offer_send" | "offer_apply" | "offer_detail";
  offerId: Id<"offers">;
  propertyId: Id<"properties">;
  offerTitle: string;
  authorName: string;
  organizationName: string;
  price: number;
  visibility: "public" | "private";
  href: string;
  recipientAuthUserId?: string;
};

type CollaborationActor = {
  authUserId: string;
  name: string;
  role: "broker" | "developer" | "user" | "admin";
  organizationId?: string | null;
  organizationType?: "broker" | "developer" | null;
  organizationName?: string | null;
};

type CollaborationRecipient = {
  recipientAuthUserId: string;
  organizationId?: string | null;
  organizationType?: "broker" | "developer" | null;
  organizationName?: string | null;
};

type CollaborationAction = {
  type: "open_file" | "open_project" | "open_deal" | "open_offer" | "open_invite" | "open_membership";
  label: string;
  href: string;
};

type FileShareMetadata = {
  contextType: "file_share";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  file: {
    key: string;
    url: string;
    name: string;
    size?: number;
    mime?: string;
  };
};

type ProjectShareMetadata = {
  contextType: "project_share";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  propertyId: string;
  location?: string | null;
  imageUrl?: string | null;
};

type DealShareMetadata = {
  contextType: "deal_share";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  dealId: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  value?: number | null;
  propertyId?: string | null;
};

type InviteEventMetadata = {
  contextType: "invite_event";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  inviteId: string;
  inviteRole: "manager" | "member" | "viewer";
  inviteStatus: "pending" | "accepted" | "canceled";
  organizationName: string;
  organizationType: "broker" | "developer";
};

type RoleEventMetadata = {
  contextType: "role_event";
  actor: CollaborationActor;
  recipient: CollaborationRecipient;
  title: string;
  summary: string;
  href: string;
  action: CollaborationAction;
  membershipId: string;
  organizationRole: "manager" | "member" | "viewer";
  previousRole?: "manager" | "member" | "viewer" | null;
  organizationName: string;
  organizationType: "broker" | "developer";
};

function isOfferCardMetadata(value: unknown): value is OfferCardMetadata {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<OfferCardMetadata>;
  return (
    candidate.contextType === "offer_card" &&
    typeof candidate.offerId === "string" &&
    typeof candidate.propertyId === "string" &&
    typeof candidate.offerTitle === "string" &&
    typeof candidate.authorName === "string" &&
    typeof candidate.organizationName === "string" &&
    typeof candidate.price === "number" &&
    (candidate.visibility === "public" || candidate.visibility === "private") &&
    typeof candidate.href === "string"
  );
}

async function getConversationParticipant(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"inboxConversations">,
  userId: string,
) {
  return ctx.db
    .query("inboxConversationParticipants")
    .withIndex("userId_conversationId", (q) => q.eq("userId", userId).eq("conversationId", conversationId))
    .unique();
}

async function findExistingOfferStarterMessage(
  ctx: MutationCtx,
  conversationId: Id<"inboxConversations">,
  offerId: Id<"offers">,
) {
  const messages = await ctx.db
    .query("inboxMessages")
    .withIndex("conversationId", (q) => q.eq("conversationId", conversationId))
    .collect();

  return messages.find(
    (message) =>
      message.type === "offer_event" &&
      isOfferCardMetadata(message.metadata) &&
      message.metadata.offerId === offerId,
  ) ?? null;
}

async function resolveOfferStarterRecipientProfile(
  ctx: MutationCtx,
  args: { targetUserId?: string; recipientBrokerId?: Id<"brokers">; recipientREDId?: Id<"RED"> },
) {
  if (args.targetUserId) {
    return getProfileByAuthUserId(ctx, args.targetUserId);
  }

  return getProfileByOrganizationTarget(ctx, {
    brokerId: args.recipientBrokerId,
    REDId: args.recipientREDId,
  });
}

async function getOrganizationNameByOwner(
  ctx: QueryCtx | MutationCtx,
  args: { brokerId?: Id<"brokers">; REDId?: Id<"RED"> },
) {
  if (args.brokerId) {
    return (await ctx.db.get(args.brokerId))?.name ?? null;
  }

  if (args.REDId) {
    return (await ctx.db.get(args.REDId))?.name ?? null;
  }

  return null;
}

async function getOfferAuthorProjection(ctx: MutationCtx, senderUserId: string) {
  const senderProfile = await getProfileByAuthUserId(ctx, senderUserId);
  const authorName = senderProfile?.name ?? senderProfile?.email ?? "مستخدم أنان";
  const organizationName = (await getOrganizationNameByOwner(ctx, {
    brokerId: senderProfile?.brokerId ?? undefined,
    REDId: senderProfile?.REDId ?? undefined,
  })) ?? authorName;

  return {
    authorName,
    organizationName,
  };
}

async function getCollaborationActorProjection(ctx: QueryCtx | MutationCtx, authUserId: string): Promise<CollaborationActor> {
  const profile = await getProfileByAuthUserId(ctx, authUserId);
  const role = profile?.role === "RED" ? "developer" : profile?.role ?? "user";
  const organizationName = await getOrganizationNameByOwner(ctx, {
    brokerId: profile?.brokerId ?? undefined,
    REDId: profile?.REDId ?? undefined,
  });

  return {
    authUserId,
    name: profile?.name ?? profile?.email ?? "مستخدم أنان",
    role,
    organizationId: profile?.brokerId ? String(profile.brokerId) : profile?.REDId ? String(profile.REDId) : null,
    organizationType: profile?.brokerId ? "broker" : profile?.REDId ? "developer" : null,
    organizationName,
  };
}

async function getCollaborationRecipientProjection(
  ctx: QueryCtx | MutationCtx,
  authUserId: string,
): Promise<CollaborationRecipient> {
  const profile = await getProfileByAuthUserId(ctx, authUserId);
  const organizationName = await getOrganizationNameByOwner(ctx, {
    brokerId: profile?.brokerId ?? undefined,
    REDId: profile?.REDId ?? undefined,
  });

  return {
    recipientAuthUserId: authUserId,
    organizationId: profile?.brokerId ? String(profile.brokerId) : profile?.REDId ? String(profile.REDId) : null,
    organizationType: profile?.brokerId ? "broker" : profile?.REDId ? "developer" : null,
    organizationName,
  };
}

async function resolveConversationInternal(
  ctx: MutationCtx,
  currentUserId: string,
  targetUserId: string,
) {
  if (currentUserId === targetUserId) {
    throw new ConvexError({ code: "INVALID_TARGET", message: "Cannot start a conversation with yourself" });
  }

  const currentProfile = await getProfileByAuthUserId(ctx, currentUserId);
  const targetProfile = await getProfileByAuthUserId(ctx, targetUserId);

  if (!currentProfile || currentProfile.isActive === false || !targetProfile || targetProfile.isActive === false) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Conversation participant not found" });
  }

  const pair = normalizeDirectPair(currentUserId, targetUserId);
  const existing = await ctx.db
    .query("inboxConversations")
    .withIndex("directKey", (q) => q.eq("directKey", pair.directKey))
    .unique();

  if (existing) {
    return existing;
  }

  const now = Date.now();
  const conversationId = await ctx.db.insert("inboxConversations", {
    ...pair,
    createdByUserId: currentUserId,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.insert("inboxConversationParticipants", {
    conversationId,
    userId: pair.firstParticipantUserId,
    otherUserId: pair.secondParticipantUserId,
    joinedAt: now,
    unreadCount: 0,
  });

  await ctx.db.insert("inboxConversationParticipants", {
    conversationId,
    userId: pair.secondParticipantUserId,
    otherUserId: pair.firstParticipantUserId,
    joinedAt: now,
    unreadCount: 0,
  });

  return (await ctx.db.get(conversationId))!;
}

async function appendConversationEvent(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    recipientUserId: string;
    type: "offer_event" | "file_share" | "project_share" | "deal_share" | "invite_event" | "role_event";
    body: string;
    metadata: Record<string, unknown>;
  },
) {
  const conversation = await resolveConversationInternal(ctx, args.senderUserId, args.recipientUserId);
  const senderMembership = await getConversationParticipant(ctx, conversation._id, args.senderUserId);
  const recipientMembership = await getConversationParticipant(ctx, conversation._id, args.recipientUserId);

  if (!senderMembership || !recipientMembership) {
    return null;
  }

  const now = Date.now();
  const messageId = await ctx.db.insert("inboxMessages", {
    conversationId: conversation._id,
    senderUserId: args.senderUserId,
    recipientUserId: args.recipientUserId,
    type: args.type,
    body: args.body,
    metadata: args.metadata,
    createdAt: now,
  });

  await ctx.db.patch(conversation._id, {
    updatedAt: now,
    lastMessageAt: now,
    lastMessagePreview: args.body.slice(0, 140),
    lastMessageSenderId: args.senderUserId,
  });

  await ctx.db.patch(senderMembership._id, {
    lastReadAt: now,
    unreadCount: 0,
  });

  await ctx.db.patch(recipientMembership._id, {
    unreadCount: recipientMembership.unreadCount + 1,
  });

  return {
    conversationId: conversation._id,
    messageId,
    recipientUserId: args.recipientUserId,
  };
}

async function mapConversationSummary(
  ctx: QueryCtx,
  participant: Doc<"inboxConversationParticipants">,
) {
  const conversation = await ctx.db.get(participant.conversationId);
  if (!conversation) return null;

  const otherProfile = await getProfileByAuthUserId(ctx, participant.otherUserId);
  const otherOrganizationName = await getOrganizationNameByOwner(ctx, {
    brokerId: otherProfile?.brokerId ?? undefined,
    REDId: otherProfile?.REDId ?? undefined,
  });
  const latestMessage = await ctx.db
    .query("inboxMessages")
    .withIndex("conversationId", (q) => q.eq("conversationId", participant.conversationId))
    .order("desc")
    .first();

  return {
    id: conversation._id,
    directKey: conversation.directKey,
    otherUser: {
      id: participant.otherUserId,
      name: otherProfile?.name ?? otherProfile?.email ?? "مستخدم أنان",
      email: otherProfile?.email ?? null,
      username: otherProfile?.username ?? null,
      role: otherProfile?.role === "RED" ? "developer" : otherProfile?.role ?? "user",
      brokerId: otherProfile?.brokerId ?? null,
      redId: otherProfile?.REDId ?? null,
      organizationName: otherOrganizationName,
      organizationType: otherProfile?.brokerId ? "broker" : otherProfile?.REDId ? "developer" : null,
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
    lastMessagePreview: conversation.lastMessagePreview ?? latestMessage?.body ?? "",
    updatedAt: conversation.updatedAt,
    unreadCount: participant.unreadCount,
  };
}

function mapConversationMessage(message: Doc<"inboxMessages">) {
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

type EnsureOfferConversationStarterResult = {
  conversationId: Id<"inboxConversations">;
  recipientUserId: string;
  starterMessageCreated: boolean;
};

/**
 * WHY:   Offer-linked collaboration should always land inside one deterministic direct conversation with a reusable starter card.
 * WHAT:  Resolves the direct conversation for two users and inserts one structured offer-event card when it does not already exist.
 * HOW:   Finds the target profile from either an auth user id or organization ids, reuses the stable direct key, and de-duplicates by `offerId`.
 */
export async function ensureOfferConversationStarter(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    targetUserId?: string;
    recipientBrokerId?: Id<"brokers">;
    recipientREDId?: Id<"RED">;
    body: string;
    metadata: OfferCardMetadata;
  },
): Promise<EnsureOfferConversationStarterResult | null> {
  const recipientProfile = await resolveOfferStarterRecipientProfile(ctx, {
    targetUserId: args.targetUserId,
    recipientBrokerId: args.recipientBrokerId,
    recipientREDId: args.recipientREDId,
  });

  if (!recipientProfile?.authUserId) {
    return null;
  }

  const conversation = await resolveConversationInternal(ctx, args.senderUserId, recipientProfile.authUserId);
  const existingStarterMessage = await findExistingOfferStarterMessage(ctx, conversation._id, args.metadata.offerId);
  if (existingStarterMessage) {
    return {
      conversationId: conversation._id,
      recipientUserId: recipientProfile.authUserId,
      starterMessageCreated: false,
    };
  }

  const senderMembership = await getConversationParticipant(ctx, conversation._id, args.senderUserId);
  const recipientMembership = await getConversationParticipant(ctx, conversation._id, recipientProfile.authUserId);

  if (!senderMembership || !recipientMembership) {
    return null;
  }

  await appendConversationEvent(ctx, {
    senderUserId: args.senderUserId,
    recipientUserId: recipientProfile.authUserId,
    type: "offer_event",
    body: args.body,
    metadata: args.metadata,
  });

  return {
    conversationId: conversation._id,
    recipientUserId: recipientProfile.authUserId,
    starterMessageCreated: true,
  };
}

export const buildDirectConversationKey = query({
  args: {
    currentUserId: v.string(),
    targetUserId: v.string(),
  },
  handler: async (_ctx, args) => normalizeDirectPair(args.currentUserId, args.targetUserId).directKey,
});

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const memberships = await ctx.db
      .query("inboxConversationParticipants")
      .withIndex("userId", (q) => q.eq("userId", access.authUserId))
      .collect();

    const summaries = await Promise.all(
      memberships.map((membership) => mapConversationSummary(ctx, membership)),
    );

    return summaries
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("inboxConversations"),
  },
  handler: async (ctx, { conversationId }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const membership = await getConversationParticipant(ctx, conversationId, access.authUserId);
    if (!membership) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Conversation not found" });
    }

    const summary = await mapConversationSummary(ctx, membership as Doc<"inboxConversationParticipants">);
    const messages = await ctx.db
      .query("inboxMessages")
      .withIndex("conversationId", (q) => q.eq("conversationId", conversationId))
      .collect();

    return {
      ...summary,
      messages: messages.map(mapConversationMessage),
    };
  },
});

export const getInboxUnreadSummary = query({
  args: {},
  handler: async (ctx) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const memberships = await ctx.db
      .query("inboxConversationParticipants")
      .withIndex("userId", (q) => q.eq("userId", access.authUserId))
      .collect();

    return {
      unreadCount: memberships.reduce((sum, item) => sum + item.unreadCount, 0),
    };
  },
});

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

export const sendConversationMessage = mutation({
  args: {
    conversationId: v.optional(v.id("inboxConversations")),
    targetUserId: v.optional(v.string()),
    body: v.string(),
    clientRequestId: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("text"),
      v.literal("offer_event"),
      v.literal("file_share"),
      v.literal("project_share"),
      v.literal("deal_share"),
      v.literal("invite_event"),
      v.literal("role_event"),
    )),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { conversationId, targetUserId, body, clientRequestId, type, metadata }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    await enforceHttpRateLimit(ctx, { key: `inbox:${access.authUserId}` });

    const trimmedBody = body.trim();
    if (!trimmedBody) {
      throw new ConvexError({ code: "INVALID_MESSAGE", message: "Message body is required" });
    }

    const conversation = conversationId
      ? await ctx.db.get(conversationId)
      : targetUserId
        ? await resolveConversationInternal(ctx, access.authUserId, targetUserId)
        : null;

    if (!conversation) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Conversation not found" });
    }

    const membership = await getConversationParticipant(ctx, conversation._id, access.authUserId);
    if (!membership) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Conversation not found" });
    }

    const recipientMembership = await getConversationParticipant(ctx, conversation._id, membership.otherUserId);
    if (!recipientMembership) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Recipient not found" });
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("inboxMessages", {
      conversationId: conversation._id,
      senderUserId: access.authUserId,
      recipientUserId: membership.otherUserId,
      type: type ?? "text",
      body: trimmedBody,
      metadata: {
        ...(metadata && typeof metadata === "object" ? metadata : {}),
        ...(clientRequestId ? { clientRequestId } : {}),
      },
      createdAt: now,
    });

    await ctx.db.patch(conversation._id, {
      updatedAt: now,
      lastMessageAt: now,
      lastMessagePreview: trimmedBody.slice(0, 140),
      lastMessageSenderId: access.authUserId,
    });

    await ctx.db.patch(membership._id, {
      lastReadAt: now,
      unreadCount: 0,
    });

    await ctx.db.patch(recipientMembership._id, {
      unreadCount: recipientMembership.unreadCount + 1,
    });

    const senderProfile = await getProfileByAuthUserId(ctx, access.authUserId);
    await createWorkspaceNotification(ctx, {
      userId: membership.otherUserId,
      type: "message",
      title: `رسالة جديدة من ${senderProfile?.name ?? senderProfile?.email ?? "مستخدم أنان"}`,
      summary: trimmedBody.slice(0, 160),
      href: `/ws/inbox/${conversation._id}`,
      source: "البريد الوارد",
      severity: "info",
      entityType: "conversation",
      entityId: conversation._id,
      metadata: {
        conversationId: conversation._id,
        senderUserId: access.authUserId,
      },
    });

    return {
      conversationId: conversation._id,
      messageId,
      clientRequestId: clientRequestId ?? null,
    };
  },
});

/**
 * WHY:   Offer detail pages should open a ready-to-use conversation with one shared offer card instead of a blank thread.
 * WHAT:  Resolves the other party for an offer relative to the current broker/RED and ensures the structured starter card exists.
 * HOW:   Targets the sender for marketplace/received views, targets the explicit recipient for sent offers, and reuses the offer-card de-duplication path.
 */
export const bootstrapOfferConversation = mutation({
  args: {
    offerId: v.id("offers"),
  },
  handler: async (ctx, { offerId }) => {
    const access = await requireRole(ctx, ["broker", "RED"]);
    const offer = await ctx.db.get(offerId);
    if (!offer) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Offer not found" });
    }

    const isCurrentUserSender =
      (access.brokerId && offer.fromBrokerId === access.brokerId) ||
      (access.REDId && offer.fromREDId === access.REDId);

    const targetUserId = isCurrentUserSender
      ? offer.recipientAuthUserId ?? undefined
      : undefined;
    const targetBrokerId = isCurrentUserSender
      ? offer.toBrokerId ?? undefined
      : offer.fromBrokerId ?? undefined;
    const targetREDId = isCurrentUserSender
      ? offer.toREDId ?? undefined
      : offer.fromREDId ?? undefined;

    if (!targetUserId && !targetBrokerId && !targetREDId) {
      throw new ConvexError({
        code: "INVALID_TARGET",
        message: "No messageable offer partner is available for this offer",
      });
    }

    const property = await ctx.db.get(offer.propertyId);
    const starter = await appendInboxOfferEvent(ctx, {
      senderUserId: access.authUserId,
      targetUserId,
      recipientBrokerId: targetBrokerId,
      recipientREDId: targetREDId,
      offerId: offer._id,
      propertyId: offer.propertyId,
      title: property?.title ?? offer.message ?? offer.description ?? "عرض عقاري",
      body: `نبدأ الحديث حول ${property?.title ?? offer.message ?? "هذا العرض"}`,
      href: `/ws/offers/${offer._id}`,
      price: offer.price,
      visibility: offer.visibility ?? "private",
      bootstrapSource: "offer_detail",
      metadata: {
        description: offer.description ?? null,
      },
    });

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

export const searchConversationTargets = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query: searchQuery }) => {
    const access = await requireRole(ctx, ["user", "broker", "developer", "admin"]);
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    if (!normalizedQuery) {
      return [];
    }

    if (access.role !== "broker" && access.role !== "developer") {
      const profile = normalizedQuery.includes("@")
        ? await ctx.db
            .query("userProfiles")
            .withIndex("email", (q) => q.eq("email", normalizedQuery))
            .first()
        : await ctx.db
            .query("userProfiles")
            .withIndex("usernameLower", (q) => q.eq("usernameLower", normalizedQuery))
            .first();

      if (!profile || profile.authUserId === access.authUserId || profile.isActive === false) {
        return [];
      }

      const organizationName = await getOrganizationNameByOwner(ctx, {
        brokerId: profile.brokerId ?? undefined,
        REDId: profile.REDId ?? undefined,
      });

      return [{
        id: profile.authUserId,
        name: profile.name ?? profile.email ?? "مستخدم أنان",
        email: profile.email ?? null,
        username: profile.username ?? null,
        role: profile.role === "RED" ? "developer" : profile.role ?? "user",
        brokerId: profile.brokerId ?? null,
        redId: profile.REDId ?? null,
        organizationName,
        organizationType: profile.brokerId ? "broker" : profile.REDId ? "developer" : null,
        membershipState: null,
        conversationId: null,
      }];
    }

    const currentOwnerType = access.brokerId ? "broker" : access.REDId ? "RED" : null;
    const profiles = await ctx.db
      .query("userProfiles")
      .withIndex("roleStatus", (q) => q.eq("roleStatus", "approved"))
      .collect();
    const owner = currentOwnerType === "broker" && access.brokerId
      ? buildOwnerContext({ ownerType: "broker", ownerBrokerId: access.brokerId, authUserId: access.authUserId })
      : currentOwnerType === "RED" && access.REDId
        ? buildOwnerContext({ ownerType: "RED", ownerREDId: access.REDId, authUserId: access.authUserId })
        : null;
    const tenantOrgId = owner ? await resolveTenantOrgIdForOwner(ctx, owner) : null;
    const invites = tenantOrgId ? await tenants.listInvitations(ctx as never, tenantOrgId) : [];

    const results = await Promise.all(
      profiles.map(async (profile) => {
        if (profile.authUserId === access.authUserId || profile.isActive === false) {
          return null;
        }

        const isCollaborator = Boolean(profile.brokerId || profile.REDId);
        if (!isCollaborator) {
          return null;
        }

        const role = profile.role === "RED" ? "developer" : profile.role ?? "user";
        const organizationName = await getOrganizationNameByOwner(ctx, {
          brokerId: profile.brokerId ?? undefined,
          REDId: profile.REDId ?? undefined,
        });
        const haystack = [
          normalizeComparableText(profile.name),
          normalizeComparableText(profile.email),
          normalizeComparableText(profile.username),
          normalizeComparableText(organizationName),
          normalizeComparableText(role),
        ];
        if (!haystack.some((entry) => entry.includes(normalizedQuery))) {
          return null;
        }

        const membership = tenantOrgId
          ? await tenants.getMember(ctx as never, tenantOrgId, profile.authUserId)
          : null;
        const pendingInvite = invites.find(
          (invite) => invite.status === "pending" && normalizeComparableText(invite.inviteeIdentifier) === normalizeComparableText(profile.email),
        );
        const conversation = await ctx.db
          .query("inboxConversations")
          .withIndex("directKey", (q) => q.eq("directKey", normalizeDirectPair(access.authUserId, profile.authUserId).directKey))
          .unique();

        return {
          id: profile.authUserId,
          name: profile.name ?? profile.email ?? "مستخدم أنان",
          email: profile.email ?? null,
          username: profile.username ?? null,
          role,
          brokerId: profile.brokerId ?? null,
          redId: profile.REDId ?? null,
          organizationName,
          organizationType: profile.brokerId ? "broker" : profile.REDId ? "developer" : null,
          membershipState: (membership?.status ?? "active") === "active" ? "member" : pendingInvite ? "pending-invite" : "not-member",
          conversationId: conversation?._id ?? null,
        };
      }),
    );

    return results
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((left, right) => left.name.localeCompare(right.name, "ar"))
      .slice(0, 20);
  },
});

export async function appendInboxOfferEvent(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    targetUserId?: string;
    recipientBrokerId?: Id<"brokers">;
    recipientREDId?: Id<"RED">;
    offerId: Id<"offers">;
    propertyId: Id<"properties">;
    title: string;
    body: string;
    href: string;
    price: number;
    visibility: "public" | "private";
    bootstrapSource: "offer_send" | "offer_apply" | "offer_detail";
    metadata?: Record<string, unknown>;
  },
) {
  const author = await getOfferAuthorProjection(ctx, args.senderUserId);
  const starter = await ensureOfferConversationStarter(ctx, {
    senderUserId: args.senderUserId,
    targetUserId: args.targetUserId,
    recipientBrokerId: args.recipientBrokerId,
    recipientREDId: args.recipientREDId,
    body: args.body,
    metadata: {
      contextType: "offer_card",
      bootstrapSource: args.bootstrapSource,
      offerId: args.offerId,
      propertyId: args.propertyId,
      offerTitle: args.title,
      authorName: author.authorName,
      organizationName: author.organizationName,
      price: args.price,
      visibility: args.visibility,
      href: args.href,
      recipientAuthUserId: args.targetUserId,
      ...args.metadata,
    },
  });

  return starter;
}

/**
 * WHY:   Organization collaboration history should live in the same direct thread as business messages, not only in settings screens.
 * WHAT:  Appends a non-text collaboration card such as a file/project/deal share or invite/role event.
 * HOW:   Reuses the deterministic direct-conversation resolver and the shared unread-count update path for event cards.
 */
export async function appendInboxCollaborationEvent(
  ctx: MutationCtx,
  args: {
    senderUserId: string;
    recipientUserId: string;
    type: "file_share" | "project_share" | "deal_share" | "invite_event" | "role_event";
    body: string;
    metadata:
      | FileShareMetadata
      | ProjectShareMetadata
      | DealShareMetadata
      | InviteEventMetadata
      | RoleEventMetadata;
  },
) {
  return appendConversationEvent(ctx, {
    senderUserId: args.senderUserId,
    recipientUserId: args.recipientUserId,
    type: args.type,
    body: args.body,
    metadata: args.metadata as unknown as Record<string, unknown>,
  });
}
