/**
 * smartPropertySearch.ts — End-to-end property search pipeline tool
 *
 * WHY:   Users need fast, accurate property results with caching + web fallback.
 * WHAT:  DB search → global cache → per-user cache → Serper → Stagehand.
 * HOW:   Uses shared property search/cache/history modules, Serper action, and Stagehand extraction.
 */

import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../../_generated/server";
import { apiRefs, internalRefs } from "../../../../../shared_logic/lib/generatedApiRefs";
import type { AgentRuntimeContext } from "../../../types";
import { extractFromPortal, getPortalConfigForUrl } from "../../anan_web/tools/genericScraper";
import type { StagehandState } from "../../anan_web/tools/stagehand";

const DEFAULT_LIMIT = 3;
const DEFAULT_SCOPE = "saudi" as const;
const DEFAULT_MAX_SOURCES = 3;
const DEFAULT_MAX_CARDS = 5;

type PropertyFinding = {
  sourceRank: number;
  sourceUrl: string;
  sourceTitle?: string;
  cardRank: number;
  propertyUrl?: string;
  detailSourceUrl?: string;
  detailFetched?: boolean;
  title: string;
  description?: string;
  priceHint?: string;
  locationHint?: string;
  imageUrls: string[];
  offerDetails?: string;
  confidence?: number;
  bathrooms?: string;
  area?: string;
  features?: string[];
  beds?: string;
};

function mapDbResultsToFindings(results: Array<Record<string, any>>): PropertyFinding[] {
  return results.map((p, i) => ({
    sourceRank: 0,
    sourceUrl: "anan_db",
    sourceTitle: "Anan Database",
    cardRank: i + 1,
    propertyUrl: p._id ? `anan://property/${p._id}` : undefined,
    title: String(p.title ?? "") || "عقار",
    description: p.description ?? undefined,
    priceHint: p.price != null ? String(p.price) : undefined,
    locationHint: p.location ?? p.address ?? undefined,
    imageUrls: [],
    bathrooms: p.baths != null ? String(p.baths) : undefined,
    beds: p.beds != null ? String(p.beds) : undefined,
    area: p.area ?? (p.sqft != null ? `${p.sqft} sqft` : undefined),
  }));
}

function normalizeCardsToFindings(
  cards: Array<Record<string, any>> | unknown[],
  sourceRank: number,
  sourceUrl: string,
  sourceTitle?: string,
): PropertyFinding[] {
  return (cards as Array<Record<string, any>>).map((c, i) => ({
    sourceRank,
    sourceUrl,
    sourceTitle,
    cardRank: i + 1,
    propertyUrl: c.url ?? c.propertyUrl ?? undefined,
    title: String(c.title ?? "") || "عقار",
    description: c.description ?? undefined,
    priceHint: c.price ?? c.priceHint ?? undefined,
    locationHint: c.location ?? c.locationHint ?? undefined,
    imageUrls: (c.imageUrls ?? c.images ?? []).filter(Boolean),
    bathrooms: c.baths ?? c.bathrooms ?? undefined,
    beds: c.beds ?? undefined,
    area: c.area ?? undefined,
    features: c.features ?? undefined,
  }));
}

