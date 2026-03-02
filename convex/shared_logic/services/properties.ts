/**
 * Property service – search, cache, getLastSearchContext, getLastSearchFindings.
 */
import { internalQuery, mutation, query } from "../../_generated/server";
import {
  GLOBAL_SEARCH_CACHE_TTL_MS,
  SEARCH_CACHE_TTL_HOT_MS,
  SEARCH_CACHE_TTL_WARM_MS,
  SEARCH_CACHE_TTL_COLD_MS,
} from "../lib/constants";
import { Infer, v } from "convex/values";

export function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[،,]/g, " ")
    .replace(/\bفي\b/g, "")
    .replace(/\bال\b/g, "")
    .trim();
}

const NORMALIZE_FOR_CACHE: [RegExp, string][] = [
  [/\bشقق\b/g, "شقة"],
  [/\bapartments\b/g, "apartment"],
  [/\bvillas\b/g, "villa"],
  [/الرياض/g, "riyadh"],
  [/جدة|جده/g, "jeddah"],
];

export function normalizeQueryForCache(q: string): string {
  let out = normalizeQuery(q);
  for (const [re, repl] of NORMALIZE_FOR_CACHE) {
    out = out.replace(re, repl);
  }
  return out;
}

const QUERY_STOPWORDS = new Set([
  "a", "an", "the", "in", "at", "for", "of", "to", "with",
  "property", "properties", "home", "house", "real", "estate",
  "في", "من", "على", "الى", "عقار", "عقارات", "شقة", "شقق",
]);

export function tokenizeForCache(query: string): string[] {
  const normalized = normalizeQueryForCache(query);
  return normalized
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !QUERY_STOPWORDS.has(t));
}

export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function extractLocationHint(q: string): string | undefined {
  const cities = ["riyadh", "الرياض", "jeddah", "جدة", "جده", "dammam", "الدمام"];
  const normalized = q.toLowerCase();
  for (const city of cities) {
    if (normalized.includes(city)) return city;
  }
  return undefined;
}

const propertyFindingValidator = v.object({
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

type PropertyFindingCached = Infer<typeof propertyFindingValidator>;

const searchScopeValidator = v.union(
  v.literal("saudi"),
  v.literal("uae"),
  v.literal("global"),
);

function buildGlobalSearchCacheKey(params: {
  query: string;
  offset?: number;
  scope?: "saudi" | "uae" | "global";
}): { cacheKey: string; normalizedQuery: string; scope: "saudi" | "uae" | "global"; offset: number } {
  const normalizedQuery = normalizeQueryForCache(params.query);
  const scope = params.scope ?? "saudi";
  const offset = params.offset ?? 0;
  const cacheKey = `global:${normalizedQuery}:${scope}:${offset}`;
  return { cacheKey, normalizedQuery, scope, offset };
}

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    onlyAvailable: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("properties"),
      _creationTime: v.number(),
      title: v.string(),
      address: v.string(),
      price: v.number(),
      beds: v.number(),
      baths: v.number(),
      description: v.string(),
      location: v.optional(v.string()),
      area: v.optional(v.string()),
      status: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, { query: q, limit = 20, onlyAvailable = true }) => {
    const normalized = normalizeQuery(q);
    let results = await ctx.db
      .query("properties")
      .withSearchIndex("search_full", (s) => s.search("searchText", normalized))
      .take((limit ?? 20) * 2);
    if (results.length === 0) {
      results = await ctx.db
        .query("properties")
        .withSearchIndex("search_body", (s) => s.search("description", normalized))
        .take((limit ?? 20) * 2);
    }
    if (onlyAvailable) {
      results = results.filter((p) => !p.status || p.status === "available");
    }
    results = results.filter(
      (p) =>
        (p as { publicationState?: string }).publicationState !== "draft" &&
        (p as { publicationState?: string }).publicationState !== "archived",
    );
    return results.slice(0, limit ?? 20);
  },
});

