import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Search Schema
 * 
 * Lifecycle:
 * - Logs and caches user searches across the platform
 */

const propertyFindingSchema = v.object({
    sourceRank: v.number(),
    sourceUrl: v.string(),
    sourceTitle: v.optional(v.string()),
    cardRank: v.number(),
    propertyUrl: v.optional(v.string()),
    detailSourceUrl: v.optional(v.string()),
    detailFetched: v.optional(v.boolean()),
    title: v.string(),
    description: v.optional(v.string()),
    priceHint: v.optional(v.string()),
    locationHint: v.optional(v.string()),
    imageUrls: v.array(v.string()),
    offerDetails: v.optional(v.string()),
    confidence: v.optional(v.number()),
    bathrooms: v.optional(v.string()),
    area: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    beds: v.optional(v.string()),
});

export const searchTables = {
    /** Global search cache (cross-user) */
    globalSearchCache: defineTable({
        cacheKey: v.string(),
        query: v.string(),
        normalizedQuery: v.string(),
        scope: v.optional(v.union(v.literal("saudi"), v.literal("uae"), v.literal("global"))),
        offset: v.number(),
        status: v.union(
            v.literal("completed"),
            v.literal("partial"),
            v.literal("failed"),
        ),
        createdAt: v.number(),
        expiresAt: v.number(),
        hitCount: v.optional(v.number()),
        lastHitAt: v.optional(v.number()),
        propertyFindings: v.array(propertyFindingSchema),
    }).index("cacheKey", ["cacheKey"]),

    /** Per-user search cache / last search context */
    knowledgeResearch: defineTable({
        userId: v.string(),
        threadId: v.optional(v.string()),
        query: v.string(),
        channel: v.optional(
            v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web")),
        ),
        status: v.union(
            v.literal("completed"),
            v.literal("partial"),
            v.literal("failed"),
        ),
        requestedTopSources: v.number(),
        requestedTopCardsPerSource: v.number(),
        createdAt: v.number(),
        taskList: v.array(v.string()),
        searchTerms: v.array(v.string()),
        sourceRuns: v.array(
            v.object({
                rank: v.number(),
                title: v.string(),
                url: v.string(),
                snippet: v.optional(v.string()),
            }),
        ),
        propertyFindings: v.array(propertyFindingSchema),
    })
        .index("by_userId_and_createdAt", ["userId", "createdAt"])
        .index("by_threadId_and_createdAt", ["threadId", "createdAt"]),

    /** Search lifecycle logs (for getRecentSearchCount) */
    searchLogs: defineTable({
        query: v.optional(v.string()),
        userId: v.optional(v.string()),
        channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
        stage: v.optional(v.string()),
        status: v.optional(v.string()),
        source: v.optional(v.string()),
        resultCount: v.optional(v.number()),
        errorMessage: v.optional(v.string()),
    }).index("userId", ["userId"]),
};

export default searchTables;
