import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";
import { boundedMetadataValidator, unsafeDynamicPayloadValidator } from "./securityValidators";

const auditCategoryValidator = v.union(
  v.literal("auth"),
  v.literal("financial"),
  v.literal("document"),
  v.literal("role"),
  v.literal("crm"),
  v.literal("inventory"),
  v.literal("ai"),
  v.literal("system"),
);

const auditOutcomeValidator = v.union(
  v.literal("success"),
  v.literal("failure"),
  v.literal("denied"),
);

/**
 * WHY:   Enterprise audit and compliance need a single append-only trail that
 *        spans identity, inventory, CRM, documents, AI, and OAuth events.
 * WHAT:  Defines the canonical global audit log plus envelope-encryption key
 *        metadata used by application-layer field encryption.
 * HOW:   Mutations insert audit rows transactionally; retention/redaction jobs
 *        append follow-up events instead of mutating historical intent.
 */
const auditTables = {
  auditLog: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    actorAuthUserId: v.id("authUsers"),
    actorProfileId: v.optional(v.id("userProfiles")),
    eventType: v.string(),
    category: auditCategoryValidator,
    resourceType: v.string(),
    resourceId: v.string(),
    action: v.string(),
    outcome: auditOutcomeValidator,
    ipHash: v.optional(v.string()),
    userAgentHash: v.optional(v.string()),
    requestId: v.optional(v.string()),
    before: v.optional(unsafeDynamicPayloadValidator),
    after: v.optional(unsafeDynamicPayloadValidator),
    metadata: v.optional(boundedMetadataValidator),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org_createdAt", ["orgId", "createdAt"])
    .index("by_org_actor_createdAt", ["orgId", "actorAuthUserId", "createdAt"])
    .index("by_org_resource_createdAt", ["orgId", "resourceType", "resourceId", "createdAt"])
    .index("by_org_category_createdAt", ["orgId", "category", "createdAt"])
    .index("by_actor_createdAt", ["actorAuthUserId", "createdAt"]),

  encryptionKeys: defineTable({
    ...transitionalGlobalSecurityFields,
    orgId: v.optional(v.id("organizations")),
    subjectAuthUserId: v.optional(v.id("authUsers")),
    keyId: v.string(),
    encryptedDEK: v.string(),
    version: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("rotating"),
      v.literal("retired"),
      v.literal("revoked"),
    ),
    rotatedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_keyId", ["keyId"])
    .index("by_org_status", ["orgId", "status"])
    .index("by_subjectAuthUser_status", ["subjectAuthUserId", "status"]),
};

export default auditTables;
