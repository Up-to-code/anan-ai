import { defineTable } from "convex/server";
import { v } from "convex/values";

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
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        category: v.optional(v.string()),
    })
        .index("slug", ["slug"])
        .index("category", ["category"]),

    /** Developer handbook pages (architecture + best practices). Secret-free by design. */
    developerHandbookPages: defineTable({
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
        userId: v.string(),
        threadId: v.optional(v.string()),
        memoryType: v.union(
            v.literal("preference"),
            v.literal("fact"),
            v.literal("interaction"),
            v.literal("constraint"),
            v.literal("feedback"),
        ),
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
        metadata: v.optional(v.any()), // dynamic agent state objects
    })
        .index("userId", ["userId"])
        .index("userId_and_memoryType", ["userId", "memoryType"])
        .index("userId_and_key", ["userId", "key"])
        .index("expiresAt", ["expiresAt"]),

    /** Entity relationships for knowledge graph. */
    entityRelations: defineTable({
        fromType: v.string(),
        fromId: v.string(),
        relationType: v.string(),
        toType: v.string(),
        toId: v.string(),
        userId: v.optional(v.string()),
        strength: v.optional(v.number()),
        metadata: v.optional(v.any()),
        createdAt: v.number(),
    })
        .index("from", ["fromType", "fromId"])
        .index("to", ["toType", "toId"])
        .index("from_to_relation", ["fromType", "fromId", "toId", "relationType"]),

    assistantThreads: defineTable({
        userId: v.string(),
        ownerType: v.union(v.literal("broker"), v.literal("RED"), v.literal("user")),
        ownerBrokerId: v.optional(v.id("brokers")),
        ownerREDId: v.optional(v.id("RED")),
        mode: v.union(v.literal("qa"), v.literal("action")),
        orchestratorName: v.optional(v.string()),
        assistantKind: v.optional(
            v.union(
                v.literal("default"),
                v.literal("anan_workspace"),
                v.literal("anan_pro"),
            ),
        ),
        title: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("userId", ["userId"])
        .index("ownerBrokerId", ["ownerBrokerId"])
        .index("ownerREDId", ["ownerREDId"]),

    assistantMessages: defineTable({
        threadId: v.id("assistantThreads"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        mode: v.union(v.literal("qa"), v.literal("action")),
        metadata: v.optional(v.any()),
        createdAt: v.number(),
    }).index("threadId", ["threadId"]),
};

export default knowledgeTables;