export function smartPropertySearch(ctx: ActionCtx, runtime: AgentRuntimeContext) {
  return tool({
    description:
      "Search properties with DB + cache + web fallback. Returns normalized property findings.",
    inputSchema: zodSchema(z.object({
      query: z.string(),
      limit: z.number().min(1).max(10).optional(),
      scope: z.enum(["saudi", "uae", "global"]).optional(),
      offset: z.number().min(0).optional(),
      maxSources: z.number().min(1).max(6).optional(),
      maxCardsPerSource: z.number().min(1).max(10).optional(),
    })),
    execute: async (args) => {
      const limit = args.limit ?? DEFAULT_LIMIT;
      const scope = args.scope ?? DEFAULT_SCOPE;
      const offset = args.offset ?? 0;
      const maxSources = args.maxSources ?? DEFAULT_MAX_SOURCES;
      const maxCardsPerSource = args.maxCardsPerSource ?? DEFAULT_MAX_CARDS;

      // 1) DB search
      const dbResults = await ctx.runQuery(
        apiRefs["shared_logic/properties/search"].search,
        { query: args.query, limit, onlyAvailable: true },
      );
      if (dbResults?.length >= limit) {
        const findings = mapDbResultsToFindings(dbResults);
        await ctx.runMutation(apiRefs["shared_logic/properties/history"].logSearchEvent, {
          query: args.query,
          userId: runtime.userId,
          channel: runtime.channel,
          stage: "db",
          status: "completed",
          source: "db",
          resultCount: findings.length,
        });
        return { status: "completed", findings, sourcesUsed: ["db"] };
      }

      // 2) Global cache
      const globalCache = await ctx.runQuery(
        apiRefs["shared_logic/properties/cache"].getGlobalSearchCache,
        { query: args.query, offset, scope, minFindings: limit },
      );
      if (globalCache) {
        await ctx.runMutation(
          apiRefs["shared_logic/properties/cache"].trackGlobalSearchCacheHit,
          { cacheKey: globalCache.cacheKey },
        );
        return {
          status: "completed",
          findings: globalCache.propertyFindings,
          sourcesUsed: ["global_cache"],
          cacheKey: globalCache.cacheKey,
        };
      }

      // 3) Per-user cache
      const userCache = await ctx.runQuery(
        apiRefs["shared_logic/properties/cache"].getCachedSearchResults,
        {
          userId: runtime.userId,
          threadId: runtime.threadId,
          query: args.query,
          limit,
        },
      );
      if (userCache) {
        return {
          status: "completed",
          findings: userCache.propertyFindings,
          sourcesUsed: ["user_cache"],
        };
      }

      // 4) Serper web search
      const serper = await ctx.runAction(
        internalRefs["ai_zone/agents/team_search/anan_search/tools/serperSearch"].runSerperWebSearch,
        { query: args.query, num: maxSources, deep: false },
      );
      if (!serper?.ok) {
        await ctx.runMutation(apiRefs["shared_logic/properties/history"].logSearchEvent, {
          query: args.query,
          userId: runtime.userId,
          channel: runtime.channel,
          stage: "serper",
          status: "failed",
          source: "serper",
          errorMessage: serper?.error ?? "serper_failed",
        });
        return { status: "failed", findings: [], sourcesUsed: ["serper"] };
      }

      const sources = (serper.results ?? [])
        .filter((r: any) => r?.url)
        .slice(0, maxSources);

      const findings: PropertyFinding[] = [];
      const sourceRuns: Array<{ rank: number; title: string; url: string; snippet?: string }> = [];
      const taskList: string[] = [];
      const searchTerms: string[] = [args.query];

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const sourceRank = i + 1;
        sourceRuns.push({
          rank: sourceRank,
          title: source.title ?? "",
          url: source.url,
          snippet: source.snippet,
        });

        const portal = getPortalConfigForUrl(source.url);
        if (!portal) continue;

        taskList.push(`extract:${portal.name}`);

        const state: StagehandState = { disabled: false };
        const cards = await extractFromPortal(
          ctx,
          portal,
          source.url,
          maxCardsPerSource,
          state,
        );
        if (state.disabled || !cards.length) continue;

        const normalized = normalizeCardsToFindings(cards, sourceRank, source.url, source.title);
        findings.push(...normalized);
      }

      const status = findings.length > 0 ? "completed" : "failed";
      const createdAt = Date.now();

      await ctx.runMutation(apiRefs["shared_logic/properties/history"].logKnowledgeResearch, {
        userId: runtime.userId,
        threadId: runtime.threadId,
        query: args.query,
        channel: runtime.channel,
        status,
        requestedTopSources: maxSources,
        requestedTopCardsPerSource: maxCardsPerSource,
        createdAt,
        taskList,
        searchTerms,
        sourceRuns,
        propertyFindings: findings,
      });

      if (findings.length > 0) {
        const cacheKey = await ctx.runMutation(
          apiRefs["shared_logic/properties/cache"].upsertGlobalSearchCache,
          {
            query: args.query,
            offset,
            scope,
            status: "completed",
            propertyFindings: findings,
            createdAt,
          },
        );
        return { status: "completed", findings, sourcesUsed: ["serper", "stagehand"], cacheKey };
      }

      return { status: "failed", findings: [], sourcesUsed: ["serper", "stagehand"] };
    },
  });
}