export const getGlobalSearchCache = query({
  args: {
    query: v.string(),
    offset: v.optional(v.number()),
    scope: v.optional(searchScopeValidator),
    minFindings: v.optional(v.number()),
    nowMs: v.optional(v.number()),
  },
  returns: v.union(
    v.null(),
    v.object({
      cacheKey: v.string(),
      query: v.string(),
      normalizedQuery: v.string(),
      scope: searchScopeValidator,
      offset: v.number(),
      createdAt: v.number(),
      expiresAt: v.number(),
      status: v.string(),
      propertyFindings: v.array(propertyFindingValidator),
    }),
  ),
  handler: async (
    ctx,
    { query, offset, scope, minFindings = 1, nowMs = Date.now() },
  ) => {
    const key = buildGlobalSearchCacheKey({ query, offset, scope });
    const row = await ctx.db
      .query("globalSearchCache")
      .withIndex("cacheKey", (q) => q.eq("cacheKey", key.cacheKey))
      .first();
    if (!row) return null;
    if (row.expiresAt <= nowMs) return null;
    if ((row.propertyFindings?.length ?? 0) < Math.max(1, minFindings)) return null;
    return {
      cacheKey: row.cacheKey,
      query: row.query,
      normalizedQuery: row.normalizedQuery,
      scope: (row.scope ?? key.scope) as "saudi" | "uae" | "global",
      offset: row.offset,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      status: row.status,
      propertyFindings: row.propertyFindings,
    };
  },
});

export const upsertGlobalSearchCache = mutation({
  args: {
    query: v.string(),
    offset: v.optional(v.number()),
    scope: v.optional(searchScopeValidator),
    propertyFindings: v.array(propertyFindingValidator),
    status: v.optional(v.union(v.literal("completed"), v.literal("partial"), v.literal("failed"))),
    createdAt: v.optional(v.number()),
    ttlMs: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const now = args.createdAt ?? Date.now();
    const cacheMeta = buildGlobalSearchCacheKey({
      query: args.query,
      offset: args.offset,
      scope: args.scope,
    });
    const expiresAt = now + (args.ttlMs ?? GLOBAL_SEARCH_CACHE_TTL_MS);
    const existing = await ctx.db
      .query("globalSearchCache")
      .withIndex("cacheKey", (q) => q.eq("cacheKey", cacheMeta.cacheKey))
      .first();
    const payload = {
      cacheKey: cacheMeta.cacheKey,
      query: args.query,
      normalizedQuery: cacheMeta.normalizedQuery,
      scope: cacheMeta.scope,
      offset: cacheMeta.offset,
      status: args.status ?? "completed",
      createdAt: now,
      expiresAt,
      propertyFindings: args.propertyFindings,
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("globalSearchCache", {
        ...payload,
        hitCount: 0,
      });
    }
    return cacheMeta.cacheKey;
  },
});

export const trackGlobalSearchCacheHit = mutation({
  args: { cacheKey: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { cacheKey }) => {
    const row = await ctx.db
      .query("globalSearchCache")
      .withIndex("cacheKey", (q) => q.eq("cacheKey", cacheKey))
      .first();
    if (!row) return false;
    await ctx.db.patch(row._id, {
      hitCount: (row.hitCount ?? 0) + 1,
      lastHitAt: Date.now(),
    });
    return true;
  },
});

