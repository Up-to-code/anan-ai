import { defineTable } from "convex/server";
import { v } from "convex/values";
import { transitionalGlobalSecurityFields } from "./securityFields";
import { unsafeDynamicPayloadValidator } from "./securityValidators";

/**
 * Knowledge Graph Schema
 * 
 * Lifecycle:
 * - AI agent writes context facts, user memory
 * - Graph maps connections between users, properties, and interactions
 */

const knowledgeTables = {
    /** Knowledge pages (FAQ, guides) */
    knowledgePages: defineTable({
    ...transitionalGlobalSecurityFields,
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        category: v.optional(v.string()),
    })
        .index("slug", ["slug"])
        .index("category", ["category"]),

    /** Developer handbook pages (architecture + best practices). Secret-free by design. */
    developerHandbookPages: defineTable({
    ...transitionalGlobalSecurityFields,
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        category: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("slug", ["slug"])
        .index("category", ["category"])
        .searchIndex("search_content", { searchField: "content" })
        .searchIndex("search_title", { searchField: "title" }),

    /** Agent memory for cross-session persistence. */
    agentMemory: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        authUserId: v.optional(v.id("authUsers")),
        userId: v.string(),
        threadId: v.optional(v.string()),
        memoryType: v.optional(v.union(
            v.literal("preference"),
            v.literal("fact"),
            v.literal("interaction"),
            v.literal("constraint"),
            v.literal("feedback"),
        )),
        entityType: v.optional(
            v.union(
                v.literal("property"),
                v.literal("location"),
                v.literal("bank"),
                v.literal("product"),
                v.literal("neighborhood"),
            ),
        ),
        entityId: v.optional(v.string()),
        key: v.string(),
        value: v.string(),
        confidence: v.optional(v.number()),
        source: v.optional(v.string()),
        expiresAt: v.optional(v.number()),
        metadata: v.optional(unsafeDynamicPayloadValidator), // dynamic agent state objects
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
        lastUpdatedAt: v.optional(v.number()),
    })
        .index("userId", ["userId"])
        .index("userId_and_memoryType", ["userId", "memoryType"])
        .index("userId_and_key", ["userId", "key"])
        .index("expiresAt", ["expiresAt"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("by_authUser_createdAt", ["authUserId", "createdAt"]),

    /** Entity relationships for knowledge graph. */
    entityRelations: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        fromType: v.string(),
        fromId: v.string(),
        relationType: v.string(),
        toType: v.string(),
        toId: v.string(),
        userId: v.optional(v.string()),
        strength: v.optional(v.number()),
        metadata: v.optional(unsafeDynamicPayloadValidator),
        createdAt: v.number(),
    })
        .index("from", ["fromType", "fromId"])
        .index("to", ["toType", "toId"])
        .index("from_to_relation", ["fromType", "fromId", "toId", "relationType"])
        .index("by_org_from", ["orgId", "fromType", "fromId"])
        .index("by_org_to", ["orgId", "toType", "toId"]),

    assistantThreads: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        authUserId: v.optional(v.id("authUsers")),
        userId: v.string(),
        scope: v.optional(v.union(v.literal("user"), v.literal("organization"))),
        ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
        ownerBrokerId: v.optional(v.id("brokers")),
        ownerREDId: v.optional(v.id("RED")),
        mode: v.union(v.literal("qa"), v.literal("action")),
        orchestratorName: v.optional(v.string()),
        assistantKind: v.optional(
            v.union(
                v.literal("default"),
                v.literal("anan_main_public"),
                v.literal("anan_workspace"),
                v.literal("anan_pro"),
            ),
        ),
        title: v.optional(v.string()),
        channel: v.optional(v.string()),
        status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
        lastActivityAt: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_org_kind_updatedAt", ["orgId", "assistantKind", "updatedAt"])
        .index("userId", ["userId"])
        .index("userId_assistantKind_updatedAt", ["userId", "assistantKind", "updatedAt"])
        .index("ownerBrokerId", ["ownerBrokerId"])
        .index("ownerBrokerId_assistantKind_updatedAt", ["ownerBrokerId", "assistantKind", "updatedAt"])
        .index("ownerREDId", ["ownerREDId"])
        .index("ownerREDId_assistantKind_updatedAt", ["ownerREDId", "assistantKind", "updatedAt"]),

    assistantMessages: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        authUserId: v.optional(v.id("authUsers")),
        threadId: v.id("assistantThreads"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        body: v.optional(v.string()),
        sentAt: v.optional(v.number()),
        content: v.string(),
        mode: v.union(v.literal("qa"), v.literal("action")),
        metadata: v.optional(unsafeDynamicPayloadValidator),
        createdAt: v.number(),
    })
        .index("by_threadId", ["threadId", "sentAt"])
        .index("threadId", ["threadId"])
        .index("threadId_createdAt", ["threadId", "createdAt"])
        .index("by_org_createdAt", ["orgId", "createdAt"]),

    assistantThreadState: defineTable({
    ...transitionalGlobalSecurityFields,
        threadId: v.string(),
        userId: v.string(),
        scope: v.optional(v.union(v.literal("user"), v.literal("organization"))),
        ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
        ownerBrokerId: v.optional(v.id("brokers")),
        ownerREDId: v.optional(v.id("RED")),
        mode: v.union(v.literal("qa"), v.literal("action")),
        channel: v.optional(v.union(v.literal("workspace"), v.literal("web"), v.literal("admin"))),
        orchestratorName: v.optional(v.string()),
        assistantKind: v.optional(
            v.union(
                v.literal("default"),
                v.literal("anan_main_public"),
                v.literal("anan_workspace"),
                v.literal("anan_pro"),
            ),
        ),
        title: v.optional(v.string()),
        legacyThreadId: v.optional(v.id("assistantThreads")),
        migrationStatus: v.optional(v.union(v.literal("canonical"), v.literal("backfilled"))),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("threadId", ["threadId"])
        .index("legacyThreadId", ["legacyThreadId"])
        .index("userId", ["userId"])
        .index("userId_assistantKind_updatedAt", ["userId", "assistantKind", "updatedAt"])
        .index("ownerBrokerId", ["ownerBrokerId"])
        .index("ownerBrokerId_assistantKind_updatedAt", ["ownerBrokerId", "assistantKind", "updatedAt"])
        .index("ownerREDId", ["ownerREDId"])
        .index("ownerREDId_assistantKind_updatedAt", ["ownerREDId", "assistantKind", "updatedAt"]),

    assistantMessageState: defineTable({
    ...transitionalGlobalSecurityFields,
        messageId: v.string(),
        threadId: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        mode: v.union(v.literal("qa"), v.literal("action")),
        metadata: v.optional(unsafeDynamicPayloadValidator),
        legacyMessageId: v.optional(v.id("assistantMessages")),
        promptMessageId: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("messageId", ["messageId"])
        .index("legacyMessageId", ["legacyMessageId"])
        .index("threadId_createdAt", ["threadId", "createdAt"]),

    assistantStreamEvents: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        authUserId: v.optional(v.id("authUsers")),
        sessionId: v.string(),
        seq: v.number(),
        eventType: v.union(
            v.literal("stage"),
            v.literal("delta"),
            v.literal("assistant_meta"),
            v.literal("thread"),
            v.literal("lifecycle"),
            v.literal("error"),
        ),
        phase: v.optional(v.union(
            v.literal("intent_started"),
            v.literal("intent_done"),
            v.literal("team_started"),
            v.literal("team_done"),
            v.literal("merge_started"),
            v.literal("merge_done"),
            v.literal("action_started"),
            v.literal("action_done"),
            v.literal("persist_started"),
            v.literal("persist_done"),
        )),
        status: v.optional(v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("cancelled"))),
        teamId: v.optional(v.string()),
        agentName: v.optional(v.string()),
        delta: v.optional(v.string()),
        threadId: v.optional(v.string()),
        title: v.optional(v.string()),
        meta: v.optional(unsafeDynamicPayloadValidator),
        message: v.optional(v.string()),
        code: v.optional(v.string()),
        details: v.optional(unsafeDynamicPayloadValidator),
        userId: v.string(),
        ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
        ownerBrokerId: v.optional(v.id("brokers")),
        ownerREDId: v.optional(v.id("RED")),
        createdAt: v.number(),
    })
        .index("sessionId", ["sessionId"])
        .index("sessionId_seq", ["sessionId", "seq"])
        .index("by_createdAt", ["createdAt"]),

};

export default knowledgeTables;
