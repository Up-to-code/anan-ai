import { defineTable } from "convex/server";
import { v } from "convex/values";
import {
  userRoleApprovalStatusValidator,
  userRoleValidator,
} from "../security/profileRoles";
import { profileMetadataValidator } from "../security/adminAccess";
import { transitionalGlobalSecurityFields } from "./securityFields";

const userTables = {
  userProfiles: defineTable({
    ...transitionalGlobalSecurityFields,
    authUserId: v.string(), // current auth subject key used by backend authorization
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    usernameLower: v.optional(v.string()),
    role: v.optional(userRoleValidator),
    orgId: v.optional(v.id("organizations")),
    roleApprovalStatus: v.optional(userRoleApprovalStatusValidator),
    requestedRole: v.optional(userRoleValidator),
    brokerId: v.optional(v.id("brokers")),
    developerId: v.optional(v.id("RED")),
    licenseNumber: v.optional(v.string()),
    permissionScopes: v.optional(v.array(v.string())),
    // Legacy compatibility fields kept temporarily so migrations can clean old documents safely.
    roleStatus: v.optional(userRoleApprovalStatusValidator),
    REDId: v.optional(v.id("RED")),
    currentTenantOrgId: v.optional(v.string()),
    showInOffersDirectory: v.optional(v.boolean()),
    metadata: v.optional(profileMetadataValidator),
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
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_role", ["orgId", "role"])
    .index("by_orgId_and_authUserId", ["orgId", "authUserId"])
    .index("roleApprovalStatus", ["roleApprovalStatus"])
    .index("currentTenantOrgId", ["currentTenantOrgId"])
    .index("by_deletedAt_updatedAt", ["deletedAt", "updatedAt"]),
  users: defineTable({
    ...transitionalGlobalSecurityFields,
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
    .index("userId", ["userId"])
    .index("by_deletedAt_updatedAt", ["deletedAt", "updatedAt"]),
};

export default userTables;
