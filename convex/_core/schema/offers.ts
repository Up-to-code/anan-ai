import { defineTable } from "convex/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "./uploadedFiles";

/**
 * Offers Schema
 *
 * Lifecycle:
 * - created by Broker / RED to express interest in another's property
 * - can be accepted or rejected by the property owner
 */

const offersTables = {
        offers: defineTable({
        propertyId: v.id("properties"),
        fromBrokerId: v.optional(v.id("brokers")),
        fromREDId: v.optional(v.id("RED")),
        toBrokerId: v.optional(v.id("brokers")),
        toREDId: v.optional(v.id("RED")),
        recipientAuthUserId: v.optional(v.string()),
        price: v.number(),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
        publicationState: v.optional(
            v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
        ),
        message: v.optional(v.string()),
        // Phase 1 additions
        visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
        recipientEmail: v.optional(v.string()),
        recipientPhone: v.optional(v.string()),
        sourceConversationId: v.optional(v.id("inboxConversations")),
        description: v.optional(v.string()),
        documentIds: v.optional(v.array(v.id("_storage"))),
        attachments: v.optional(uploadedFileReferenceListValidator),
    })
        .index("propertyId", ["propertyId"])
        .index("fromBrokerId", ["fromBrokerId"])
        .index("fromREDId", ["fromREDId"])
        .index("toBrokerId", ["toBrokerId"])
        .index("toREDId", ["toREDId"])
        .index("recipientAuthUserId", ["recipientAuthUserId"])
        .index("visibility", ["visibility"])
        .index("publicationState", ["publicationState"])
        .index("sourceConversationId", ["sourceConversationId"]),
    offerPackages: defineTable({
        propertyId: v.optional(v.id("properties")),
        ownerAuthUserId: v.string(),
        fromBrokerId: v.optional(v.id("brokers")),
        fromREDId: v.optional(v.id("RED")),
        title: v.optional(v.string()),
        summary: v.optional(v.string()),
        askingPrice: v.number(),
        commissionText: v.optional(v.string()),
        permitStatus: v.optional(v.string()),
        productStatus: v.optional(v.string()),
        visibility: v.union(v.literal("open"), v.literal("private")),
        allowedAudience: v.union(v.literal("brokers"), v.literal("developers"), v.literal("both")),
        notes: v.optional(v.string()),
        attachments: v.optional(uploadedFileReferenceListValidator),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("propertyId", ["propertyId"])
        .index("ownerAuthUserId", ["ownerAuthUserId"])
        .index("fromBrokerId", ["fromBrokerId"])
        .index("fromREDId", ["fromREDId"])
        .index("visibility", ["visibility"]),
    offerCases: defineTable({
        offerPackageId: v.id("offerPackages"),
        type: v.union(
            v.literal("open_offer"),
            v.literal("private_offer"),
            v.literal("collaboration_case"),
        ),
        stage: v.union(
            v.literal("draft"),
            v.literal("open"),
            v.literal("targeted"),
            v.literal("engaged"),
            v.literal("agreed"),
            v.literal("closed_won"),
            v.literal("closed_lost"),
            v.literal("archived"),
        ),
        visibility: v.union(v.literal("open"), v.literal("private")),
        initiatedByAuthUserId: v.string(),
        sourceConversationId: v.optional(v.id("inboxConversations")),
        headline: v.optional(v.string()),
        summary: v.optional(v.string()),
        clientContext: v.optional(
            v.object({
                crmClientId: v.optional(v.id("crmClients")),
                clientName: v.string(),
                clientPhone: v.optional(v.string()),
                clientBudget: v.optional(v.string()),
                clientNeed: v.string(),
            }),
        ),
        linkedDealId: v.optional(v.id("deals")),
        closeNote: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastActivityAt: v.number(),
    })
        .index("offerPackageId", ["offerPackageId"])
        .index("stage", ["stage"])
        .index("type", ["type"])
        .index("initiatedByAuthUserId", ["initiatedByAuthUserId"])
        .index("sourceConversationId", ["sourceConversationId"]),
    offerCaseParticipants: defineTable({
        offerCaseId: v.id("offerCases"),
        authUserId: v.optional(v.string()),
        brokerId: v.optional(v.id("brokers")),
        REDId: v.optional(v.id("RED")),
        role: v.union(
            v.literal("inventory_owner"),
            v.literal("client_owner"),
            v.literal("execution_partner"),
        ),
        status: v.union(
            v.literal("pending"),
            v.literal("active"),
            v.literal("accepted"),
            v.literal("rejected"),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("offerCaseId", ["offerCaseId"])
        .index("authUserId", ["authUserId"])
        .index("brokerId", ["brokerId"])
        .index("REDId", ["REDId"]),
    offerActivities: defineTable({
        offerCaseId: v.id("offerCases"),
        kind: v.union(
            v.literal("case_created"),
            v.literal("case_published"),
            v.literal("participant_targeted"),
            v.literal("engaged"),
            v.literal("accepted"),
            v.literal("rejected"),
            v.literal("agreed"),
            v.literal("closed_won"),
            v.literal("closed_lost"),
            v.literal("archived"),
            v.literal("note_added"),
        ),
        actorAuthUserId: v.optional(v.string()),
        message: v.optional(v.string()),
        createdAt: v.number(),
    }).index("offerCaseId", ["offerCaseId"]),
};

export default offersTables;
