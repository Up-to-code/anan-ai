import { Infer, v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import {
  GLOBAL_SEARCH_CACHE_TTL_MS,
  SEARCH_CACHE_TTL_COLD_MS,
  SEARCH_CACHE_TTL_HOT_MS,
  SEARCH_CACHE_TTL_WARM_MS,
} from "../lib/constants";
import {
  buildGlobalSearchCacheKey,
  extractLocationHint,
  jaccardSimilarity,
  normalizeQueryForCache,
  propertyFindingValidator,
  searchScopeValidator,
  tokenizeForCache,
} from "./search";

type PropertyFindingCached = Infer<typeof propertyFindingValidator>;
type CacheCandidate = {
  query: string;
  createdAt: number;
  status: string;
  propertyFindings: PropertyFindingCached[];
};

type CacheMatchContext = {
  minFindings: number;
  queryNorm: string;
  queryTokens: string[];
  queryLocation: string | null;
};

function toCandidate(record: {
  query: string;
  createdAt: number;
  status: string;
  propertyFindings: PropertyFindingCached[];
}): CacheCandidate {
  return {
    query: record.query,
    createdAt: record.createdAt,
    status: record.status,
    propertyFindings: record.propertyFindings,
  };
}

function buildTierCutoffs(now: number, maxAgeMs: number | undefined) {
  if (maxAgeMs) return [now - maxAgeMs];
  return [now - SEARCH_CACHE_TTL_HOT_MS, now - SEARCH_CACHE_TTL_WARM_MS, now - SEARCH_CACHE_TTL_COLD_MS];
}

async function collectThreadCandidates(
  ctx: any,
  userId: string,
  threadId: string,
  cutoff: number,
): Promise<CacheCandidate[]> {
  const byThread = await ctx.db
    .query("knowledgeResearch")
    .withIndex("by_threadId_and_createdAt", (q: any) => q.eq("threadId", threadId))
    .order("desc")
    .take(30);
  return byThread.flatMap((record: any) => {
    if (record.userId !== userId || record.status !== "completed" || record.createdAt < cutoff) return [];
    return [toCandidate(record)];
  });
}

function candidateKey(candidate: CacheCandidate) {
  return `${candidate.query}:${candidate.createdAt}`;
}

function appendUserCandidates(
  candidates: CacheCandidate[],
  byUser: Array<{
    status: string;
    createdAt: number;
    threadId?: string;
    query: string;
    propertyFindings: PropertyFindingCached[];
  }>,
  cutoff: number,
  threadId: string | undefined,
) {
  const seen = new Set(candidates.map(candidateKey));
  for (const record of byUser) {
    if (record.status !== "completed" || record.createdAt < cutoff) continue;
    if (threadId && record.threadId !== threadId) continue;
    const candidate = toCandidate(record);
    const key = candidateKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(candidate);
  }
}

function toCacheResponse(record: CacheCandidate) {
  return {
    query: record.query,
    createdAt: record.createdAt,
    propertyFindings: record.propertyFindings,
    status: record.status,
  };
}

function findMatchingCandidate(candidates: CacheCandidate[], context: CacheMatchContext) {
  for (const record of candidates) {
    if (record.propertyFindings.length < context.minFindings) continue;
    const recordNorm = normalizeQueryForCache(record.query);
    if (context.queryNorm === recordNorm) return toCacheResponse(record);
    const recordTokens = tokenizeForCache(record.query);
    if (jaccardSimilarity(context.queryTokens, recordTokens) < 0.5) continue;
    const recordLocation = extractLocationHint(record.query);
    if (context.queryLocation && recordLocation && context.queryLocation !== recordLocation) continue;
    return toCacheResponse(record);
  }
  return null;
}

/**
 * WHY:   Search orchestration needs a dedicated cache layer separate from the live property query.
 * WHAT:  Reads and writes cross-user and per-user search caches.
 * HOW:   Uses normalized cache keys and similarity checks against `globalSearchCache` and `knowledgeResearch`.
 */
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
    const tierCutoffs = buildTierCutoffs(now, maxAgeMs);
    const context: CacheMatchContext = {
      minFindings: Math.min(limit, 3),
      queryNorm: normalizeQueryForCache(query),
      queryTokens: tokenizeForCache(query),
      queryLocation: extractLocationHint(query) ?? null,
    };
    const byUser = await ctx.db
      .query("knowledgeResearch")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    for (const cutoff of tierCutoffs) {
      const candidates: CacheCandidate[] = [];
      if (threadId) {
        candidates.push(...await collectThreadCandidates(ctx, userId, threadId, cutoff));
      }
      appendUserCandidates(candidates, byUser, cutoff, threadId);
      candidates.sort((left, right) => right.createdAt - left.createdAt);
      const match = findMatchingCandidate(candidates, context);
      if (match) return match;
    }

    return null;
  },
});
