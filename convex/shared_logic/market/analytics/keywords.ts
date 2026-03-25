import {
  KeywordCounts,
  MarketSnapshotResult,
  NormalizedResearch,
  NormalizedSearchSignal,
} from "./types";
import {
  createKeywordCounts,
  incrementCount,
  matchesScope,
  matchesTextQuery,
  normalizeSearchText,
  tokenizeKeywordText,
} from "./utils";

function buildExcludedPhrases(city?: string, area?: string) {
  const excludedPhrases = new Set<string>();
  for (const token of tokenizeKeywordText(city ?? "", new Set())) excludedPhrases.add(token);
  for (const token of tokenizeKeywordText(area ?? "", new Set())) excludedPhrases.add(token);
  return excludedPhrases;
}

function collectQueryKeywordCounts(
  counts: KeywordCounts,
  research: NormalizedResearch,
  excludedPhrases: Set<string>,
) {
  for (const token of tokenizeKeywordText(research.query, excludedPhrases)) {
    incrementCount(counts.query, token);
  }
  for (const term of research.searchTerms) {
    for (const token of tokenizeKeywordText(term, excludedPhrases)) {
      incrementCount(counts.query, token);
    }
  }
}

function collectFindingKeywordCounts(
  counts: KeywordCounts,
  research: NormalizedResearch,
  args: { city?: string; area?: string },
) {
  for (const finding of research.findings) {
    if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: finding.city, area: finding.area })) continue;
    for (const feature of finding.features) {
      incrementCount(counts.feature, feature);
    }
    incrementCount(counts.derived, finding.productType);
    incrementCount(counts.derived, finding.configuration);
  }
}

function toSortedItems(
  entries: Array<{ label: string; count: number; source: "query" | "feature" | "derived_topic" }>,
  queryText: string,
) {
  return entries
    .filter((item) => matchesTextQuery(queryText, item.label))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ar"))
    .slice(0, 12);
}

function addHelperQuery(
  counts: Map<string, { count: number; source: "research_query" | "research_term" | "search_log" }>,
  value: string | undefined,
  source: "research_query" | "research_term" | "search_log",
  excludedPhrases: Set<string>,
) {
  const normalized = normalizeSearchText(value);
  if (!normalized || excludedPhrases.has(normalized)) return;

  const existing = counts.get(normalized);
  counts.set(normalized, {
    count: (existing?.count ?? 0) + 1,
    source: existing?.source ?? source,
  });
}

/**
 * WHY:   The market research view needs both atomic keyword trends and reusable search phrases.
 * WHAT:  Derives saved-data keyword insights plus related-search helper phrases for the selected scope.
 * HOW:   Mixes research queries, research search terms, findings, and saved search logs, then filters them through the same scope/query rules.
 */
export function buildKeywordInsights(args: {
  researchRows: NormalizedResearch[];
  searchSignals: NormalizedSearchSignal[];
  city?: string;
  area?: string;
  queryText: string;
}): MarketSnapshotResult["keywordInsights"] {
  const excludedPhrases = buildExcludedPhrases(args.city, args.area);
  const counts: KeywordCounts = createKeywordCounts();
  const helperQueries = new Map<string, { count: number; source: "research_query" | "research_term" | "search_log" }>();

  for (const research of args.researchRows) {
    collectQueryKeywordCounts(counts, research, excludedPhrases);
    collectFindingKeywordCounts(counts, research, args);
    addHelperQuery(helperQueries, research.query, "research_query", excludedPhrases);
    for (const term of research.searchTerms) {
      addHelperQuery(helperQueries, term, "research_term", excludedPhrases);
    }
  }

  for (const signal of args.searchSignals) {
    if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: signal.city, area: signal.area })) continue;
    addHelperQuery(helperQueries, signal.query, "search_log", excludedPhrases);
  }

  const topKeywords = toSortedItems(
    [
      ...Array.from(counts.query.entries()).map(([label, count]) => ({ label, count, source: "query" as const })),
      ...Array.from(counts.feature.entries()).map(([label, count]) => ({ label, count, source: "feature" as const })),
    ],
    args.queryText,
  );

  const topTopics = toSortedItems(
    Array.from(counts.derived.entries()).map(([label, count]) => ({ label, count, source: "derived_topic" as const })),
    args.queryText,
  );

  const relatedSearches = Array.from(helperQueries.entries())
    .map(([label, value]) => ({ label, count: value.count, source: value.source }))
    .filter((item) => matchesTextQuery(args.queryText, item.label))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ar"))
    .slice(0, 12);

  return {
    relatedSearches,
    topKeywords,
    topTopics,
    mostResearchedLabel: relatedSearches[0]?.label ?? topKeywords[0]?.label ?? topTopics[0]?.label ?? null,
  };
}
