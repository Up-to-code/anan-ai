import { defineTable } from "convex/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "./uploadedFiles";
import { transitionalGlobalSecurityFields } from "./securityFields";

/**
 * Offers Schema
 *
 * Lifecycle:
 * - created by Broker / RED to express interest in another's property
 * - can be accepted or rejected by the property owner
 */

const offersTables = {
        offers: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        propertyId: v.id("properties"),
        tenantOrgId: v.optional(v.string()),
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
        .index("sourceConversationId", ["sourceConversationId"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),
    offerPackages: defineTable({
    ...transitionalGlobalSecurityFields,
        propertyId: v.optional(v.id("properties")),
        orgId: v.optional(v.id("organizations")),
        tenantOrgId: v.optional(v.string()),
        ownerAuthUserId: v.string(),
        fromBrokerId: v.optional(v.id("brokers")),
        fromREDId: v.optional(v.id("RED")),
        title: v.optional(v.string()),
        summary: v.optional(v.string()),
        askingPrice: v.number(),
        commissionText: v.optional(v.string()),
        permitStatus: v.optional(v.string()),
        productStatus: v.optional(v.string()),
        visibility: v.union(
            v.literal("open"),
            v.literal("public"),
            v.literal("private"),
            v.literal("broker_only"),
        ),
        allowedAudience: v.union(v.literal("brokers"), v.literal("developers"), v.literal("both")),
        unitIds: v.optional(v.array(v.id("projectUnits"))),
        pricingOverride: v.optional(v.object({
            discountPct: v.number(),
            validUntil: v.number(),
        })),
        publishedAt: v.optional(v.number()),
        notes: v.optional(v.string()),
        attachments: v.optional(uploadedFileReferenceListValidator),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_orgId", ["orgId"])
        .index("by_orgId_and_visibility", ["orgId", "visibility"])
        .index("by_org_visibility_updatedAt", ["orgId", "visibility", "updatedAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("propertyId", ["propertyId"])
        .index("tenantOrgId", ["tenantOrgId"])
        .index("ownerAuthUserId", ["ownerAuthUserId"])
        .index("fromBrokerId", ["fromBrokerId"])
        .index("fromREDId", ["fromREDId"])
        .index("visibility", ["visibility"]),
    offerCases: defineTable({
    ...transitionalGlobalSecurityFields,
        offerPackageId: v.id("offerPackages"),
        packageId: v.optional(v.id("offerPackages")),
        dealId: v.optional(v.id("deals")),
        orgId: v.optional(v.id("organizations")),
        status: v.optional(v.union(
            v.literal("open"),
            v.literal("in_review"),
            v.literal("approved"),
            v.literal("rejected"),
            v.literal("withdrawn"),
        )),
        workflowStage: v.optional(v.string()),
        resolvedAt: v.optional(v.number()),
        tenantOrgId: v.optional(v.string()),
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
                budgetMin: v.optional(v.number()),
                budgetMax: v.optional(v.number()),
                location: v.optional(v.string()),
                area: v.optional(v.string()),
                bedsMin: v.optional(v.number()),
                bathsMin: v.optional(v.number()),
                sqftMin: v.optional(v.number()),
                sqftMax: v.optional(v.number()),
            }),
        ),
        linkedDealId: v.optional(v.id("deals")),
        closeNote: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastActivityAt: v.number(),
    })
        .index("by_orgId", ["orgId"])
        .index("by_dealId", ["dealId"])
        .index("by_orgId_and_status", ["orgId", "status"])
        .index("offerPackageId", ["offerPackageId"])
        .index("tenantOrgId_stage_lastActivityAt", ["tenantOrgId", "stage", "lastActivityAt"])
        .index("by_org_stage_lastActivityAt", ["orgId", "stage", "lastActivityAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("visibility_stage_lastActivityAt", ["visibility", "stage", "lastActivityAt"])
        .index("stage", ["stage"])
        .index("type", ["type"])
        .index("initiatedByAuthUserId", ["initiatedByAuthUserId"])
        .index("sourceConversationId", ["sourceConversationId"]),
    offerCaseParticipants: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        offerCaseId: v.id("offerCases"),
        tenantOrgId: v.optional(v.string()),
        authUserId: v.optional(v.string()),
        brokerId: v.optional(v.id("brokers")),
        REDId: v.optional(v.id("RED")),
        role: v.union(
            v.literal("inventory_owner"),
            v.literal("client_owner"),
            v.literal("execution_provider"),
        ),
        status: v.union(
            v.literal("pending"),
            v.literal("active"),
            v.literal("accepted"),
            v.literal("rejected"),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastActivityAt: v.optional(v.number()),
    })
        .index("offerCaseId", ["offerCaseId"])
        .index("by_case_user", ["offerCaseId", "authUserId"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("authUserId", ["authUserId"])
        .index("authUserId_lastActivityAt", ["authUserId", "lastActivityAt"])
        .index("brokerId", ["brokerId"])
        .index("brokerId_lastActivityAt", ["brokerId", "lastActivityAt"])
        .index("REDId", ["REDId"])
        .index("REDId_lastActivityAt", ["REDId", "lastActivityAt"]),
    offerActivities: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        offerCaseId: v.id("offerCases"),
        tenantOrgId: v.optional(v.string()),
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
    })
        .index("offerCaseId", ["offerCaseId"])
        .index("offerCaseId_createdAt", ["offerCaseId", "createdAt"])
        .index("by_org_createdAt", ["orgId", "createdAt"]),
};

export default offersTables;
