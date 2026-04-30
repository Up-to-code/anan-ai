import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";
import { boundedMetadataValidator } from "./securityValidators";

const workspaceTables = {
    inboxConversations: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        propertyId: v.optional(v.id("properties")),
        channel: v.optional(v.union(v.literal("platform"), v.literal("email"))),
        status: v.optional(v.union(v.literal("open"), v.literal("resolved"), v.literal("archived"))),
        assignedToProfileId: v.optional(v.id("userProfiles")),
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
        .index("by_orgId", ["orgId"])
        .index("by_orgId_and_status", ["orgId", "status"])
        .index("by_orgId_and_lastMessageAt", ["orgId", "lastMessageAt"])
        .index("by_org_status_lastMessageAt", ["orgId", "status", "lastMessageAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("directKey", ["directKey"])
        .index("updatedAt", ["updatedAt"])
        .index("firstParticipantUserId", ["firstParticipantUserId"])
        .index("secondParticipantUserId", ["secondParticipantUserId"]),

    inboxConversationParticipants: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        conversationId: v.id("inboxConversations"),
        userId: v.string(),
        otherUserId: v.string(),
        joinedAt: v.number(),
        lastReadAt: v.optional(v.number()),
        unreadCount: v.number(),
        archivedAt: v.optional(v.number()),
        conversationUpdatedAt: v.optional(v.number()),
        lastMessageAt: v.optional(v.number()),
        lastMessagePreview: v.optional(v.string()),
        lastMessageSenderId: v.optional(v.string()),
    })
        .index("conversationId", ["conversationId"])
        .index("userId", ["userId"])
        .index("userId_conversationId", ["userId", "conversationId"])
        .index("userId_archivedAt_conversationUpdatedAt", ["userId", "archivedAt", "conversationUpdatedAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

    inboxMessages: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        conversationId: v.id("inboxConversations"),
        senderAuthUserId: v.optional(v.id("authUsers")),
        contentType: v.optional(v.union(
            v.literal("text"),
            v.literal("image"),
            v.literal("document"),
            v.literal("system"),
        )),
        mediaStorageId: v.optional(v.id("_storage")),
        isRead: v.optional(v.boolean()),
        sentAt: v.optional(v.number()),
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
        metadata: v.optional(boundedMetadataValidator),
        createdAt: v.number(),
    })
        .index("by_conversationId", ["conversationId", "sentAt"])
        .index("conversationId", ["conversationId"])
        .index("conversationId_createdAt", ["conversationId", "createdAt"])
        .index("senderUserId", ["senderUserId"])
        .index("recipientUserId", ["recipientUserId"])
        .index("by_org_active_createdAt", ["orgId", "deletedAt", "createdAt"]),

    workspaceNotifications: defineTable({
    ...transitionalGlobalSecurityFields,
        recipientProfileId: v.optional(v.id("userProfiles")),
        orgId: v.optional(v.id("organizations")),
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
        payload: v.optional(v.object({
            title: v.string(),
            body: v.string(),
            linkType: v.string(),
            linkId: v.string(),
        })),
        isRead: v.optional(v.boolean()),
        summary: v.string(),
        href: v.string(),
        source: v.string(),
        severity: v.union(v.literal("info"), v.literal("warning"), v.literal("success")),
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
        metadata: v.optional(boundedMetadataValidator),
        readAt: v.optional(v.number()),
        createdAt: v.number(),
        pushedAt: v.optional(v.number()),
        pushStatus: v.optional(
            v.union(v.literal("pending"), v.literal("sent"), v.literal("failed"), v.literal("skipped")),
        ),
        pushError: v.optional(v.string()),
    })
        .index("by_orgId", ["orgId"])
        .index("by_recipientProfileId", ["recipientProfileId"])
        .index("by_recipientProfileId_and_isRead", ["recipientProfileId", "isRead"])
        .index("by_recipient_read_createdAt", ["recipientProfileId", "isRead", "createdAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("userId", ["userId"])
        .index("userId_createdAt", ["userId", "createdAt"])
        .index("userId_readAt", ["userId", "readAt"]),

    workspaceNotificationPreferences: defineTable({
    ...transitionalGlobalSecurityFields,
        authUserId: v.optional(v.id("authUsers")),
        userId: v.string(),
        browserPushEnabled: v.boolean(),
        updatedAt: v.number(),
    })
        .index("userId", ["userId"])
        .index("by_authUserId", ["authUserId"]),

    workspacePushSubscriptions: defineTable({
    ...transitionalGlobalSecurityFields,
        authUserId: v.optional(v.id("authUsers")),
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
        .index("userId_isActive", ["userId", "isActive"])
        .index("by_authUserId", ["authUserId"])
        .index("by_authUser_active", ["authUserId", "isActive"]),
};

export default workspaceTables;
