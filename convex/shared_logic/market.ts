import { query } from "../_generated/server";
import { v } from "convex/values";
import { buildMarketSnapshot } from "./market/analytics";

const marketFindingValidator = v.object({
  title: v.string(),
  locationHint: v.optional(v.string()),
  priceHint: v.optional(v.string()),
  area: v.optional(v.string()),
  features: v.optional(v.array(v.string())),
  sourceTitle: v.optional(v.string()),
  sourceUrl: v.optional(v.string()),
});

const marketKeywordValidator = v.object({
  label: v.string(),
  count: v.number(),
  source: v.union(v.literal("query"), v.literal("feature"), v.literal("derived_topic")),
});

const marketKeywordHelperValidator = v.object({
  label: v.string(),
  count: v.number(),
  source: v.union(v.literal("research_query"), v.literal("research_term"), v.literal("search_log")),
});

const marketOpportunityValidator = v.object({
  city: v.string(),
  area: v.string(),
  priority: v.union(v.literal("high"), v.literal("medium"), v.literal("watch")),
  demandSignals: v.number(),
  researchRuns: v.number(),
  inventoryCount: v.number(),
  dominantProductType: v.union(v.string(), v.null()),
  strongestSellingPoint: v.union(v.string(), v.null()),
  reason: v.string(),
});

const marketTrendPointValidator = v.object({
  label: v.string(),
  demandSignals: v.number(),
  researchRuns: v.number(),
  inventoryCount: v.optional(v.number()),
});

const marketSnapshotValidator = v.object({
  filters: v.object({
    city: v.string(),
    area: v.string(),
    query: v.string(),
    dateFrom: v.string(),
    dateTo: v.string(),
    windowDays: v.optional(v.union(v.literal(30), v.literal(90), v.literal(180))),
  }),
  availableCities: v.array(v.string()),
  availableAreas: v.array(v.string()),
  headline: v.object({
    selectedCityLabel: v.string(),
    selectedAreaLabel: v.string(),
    demandSignals: v.number(),
    researchRuns: v.number(),
    inventoryCount: v.number(),
    averagePriceLabel: v.union(v.string(), v.null()),
  }),
  topCities: v.array(
    v.object({
      city: v.string(),
      demandSignals: v.number(),
      researchRuns: v.number(),
      inventoryCount: v.number(),
      averagePriceLabel: v.union(v.string(), v.null()),
    }),
  ),
  topAreas: v.array(
    v.object({
      city: v.string(),
      area: v.string(),
      demandSignals: v.number(),
      inventoryCount: v.number(),
      averagePriceLabel: v.union(v.string(), v.null()),
      topProductType: v.union(v.string(), v.null()),
      topSignalLabel: v.union(v.string(), v.null()),
    }),
  ),
  sellingPoints: v.array(
    v.object({
      label: v.string(),
      count: v.number(),
      source: v.union(v.literal("features"), v.literal("derived_configuration")),
    }),
  ),
  keywordInsights: v.object({
    relatedSearches: v.array(marketKeywordHelperValidator),
    topKeywords: v.array(marketKeywordValidator),
    topTopics: v.array(marketKeywordValidator),
    mostResearchedLabel: v.union(v.string(), v.null()),
  }),
  opportunities: v.array(marketOpportunityValidator),
  chartSeries: v.object({
    cityDemand: v.array(marketTrendPointValidator),
    areaDemand: v.array(marketTrendPointValidator),
    keywordCounts: v.array(v.object({ label: v.string(), count: v.number() })),
  }),
  latestUpdate: v.union(
    v.null(),
    v.object({
      query: v.string(),
      createdAt: v.number(),
      status: v.union(v.literal("completed"), v.literal("partial"), v.literal("failed")),
      sourceCount: v.number(),
      topFindings: v.array(marketFindingValidator),
    }),
  ),
});

/**
 * WHY:   The workspace market page needs one public, persisted-data-only snapshot instead of route-local mock arrays.
 * WHAT:  Aggregates Saudi market demand, supply, selling points, and latest research for an optional city/area scope.
 * HOW:   Reads the existing `properties`, `knowledgeResearch`, and `searchLogs` tables, then delegates calculations to the market analytics module.
 */
export const getMarketSnapshot = query({
  args: {
    city: v.optional(v.string()),
    area: v.optional(v.string()),
    query: v.optional(v.string()),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
    windowDays: v.optional(v.union(v.literal(30), v.literal(90), v.literal(180))),
  },
  returns: marketSnapshotValidator,
  handler: async (ctx, args) => {
    const [properties, researchRows, searchLogs, conversationAnalyses] = await Promise.all([
      ctx.db.query("properties").order("desc").take(500),
      ctx.db.query("knowledgeResearch").order("desc").take(500),
      ctx.db.query("searchLogs").order("desc").take(500),
      ctx.db
        .query("aiConversationAnalyses")
        .withIndex("by_status_lastMessageAt", (q) => q.eq("status", "done"))
        .order("desc")
        .take(500),
    ]);

    return buildMarketSnapshot({
      properties,
      researchRows,
      searchLogs,
      conversationAnalyses,
      filters: args,
    });
  },
});
