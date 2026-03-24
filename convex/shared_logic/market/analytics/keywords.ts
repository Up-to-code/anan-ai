import { KeywordCounts, MarketSnapshotResult, NormalizedResearch } from "./types";
import { createKeywordCounts, incrementCount, matchesScope, matchesTextQuery, tokenizeKeywordText } from "./utils";

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

export function buildKeywordInsights(args: {
  researchRows: NormalizedResearch[];
  city?: string;
  area?: string;
  queryText: string;
}): MarketSnapshotResult["keywordInsights"] {
  const excludedPhrases = buildExcludedPhrases(args.city, args.area);
  const counts: KeywordCounts = createKeywordCounts();
  for (const research of args.researchRows) {
    collectQueryKeywordCounts(counts, research, excludedPhrases);
    collectFindingKeywordCounts(counts, research, args);
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

  return {
    topKeywords,
    topTopics,
    mostResearchedLabel: topKeywords[0]?.label ?? topTopics[0]?.label ?? null,
  };
}
