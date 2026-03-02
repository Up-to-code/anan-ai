import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * CRM Schema
 * 
 * Lifecycle:
 * - created by Broker / RED members to track potential leads/deals
 * - powers the Kanban board
 */

const crmTables = {
    deals: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        value: v.optional(v.number()),
        stage: v.union(
            v.literal("new"),        // فرصة جديدة
            v.literal("contacted"),  // تواصل أولي
            v.literal("negotiation"),// مفاوضات
            v.literal("won"),        // منجزة
            v.literal("lost")
        ),
        REDId: v.optional(v.id("RED")),
        brokerId: v.optional(v.id("brokers")),
        assignedTo: v.optional(v.id("userProfiles")),
        contactName: v.optional(v.string()),
        contactPhone: v.optional(v.string()),
        propertyId: v.optional(v.id("properties")),
        // Phase 1 additions
        offerId: v.optional(v.id("offers")),
        notes: v.optional(v.string()),
        documentIds: v.optional(v.array(v.id("_storage"))),
        lastUpdatedBy: v.optional(v.string()),
    })
        .index("REDId", ["REDId"])
        .index("brokerId", ["brokerId"])
        .index("assignedTo", ["assignedTo"])
        .index("stage", ["stage"])
        .index("propertyId", ["propertyId"])
        .index("offerId", ["offerId"]),
};

export default crmTables;
