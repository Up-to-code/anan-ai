import { defineTable } from "convex/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "./uploadedFiles";
import { transitionalGlobalSecurityFields } from "./securityFields";

/**
 * CRM Schema
 * 
 * Lifecycle:
 * - created by Broker / RED members to track potential leads/deals
 * - powers the Kanban board
 */

const crmTables = {
    crmClients: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        ownerAuthUserId: v.string(),
        tenantOrgId: v.optional(v.string()),
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
        .index("tenantOrgId", ["tenantOrgId"])
        .index("tenantOrgId_updatedAt", ["tenantOrgId", "updatedAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("ownerAuthUserId", ["ownerAuthUserId"])
        .index("brokerId", ["brokerId"])
        .index("REDId", ["REDId"]),
    deals: defineTable({
    ...transitionalGlobalSecurityFields,
        title: v.string(),
        orgId: v.optional(v.id("organizations")),
        contactId: v.optional(v.id("crmContacts")),
        tenantOrgId: v.optional(v.string()),
        description: v.optional(v.string()),
        value: v.optional(v.number()),
        nextFollowUpAt: v.optional(v.number()),
        // Legacy deployments already contain deal rows created before this field existed.
        // Keep the schema backward-compatible while current write paths continue populating it.
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
        stage: v.union(
            v.literal("new"),        // فرصة جديدة
            v.literal("contacted"),  // تواصل أولي
            v.literal("viewing"),
            v.literal("offer"),
            v.literal("contract"),
            v.literal("negotiation"),// مفاوضات
            v.literal("won"),        // منجزة
            v.literal("lost")
        ),
        pipeline: v.optional(v.string()),
        dealValue: v.optional(v.number()),
        currency: v.optional(v.string()),
        lostReason: v.optional(v.string()),
        closedAt: v.optional(v.number()),
        relationType: v.optional(
            v.union(v.literal("internal_client"), v.literal("broker_managed"))
        ),
        crmClientId: v.optional(v.id("crmClients")),
        relatedBrokerId: v.optional(v.id("brokers")),
        REDId: v.optional(v.id("RED")),
        brokerId: v.optional(v.id("brokers")),
        assignedTo: v.optional(v.id("userProfiles")),
        assignedToProfileId: v.optional(v.id("userProfiles")),
        contactName: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        propertyId: v.optional(v.id("properties")),
        unitId: v.optional(v.id("projectUnits")),
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
        .index("by_orgId", ["orgId"])
        .index("by_orgId_and_stage", ["orgId", "stage"])
        .index("by_assignedToProfileId", ["assignedToProfileId"])
        .index("by_contactId", ["contactId"])
        .index("tenantOrgId", ["tenantOrgId"])
        .index("tenantOrgId_stage_updatedAt", ["tenantOrgId", "stage", "updatedAt"])
        .index("by_org_stage_updatedAt", ["orgId", "stage", "updatedAt"])
        .index("by_org_assignedTo_updatedAt", ["orgId", "assignedToProfileId", "updatedAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("REDId", ["REDId"])
        .index("REDId_stage_updatedAt", ["REDId", "stage", "updatedAt"])
        .index("brokerId", ["brokerId"])
        .index("brokerId_stage_updatedAt", ["brokerId", "stage", "updatedAt"])
        .index("assignedTo", ["assignedTo"])
        .index("stage", ["stage"])
        .index("propertyId", ["propertyId"])
        .index("propertyId_updatedAt", ["propertyId", "updatedAt"])
        .index("offerId", ["offerId"])
        .index("offerCaseId", ["offerCaseId"])
        .index("crmClientId", ["crmClientId"])
        .index("relatedBrokerId", ["relatedBrokerId"]),
};

export default crmTables;
