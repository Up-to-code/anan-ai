import { defineTable } from "convex/server";
import { v } from "convex/values";

const organizationTypeValidator = v.union(v.literal("broker"), v.literal("red"));
const legacyOwnerTypeValidator = v.union(v.literal("broker"), v.literal("RED"));

/**
 * WHY:   Clerk Organizations become the tenant source of truth, but the app still needs local metadata
 *        and a compatibility bridge while older workspace/business flows migrate.
 * WHAT:  Org-scoped metadata tables for profiles, files, conversations, assistant sessions/events, and memory.
 * HOW:   Every table is rooted on `organizationId` and indexed for the current hot paths so future migrations
 *        can move off legacy tenant ownership without rewriting the schema again.
 */
const organizationTables = {
  organizationProfiles: defineTable({
    organizationId: v.string(),
    slug: v.string(),
    name: v.string(),
    type: organizationTypeValidator,
    status: v.optional(v.union(v.literal("active"), v.literal("pending"))),
    isVerified: v.optional(v.boolean()),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    phone: v.optional(v.string()),
    legacyTenantOrgId: v.optional(v.string()),
    legacyOwnerType: v.optional(legacyOwnerTypeValidator),
    legacyOwnerBrokerId: v.optional(v.id("brokers")),
    legacyOwnerREDId: v.optional(v.id("RED")),
    branding: v.optional(v.object({
      primaryColor: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      wordmarkUrl: v.optional(v.string()),
    })),
    featureFlags: v.optional(v.any()),
    settings: v.optional(v.any()),
    createdByUserId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("organizationId", ["organizationId"])
    .index("slug", ["slug"])
    .index("type", ["type"])
    .index("legacyTenantOrgId", ["legacyTenantOrgId"]),

  organizationFiles: defineTable({
    organizationId: v.string(),
    key: v.string(),
    url: v.string(),
    name: v.string(),
    mime: v.optional(v.string()),
    size: v.optional(v.number()),
    uploadedByUserId: v.string(),
    visibility: v.union(v.literal("internal"), v.literal("shared_result")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("organizationId", ["organizationId"])
    .index("organizationId_createdAt", ["organizationId", "createdAt"])
    .index("key", ["key"]),

  organizationEntityFiles: defineTable({
    organizationId: v.string(),
    fileId: v.id("organizationFiles"),
    entityType: v.string(),
    entityId: v.string(),
    createdByUserId: v.string(),
    createdAt: v.number(),
  })
    .index("organizationId_entityType_entityId", ["organizationId", "entityType", "entityId"])
    .index("fileId", ["fileId"]),

  organizationAssistantSessions: defineTable({
    organizationId: v.string(),
    threadId: v.optional(v.id("assistantThreads")),
    actorUserId: v.string(),
    channel: v.optional(v.string()),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),
    title: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("organizationId_createdAt", ["organizationId", "createdAt"])
    .index("organizationId_status_updatedAt", ["organizationId", "status", "updatedAt"])
    .index("threadId", ["threadId"]),

  organizationAssistantEvents: defineTable({
    organizationId: v.string(),
    sessionId: v.id("organizationAssistantSessions"),
    actorUserId: v.string(),
    kind: v.union(
      v.literal("message_visible"),
      v.literal("tool_run"),
      v.literal("prompt_context"),
      v.literal("orchestration"),
      v.literal("audit"),
    ),
    visibility: v.union(v.literal("internal"), v.literal("user_visible")),
    summary: v.optional(v.string()),
    payload: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("organizationId_sessionId_createdAt", ["organizationId", "sessionId", "createdAt"])
    .index("organizationId_visibility_createdAt", ["organizationId", "visibility", "createdAt"]),

  organizationMemories: defineTable({
    organizationId: v.string(),
    actorUserId: v.optional(v.string()),
    scope: v.union(v.literal("workspace"), v.literal("assistant"), v.literal("crm"), v.literal("market")),
    key: v.string(),
    summary: v.string(),
    value: v.any(),
    importance: v.optional(v.number()),
    source: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("organizationId", ["organizationId"])
    .index("organizationId_scope_updatedAt", ["organizationId", "scope", "updatedAt"])
    .index("organizationId_key", ["organizationId", "key"]),
};

export default organizationTables;
