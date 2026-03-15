
import { defineTable } from "convex/server";
import { v } from "convex/values";

const userTables = {
    userProfiles: defineTable({
        authUserId: v.string(), // current auth subject key used by backend authorization
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        username: v.optional(v.string()),
        usernameLower: v.optional(v.string()),
        role: v.optional(
            v.union(
                v.literal("admin"),
                v.literal("broker"),
                v.literal("developer"),
                v.literal("user"),
                v.literal("RED")
            )
        ),
        roleStatus: v.optional(
            v.union(
                v.literal("pending"),
                v.literal("approved"),
                v.literal("rejected")
            )
        ),
        requestedRole: v.optional(
            v.union(
                v.literal("admin"),
                v.literal("broker"),
                v.literal("developer"),
                v.literal("user"),
                v.literal("RED")
            )
        ),
        brokerId: v.optional(v.id("brokers")),
        REDId: v.optional(v.id("RED")),
        currentTenantOrgId: v.optional(v.string()),
        showInOffersDirectory: v.optional(v.boolean()),
        isActive: v.optional(v.boolean()),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    })
        .index("authUserId", ["authUserId"])
        .index("email", ["email"])
        .index("usernameLower", ["usernameLower"])
        .index("role", ["role"])
        .index("roleStatus", ["roleStatus"])
        .index("currentTenantOrgId", ["currentTenantOrgId"]),
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
        userId: v.optional(v.string()), // external app/channel identifier
        displayName: v.optional(v.string()),
        channel: v.optional(v.string()),
    })
        .index("email", ["email"])
        .index("phone", ["phone"])
        .index("userId", ["userId"]),
};

export default userTables;
