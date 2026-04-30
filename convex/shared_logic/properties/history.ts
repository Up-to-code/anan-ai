import { internalQuery, mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { normalizeQueryForCache, propertyFindingValidator } from "./search";

/**
 * WHY:   Search agents need a focused history module for last-search context and search event logging.
 * WHAT:  Reads the latest search context/findings and records search logs and research runs.
 * HOW:   Queries and writes `knowledgeResearch` and `searchLogs` with stable DTO shapes for agents.
 */
export const getLastSearchContext = query({
  args: { userId: v.string(), threadId: v.optional(v.string()) },
  returns: v.union(
    v.null(),
    v.object({ query: v.string(), findingsCount: v.number(), createdAt: v.number() }),
  ),
  handler: async (ctx, { userId, threadId }) => {
    if (threadId) {
      const byThread = await ctx.db
        .query("knowledgeResearch")
        .withIndex("by_threadId_and_createdAt", (q) => q.eq("threadId", threadId))
        .order("desc")
        .first();
      if (byThread) {
        return { query: byThread.query, findingsCount: byThread.propertyFindings.length, createdAt: byThread.createdAt };
      }
    }

    const byUser = await ctx.db
      .query("knowledgeResearch")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .first();
    if (!byUser) return null;
    return { query: byUser.query, findingsCount: byUser.propertyFindings.length, createdAt: byUser.createdAt };
  },
});

export const getLastSearchFindings = query({
  args: { userId: v.string(), threadId: v.optional(v.string()), maxFindings: v.optional(v.number()) },
  returns: v.union(
    v.null(),
    v.object({
      query: v.string(),
      createdAt: v.number(),
      findings: v.array(
        v.object({
          index: v.number(),
          title: v.string(),
          propertyUrl: v.optional(v.string()),
          sourceUrl: v.optional(v.string()),
          sourceTitle: v.optional(v.string()),
          detailSourceUrl: v.optional(v.string()),
          detailFetched: v.optional(v.boolean()),
          description: v.optional(v.string()),
          priceHint: v.optional(v.string()),
          locationHint: v.optional(v.string()),
          bathrooms: v.optional(v.string()),
          area: v.optional(v.string()),
          features: v.optional(v.array(v.string())),
          beds: v.optional(v.string()),
        }),
      ),
    }),
  ),
  handler: async (ctx, { userId, threadId, maxFindings = 10 }) => {
    let record: { query: string; createdAt: number; propertyFindings: Array<Record<string, unknown>> } | null = null;
    if (threadId) {
      record = await ctx.db
        .query("knowledgeResearch")
        .withIndex("by_threadId_and_createdAt", (q) => q.eq("threadId", threadId))
        .order("desc")
        .first();
    }
    if (!record) {
      record = await ctx.db
        .query("knowledgeResearch")
        .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
        .order("desc")
        .first();
    }
    if (!record || !record.propertyFindings.length) return null;

    const limit = Math.min(maxFindings, record.propertyFindings.length);
    const findings = record.propertyFindings.slice(0, limit).map((finding, index) => ({
      index: index + 1,
      title: (finding.title as string) ?? "",
      propertyUrl: finding.propertyUrl as string | undefined,
      sourceUrl: finding.sourceUrl as string | undefined,
      sourceTitle: finding.sourceTitle as string | undefined,
      detailSourceUrl: finding.detailSourceUrl as string | undefined,
      detailFetched: finding.detailFetched as boolean | undefined,
      description: finding.description as string | undefined,
      priceHint: finding.priceHint as string | undefined,
      locationHint: finding.locationHint as string | undefined,
      bathrooms: finding.bathrooms as string | undefined,
      area: finding.area as string | undefined,
      features: finding.features as string[] | undefined,
      beds: finding.beds as string | undefined,
    }));
    return { query: record.query, createdAt: record.createdAt, findings };
  },
});

export const logSearchEvent = mutation({
  args: {
    query: v.optional(v.string()),
    userId: v.optional(v.string()),
    channel: v.optional(v.union(v.literal("workspace"), v.literal("web"), v.literal("admin"))),
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    resultCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  returns: v.id("searchLogs"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("searchLogs", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getRecentSearchCountInternal = internalQuery({
  args: {
    userId: v.string(),
    query: v.string(),
    lookbackMs: v.optional(v.number()),
  },
  returns: v.number(),
  handler: async (ctx, { userId, query, lookbackMs = 1000 * 60 * 60 * 24 }) => {
    const since = Date.now() - lookbackMs;
    const normalizedQuery = normalizeQueryForCache(query);
    const rows = await ctx.db
      .query("searchLogs")
      .withIndex("userId_createdAt", (q) => q.eq("userId", userId).gte("createdAt", since))
      .collect();
    return rows.filter((row) => {
      if (!row.query || row.stage !== "completed") return false;
      if ((row.createdAt ?? row._creationTime) < since) return false;
      return normalizeQueryForCache(row.query) === normalizedQuery;
    }).length;
  },
});

export const getRecentSearchCount = query({
  args: {
    userId: v.string(),
    query: v.string(),
    lookbackMs: v.optional(v.number()),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const since = Date.now() - (args.lookbackMs ?? 1000 * 60 * 60 * 24);
    const normalizedQuery = normalizeQueryForCache(args.query);
    const rows = await ctx.db
      .query("searchLogs")
      .withIndex("userId_createdAt", (q) => q.eq("userId", args.userId).gte("createdAt", since))
      .collect();
    return rows.filter((row) => {
      if (!row.query || row.stage !== "completed") return false;
      if ((row.createdAt ?? row._creationTime) < since) return false;
      return normalizeQueryForCache(row.query) === normalizedQuery;
    }).length;
  },
});

export const logKnowledgeResearch = mutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    query: v.string(),
    channel: v.optional(v.union(v.literal("workspace"), v.literal("web"), v.literal("admin"))),
    status: v.union(v.literal("completed"), v.literal("partial"), v.literal("failed")),
    requestedTopSources: v.number(),
    requestedTopCardsPerSource: v.number(),
    createdAt: v.number(),
    taskList: v.array(v.string()),
    searchTerms: v.array(v.string()),
    sourceRuns: v.array(v.object({ rank: v.number(), title: v.string(), url: v.string(), snippet: v.optional(v.string()) })),
    propertyFindings: v.array(propertyFindingValidator),
  },
  returns: v.id("knowledgeResearch"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledgeResearch", args);
  },
});
