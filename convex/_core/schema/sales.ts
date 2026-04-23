import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";

/**
 * Sales and Orders Schema
 *
 * Lifecycle:
 * - CRM system storing order intents, loans, and banking bundles
 */

const salesTables = {
    /** Orders (pipeline / CRM) */
    orders: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        userId: v.string(),
        type: v.union(v.literal("property"), v.literal("loan")),
        status: v.union(
            v.literal("new_lead"),
            v.literal("contacted"),
            v.literal("qualified"),
            v.literal("offer_made"),
            v.literal("under_contract"),
            v.literal("closed_won"),
            v.literal("closed_lost"),
        ),
        propertyId: v.optional(v.id("properties")),
        bankId: v.optional(v.id("banks")),
        REDId: v.optional(v.id("RED")), // Replaces partnerId
        intent: v.optional(v.string()),
        notes: v.optional(v.string()),
        assignedTo: v.optional(v.string()),
        threadId: v.optional(v.string()),
        sourceChannel: v.optional(
            v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
        ),
    })
        .index("userId", ["userId"])
        .index("status", ["status"])
        .index("REDId", ["REDId"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),

    /** Banks for getBundles */
    banks: defineTable({
    ...transitionalGlobalSecurityFields,
        name: v.string(),
        slug: v.string(),
        contactEmail: v.string(),
        rules: v.optional(v.any()),
        description: v.optional(v.string()),
        logoId: v.optional(v.id("_storage")),
        status: v.optional(
            v.union(
                v.literal("active"),
                v.literal("inactive"),
                v.literal("suspended"),
            ),
        ),
        products: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    type: v.string(),
                    description: v.optional(v.string()),
                    rules: v.optional(v.any()), // Dynamic bank rule engine rules
                }),
            ),
        ),
    })
        .index("slug", ["slug"])
        .index("status", ["status"])
        .index("by_deletedAt_updatedAt", ["deletedAt", "updatedAt"]),
};

export default salesTables;
