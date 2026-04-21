import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  userRoleApprovalStatusValidator,
  userRoleValidator,
} from "../security/profileRoles";

const userTables = {
  userProfiles: defineTable({
    authUserId: v.string(), // current auth subject key used by backend authorization
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    usernameLower: v.optional(v.string()),
    role: v.optional(userRoleValidator),
    roleApprovalStatus: v.optional(userRoleApprovalStatusValidator),
    requestedRole: v.optional(userRoleValidator),
    brokerId: v.optional(v.id("brokers")),
    developerId: v.optional(v.id("RED")),
    // Legacy compatibility fields kept temporarily so migrations can clean old documents safely.
    roleStatus: v.optional(userRoleApprovalStatusValidator),
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
    .index("brokerId", ["brokerId"])
    .index("developerId", ["developerId"])
    .index("role", ["role"])
    .index("roleApprovalStatus", ["roleApprovalStatus"])
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
  mobileBuyerAccounts: defineTable({
    authUserId: v.string(),
    profile: v.object({
      displayName: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    savedPropertyIds: v.array(v.id("properties")),
    consents: v.object({
      privacyAcceptedAt: v.optional(v.number()),
      termsAcceptedAt: v.optional(v.number()),
      microphoneAcceptedAt: v.optional(v.number()),
      supportAcceptedAt: v.optional(v.number()),
    }),
    preferences: v.object({
      locale: v.union(v.literal("ar"), v.literal("en")),
      onboardingCompletedAt: v.optional(v.number()),
      authEntryDismissedAt: v.optional(v.number()),
      financeDefaults: v.object({
        downPaymentPercent: v.number(),
        preferredYears: v.number(),
        annualRate: v.number(),
      }),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("authUserId", ["authUserId"]),
};

export default userTables;
