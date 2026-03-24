import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ActionCtx } from "../../../../../_generated/server";
import { api, internal } from "../../../../../_generated/api";
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
type SmartPropertySearchArgs = {
  query: string;
  limit?: number;
  scope?: "saudi" | "uae" | "global";
  offset?: number;
  maxSources?: number;
  maxCardsPerSource?: number;
};
type SmartPropertySearchResult = { status: "completed" | "failed"; findings: PropertyFinding[]; sourcesUsed: string[]; cacheKey?: string };
type SearchOptions = { limit: number; scope: "saudi" | "uae" | "global"; offset: number; maxSources: number; maxCardsPerSource: number };
type SearchSource = { rank: number; title: string; url: string; snippet?: string };
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
function resolveSearchOptions(args: SmartPropertySearchArgs): SearchOptions {
  return {
    limit: args.limit ?? DEFAULT_LIMIT,
    scope: args.scope ?? DEFAULT_SCOPE,
    offset: args.offset ?? 0,
    maxSources: args.maxSources ?? DEFAULT_MAX_SOURCES,
    maxCardsPerSource: args.maxCardsPerSource ?? DEFAULT_MAX_CARDS,
  };
}
async function tryDbSearch(
  ctx: ActionCtx,
  runtime: AgentRuntimeContext,
  args: SmartPropertySearchArgs,
  options: SearchOptions,
): Promise<SmartPropertySearchResult | null> {
  const dbResults = await ctx.runQuery(api.shared_logic.properties.search.search, {
    query: args.query,
    limit: options.limit,
    onlyAvailable: true,
  });
  if (dbResults?.length < options.limit) return null;
  const findings = mapDbResultsToFindings(dbResults);
  await ctx.runMutation(api.shared_logic.properties.history.logSearchEvent, {
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
async function tryGlobalCache(
  ctx: ActionCtx,
  args: SmartPropertySearchArgs,
  options: SearchOptions,
): Promise<SmartPropertySearchResult | null> {
  const globalCache = await ctx.runQuery(api.shared_logic.properties.cache.getGlobalSearchCache, {
    query: args.query,
    offset: options.offset,
    scope: options.scope,
    minFindings: options.limit,
  });
  if (!globalCache) return null;
  await ctx.runMutation(api.shared_logic.properties.cache.trackGlobalSearchCacheHit, {
    cacheKey: globalCache.cacheKey,
  });
  return {
    status: "completed",
    findings: globalCache.propertyFindings,
    sourcesUsed: ["global_cache"],
    cacheKey: globalCache.cacheKey,
  };
}
async function tryUserCache(
  ctx: ActionCtx,
  runtime: AgentRuntimeContext,
  args: SmartPropertySearchArgs,
  options: SearchOptions,
): Promise<SmartPropertySearchResult | null> {
  const userCache = await ctx.runQuery(api.shared_logic.properties.cache.getCachedSearchResults, {
    userId: runtime.userId,
    threadId: runtime.threadId,
    query: args.query,
    limit: options.limit,
  });
  if (!userCache) return null;
  return {
    status: "completed",
    findings: userCache.propertyFindings,
    sourcesUsed: ["user_cache"],
  };
}
async function logSerperFailure(
  ctx: ActionCtx,
  runtime: AgentRuntimeContext,
  args: SmartPropertySearchArgs,
  errorMessage: string,
): Promise<SmartPropertySearchResult> {
  await ctx.runMutation(api.shared_logic.properties.history.logSearchEvent, {
    query: args.query,
    userId: runtime.userId,
    channel: runtime.channel,
    stage: "serper",
    status: "failed",
    source: "serper",
    errorMessage,
  });
  return { status: "failed", findings: [], sourcesUsed: ["serper"] };
}
function buildSearchSources(results: Array<{ url?: string; title?: string; snippet?: string }>, maxSources: number) {
  return results
    .filter((result): result is { url: string; title?: string; snippet?: string } => typeof result?.url === "string" && result.url.length > 0)
    .slice(0, maxSources);
}
async function collectPortalFindings(
  ctx: ActionCtx,
  sources: Array<{ url: string; title?: string; snippet?: string }>,
  maxCardsPerSource: number,
) {
  const findings: PropertyFinding[] = [];
  const sourceRuns: SearchSource[] = [];
  const taskList: string[] = [];
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const sourceRank = i + 1;
    sourceRuns.push({ rank: sourceRank, title: source.title ?? "", url: source.url, snippet: source.snippet });
    const portal = getPortalConfigForUrl(source.url);
    if (!portal) continue;
    taskList.push(`extract:${portal.name}`);
    const state: StagehandState = { disabled: false };
    const cards = await extractFromPortal(ctx, portal, source.url, maxCardsPerSource, state);
    if (state.disabled || !cards.length) continue;
    findings.push(...normalizeCardsToFindings(cards, sourceRank, source.url, source.title));
  }
  return { findings, sourceRuns, taskList };
}
async function persistKnowledgeResearch(
  ctx: ActionCtx,
  runtime: AgentRuntimeContext,
  args: SmartPropertySearchArgs,
  options: SearchOptions,
  findings: PropertyFinding[],
  taskList: string[],
  sourceRuns: SearchSource[],
  createdAt: number,
) {
  await ctx.runMutation(api.shared_logic.properties.history.logKnowledgeResearch, {
    userId: runtime.userId,
    threadId: runtime.threadId,
    query: args.query,
    channel: runtime.channel,
    status: findings.length > 0 ? "completed" : "failed",
    requestedTopSources: options.maxSources,
    requestedTopCardsPerSource: options.maxCardsPerSource,
    createdAt,
    taskList,
    searchTerms: [args.query],
    sourceRuns,
    propertyFindings: findings,
  });
}
async function finalizeWebFindings(
  ctx: ActionCtx,
  args: SmartPropertySearchArgs,
  options: SearchOptions,
  findings: PropertyFinding[],
  createdAt: number,
): Promise<SmartPropertySearchResult> {
  if (findings.length === 0) {
    return { status: "failed", findings: [], sourcesUsed: ["serper", "stagehand"] };
  }
  const cacheKey = await ctx.runMutation(api.shared_logic.properties.cache.upsertGlobalSearchCache, {
    query: args.query,
    offset: options.offset,
    scope: options.scope,
    status: "completed",
    propertyFindings: findings,
    createdAt,
  });
  return { status: "completed", findings, sourcesUsed: ["serper", "stagehand"], cacheKey };
}
async function executeSmartPropertySearch(
  ctx: ActionCtx,
  runtime: AgentRuntimeContext,
  args: SmartPropertySearchArgs,
) {
  const options = resolveSearchOptions(args);
  const dbResult = await tryDbSearch(ctx, runtime, args, options);
  if (dbResult) return dbResult;
  const globalCacheResult = await tryGlobalCache(ctx, args, options);
  if (globalCacheResult) return globalCacheResult;
  const userCacheResult = await tryUserCache(ctx, runtime, args, options);
  if (userCacheResult) return userCacheResult;
  const serper = await ctx.runAction(
    internal.ai_zone.agents.team_search.anan_search.tools.serperSearch.runSerperWebSearch,
    { query: args.query, num: options.maxSources, deep: false },
  );
  if (!serper?.ok) return logSerperFailure(ctx, runtime, args, serper?.error ?? "serper_failed");
  const sources = buildSearchSources(serper.results ?? [], options.maxSources);
  const { findings, sourceRuns, taskList } = await collectPortalFindings(ctx, sources, options.maxCardsPerSource);
  const createdAt = Date.now();
  await persistKnowledgeResearch(ctx, runtime, args, options, findings, taskList, sourceRuns, createdAt);
  return finalizeWebFindings(ctx, args, options, findings, createdAt);
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
    inputSchema: zodSchema(z.object({ query: z.string(), limit: z.number().min(1).max(10).optional(), scope: z.enum(["saudi", "uae", "global"]).optional(), offset: z.number().min(0).optional(), maxSources: z.number().min(1).max(6).optional(), maxCardsPerSource: z.number().min(1).max(10).optional() })),
    execute: async (args) => executeSmartPropertySearch(ctx, runtime, args),
  });
}
