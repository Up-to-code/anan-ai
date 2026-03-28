import { defineTable } from "convex/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "./uploadedFiles";

/**
 * CRM Schema
 * 
 * Lifecycle:
 * - created by Broker / RED members to track potential leads/deals
 * - powers the Kanban board
 */

const crmTables = {
    crmClients: defineTable({
        ownerAuthUserId: v.string(),
        brokerId: v.optional(v.id("brokers")),
        REDId: v.optional(v.id("RED")),
        name: v.string(),
        phone: v.optional(v.string()),
        email: v.optional(v.string()),
        notes: v.optional(v.string()),
        sourceClientId: v.optional(v.string()),
        sourceSystem: v.optional(v.string()),
        externalId: v.optional(v.string()),
        businessId: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("ownerAuthUserId", ["ownerAuthUserId"])
        .index("brokerId", ["brokerId"])
        .index("REDId", ["REDId"]),
    deals: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        value: v.optional(v.number()),
        nextFollowUpAt: v.optional(v.number()),
        createdAt: v.number(),
        stage: v.union(
            v.literal("new"),        // فرصة جديدة
            v.literal("contacted"),  // تواصل أولي
            v.literal("negotiation"),// مفاوضات
            v.literal("won"),        // منجزة
            v.literal("lost")
        ),
        relationType: v.optional(
            v.union(v.literal("internal_client"), v.literal("broker_managed"))
        ),
        crmClientId: v.optional(v.id("crmClients")),
        relatedBrokerId: v.optional(v.id("brokers")),
        REDId: v.optional(v.id("RED")),
        brokerId: v.optional(v.id("brokers")),
        assignedTo: v.optional(v.id("userProfiles")),
        contactName: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        propertyId: v.optional(v.id("properties")),
        // Phase 1 additions
        offerId: v.optional(v.id("offers")),
        offerCaseId: v.optional(v.id("offerCases")),
        notes: v.optional(v.string()),
        sourceSystem: v.optional(v.string()),
        externalId: v.optional(v.string()),
        businessId: v.optional(v.string()),
        documentIds: v.optional(v.array(v.id("_storage"))),
        documents: v.optional(uploadedFileReferenceListValidator),
        lastUpdatedBy: v.optional(v.string()),
        archivedAt: v.optional(v.number()),
        archivedBy: v.optional(v.string()),
    })
        .index("REDId", ["REDId"])
        .index("brokerId", ["brokerId"])
        .index("assignedTo", ["assignedTo"])
        .index("stage", ["stage"])
        .index("propertyId", ["propertyId"])
        .index("offerId", ["offerId"])
        .index("offerCaseId", ["offerCaseId"])
        .index("crmClientId", ["crmClientId"])
        .index("relatedBrokerId", ["relatedBrokerId"]),
};

export default crmTables;