export const getCachedSearchResults = query({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    query: v.string(),
    limit: v.optional(v.number()),
    maxAgeMs: v.optional(v.number()),
  },
  returns: v.union(
    v.null(),
    v.object({
      query: v.string(),
      createdAt: v.number(),
      propertyFindings: v.array(propertyFindingValidator),
      status: v.string(),
    }),
  ),
  handler: async (ctx, { userId, threadId, query, limit = 3, maxAgeMs }) => {
    const now = Date.now();
    const tierCutoffs = maxAgeMs
      ? [now - maxAgeMs]
      : [now - SEARCH_CACHE_TTL_HOT_MS, now - SEARCH_CACHE_TTL_WARM_MS, now - SEARCH_CACHE_TTL_COLD_MS];
    const minFindings = Math.min(limit, 3);
    const queryNorm = normalizeQueryForCache(query);
    const queryTokens = tokenizeForCache(query);
    const queryLocation = extractLocationHint(query);

    for (const cutoff of tierCutoffs) {
      const candidates: Array<{
        query: string;
        createdAt: number;
        status: string;
        propertyFindings: PropertyFindingCached[];
      }> = [];

      if (threadId) {
        const byThread = await ctx.db
          .query("knowledgeResearch")
          .withIndex("by_threadId_and_createdAt", (q) => q.eq("threadId", threadId))
          .order("desc")
          .take(30);
        for (const r of byThread) {
          if (r.userId !== userId || r.status !== "completed" || r.createdAt < cutoff) continue;
          candidates.push({
            query: r.query,
            createdAt: r.createdAt,
            status: r.status,
            propertyFindings: r.propertyFindings,
          });
        }
      }

      const byUser = await ctx.db
        .query("knowledgeResearch")
        .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
        .order("desc")
        .take(50);
      for (const r of byUser) {
        if (r.status !== "completed" || r.createdAt < cutoff) continue;
        if (threadId && r.threadId !== threadId) continue;
        if (candidates.some((c) => c.query === r.query && c.createdAt === r.createdAt)) continue;
        candidates.push({
          query: r.query,
          createdAt: r.createdAt,
          status: r.status,
          propertyFindings: r.propertyFindings,
        });
      }

      candidates.sort((a, b) => b.createdAt - a.createdAt);

      for (const record of candidates) {
        if (record.propertyFindings.length < minFindings) continue;
        const recordNorm = normalizeQueryForCache(record.query);
        if (queryNorm === recordNorm) {
          return { query: record.query, createdAt: record.createdAt, propertyFindings: record.propertyFindings as PropertyFindingCached[], status: record.status };
        }
        const recordTokens = tokenizeForCache(record.query);
        if (jaccardSimilarity(queryTokens, recordTokens) < 0.5) continue;
        const recordLocation = extractLocationHint(record.query);
        if (queryLocation && recordLocation && queryLocation !== recordLocation) continue;
        return { query: record.query, createdAt: record.createdAt, propertyFindings: record.propertyFindings as PropertyFindingCached[], status: record.status };
      }
    }
    return null;
  },
});

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
    const findings = record.propertyFindings.slice(0, limit).map((f, i) => ({
      index: i + 1,
      title: (f.title as string) ?? "",
      propertyUrl: f.propertyUrl as string | undefined,
      sourceUrl: f.sourceUrl as string | undefined,
      sourceTitle: f.sourceTitle as string | undefined,
      detailSourceUrl: f.detailSourceUrl as string | undefined,
      detailFetched: f.detailFetched as boolean | undefined,
      description: f.description as string | undefined,
      priceHint: f.priceHint as string | undefined,
      locationHint: f.locationHint as string | undefined,
      bathrooms: f.bathrooms as string | undefined,
      area: f.area as string | undefined,
      features: f.features as string[] | undefined,
      beds: f.beds as string | undefined,
    }));
    return { query: record.query, createdAt: record.createdAt, findings };
  },
});

export const logSearchEvent = mutation({
  args: {
    query: v.optional(v.string()),
    userId: v.optional(v.string()),
    channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    resultCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  returns: v.id("searchLogs"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("searchLogs", args);
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
    const norm = normalizeQueryForCache(query);
    const rows = await ctx.db
      .query("searchLogs")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    return rows.filter((r) => {
      if (!r.query || r.stage !== "completed") return false;
      if (r._creationTime < since) return false;
      return normalizeQueryForCache(r.query) === norm;
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
    const norm = normalizeQueryForCache(args.query);
    const rows = await ctx.db
      .query("searchLogs")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    return rows.filter((r) => {
      if (!r.query || r.stage !== "completed") return false;
      if (r._creationTime < since) return false;
      return normalizeQueryForCache(r.query) === norm;
    }).length;
  },
});

export const logKnowledgeResearch = mutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    query: v.string(),
    channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
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
