import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Users and Profiles Schema
 *
 * Lifecycle:
 * - created by better-auth inside convex/auth.ts flow
 * - userProfiles manually linked on upgradeToBroker or upgradeToRED
 */

const baseUserTables = {
    users: defineTable({
        userId: v.string(),
        displayName: v.optional(v.string()),
        channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
    }).index("userId", ["userId"]),

    /** Links auth user (better-auth) to broker/RED. Role from user.role. */
    userProfiles: defineTable({
        authUserId: v.string(),
        brokerId: v.optional(v.id("brokers")),
        REDId: v.optional(v.id("RED")), // Replaces realEstateId and partnerId
        role: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    }).index("authUserId", ["authUserId"]),
};

export default baseUserTables;
