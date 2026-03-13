import { defineTable } from "convex/server";
import { v } from "convex/values";

const workspaceTables = {
    inboxConversations: defineTable({
        directKey: v.string(),
        firstParticipantUserId: v.string(),
        secondParticipantUserId: v.string(),
        createdByUserId: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastMessageAt: v.optional(v.number()),
        lastMessagePreview: v.optional(v.string()),
        lastMessageSenderId: v.optional(v.string()),
    })
        .index("directKey", ["directKey"])
        .index("updatedAt", ["updatedAt"])
        .index("firstParticipantUserId", ["firstParticipantUserId"])
        .index("secondParticipantUserId", ["secondParticipantUserId"]),

    inboxConversationParticipants: defineTable({
        conversationId: v.id("inboxConversations"),
        userId: v.string(),
        otherUserId: v.string(),
        joinedAt: v.number(),
        lastReadAt: v.optional(v.number()),
        unreadCount: v.number(),
    })
        .index("conversationId", ["conversationId"])
        .index("userId", ["userId"])
        .index("userId_conversationId", ["userId", "conversationId"]),

    inboxMessages: defineTable({
        conversationId: v.id("inboxConversations"),
        senderUserId: v.string(),
        recipientUserId: v.string(),
        type: v.union(
            v.literal("text"),
            v.literal("offer_event"),
            v.literal("file_share"),
            v.literal("project_share"),
            v.literal("deal_share"),
            v.literal("invite_event"),
            v.literal("role_event"),
        ),
        body: v.string(),
        metadata: v.optional(v.any()),
        createdAt: v.number(),
    })
        .index("conversationId", ["conversationId"])
        .index("senderUserId", ["senderUserId"])
        .index("recipientUserId", ["recipientUserId"]),

    workspaceNotifications: defineTable({
        userId: v.string(),
        type: v.union(
            v.literal("message"),
            v.literal("offer_sent"),
            v.literal("offer_approved"),
            v.literal("offer_rejected"),
            v.literal("offer_canceled"),
            v.literal("offer_completed"),
            v.literal("invite_sent"),
            v.literal("invite_accepted"),
            v.literal("approval_request"),
        ),
        title: v.string(),
        summary: v.string(),
        href: v.string(),
        source: v.string(),
        severity: v.union(v.literal("info"), v.literal("warning"), v.literal("success")),
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        metadata: v.optional(v.any()),
        readAt: v.optional(v.number()),
        createdAt: v.number(),
        pushedAt: v.optional(v.number()),
        pushStatus: v.optional(
            v.union(v.literal("pending"), v.literal("sent"), v.literal("failed"), v.literal("skipped")),
        ),
        pushError: v.optional(v.string()),
    })
        .index("userId", ["userId"])
        .index("userId_createdAt", ["userId", "createdAt"])
        .index("userId_readAt", ["userId", "readAt"]),

    workspaceNotificationPreferences: defineTable({
        userId: v.string(),
        browserPushEnabled: v.boolean(),
        updatedAt: v.number(),
    }).index("userId", ["userId"]),

    workspacePushSubscriptions: defineTable({
        userId: v.string(),
        endpoint: v.string(),
        keysAuth: v.string(),
        keysP256dh: v.string(),
        userAgent: v.optional(v.string()),
        isActive: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastSuccessAt: v.optional(v.number()),
        lastFailureAt: v.optional(v.number()),
        failureReason: v.optional(v.string()),
    })
        .index("userId", ["userId"])
        .index("endpoint", ["endpoint"])
        .index("userId_isActive", ["userId", "isActive"]),
};

export default workspaceTables;
