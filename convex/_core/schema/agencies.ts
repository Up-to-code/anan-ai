import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Agencies Schema (Brokers and REDs)
 *
 * Lifecycle:
 * - Created by authorized onboarding/admin/team workflows
 * - verification flow handled by isVerified flag
 */

const agenciesTables = {
    /** Brokers – manage their own properties */
    brokers: defineTable({
        name: v.string(),
        slug: v.string(),
        status: v.optional(v.union(v.literal("active"), v.literal("pending"))),
        isVerified: v.optional(v.boolean()), // Default to false
        contactEmail: v.optional(v.string()),
        phone: v.optional(v.string()),
        logoId: v.optional(v.id("_storage")),
        description: v.optional(v.string()),
        website: v.optional(v.string()),
        notes: v.optional(v.string()),
    })
        .index("slug", ["slug"])
        .index("status", ["status"]),

    /** RED (Real Estate Developers) - replaces Developer and Real Estate roles */
    RED: defineTable({
        name: v.string(),
        slug: v.string(),
        status: v.optional(v.union(v.literal("active"), v.literal("pending"))),
        isVerified: v.optional(v.boolean()), // Default to false
        contactEmail: v.optional(v.string()),
        phone: v.optional(v.string()),
        logoId: v.optional(v.id("_storage")),
        description: v.optional(v.string()),
        website: v.optional(v.string()),
        notes: v.optional(v.string()),
    })
        .index("slug", ["slug"])
        .index("status", ["status"]),

    subscriptions: defineTable({
        ownerType: v.union(v.literal("broker"), v.literal("RED")),
        ownerBrokerId: v.optional(v.id("brokers")),
        ownerREDId: v.optional(v.id("RED")),
        planTier: v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise")),
        status: v.union(v.literal("active"), v.literal("inactive"), v.literal("canceled"), v.literal("trial")),
        actionModeEnabled: v.optional(v.boolean()),
        startedAt: v.optional(v.number()),
        expiresAt: v.optional(v.number()),
    })
        .index("ownerBrokerId", ["ownerBrokerId"])
        .index("ownerREDId", ["ownerREDId"])
        .index("status", ["status"]),

    teamInvites: defineTable({
        ownerType: v.union(v.literal("broker"), v.literal("RED")),
        ownerBrokerId: v.optional(v.id("brokers")),
        ownerREDId: v.optional(v.id("RED")),
        email: v.string(),
        role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
        token: v.string(),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("canceled"), v.literal("expired")),
        invitedBy: v.string(),
        expiresAt: v.number(),
        acceptedBy: v.optional(v.string()),
        acceptedAt: v.optional(v.number()),
    })
        .index("token", ["token"])
        .index("email", ["email"])
        .index("ownerBrokerId", ["ownerBrokerId"])
        .index("ownerREDId", ["ownerREDId"])
        .index("status", ["status"]),
};

export default agenciesTables;
