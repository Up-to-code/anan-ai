import { AreaAggregate, MarketSnapshotResult } from "./types";
import { matchesTextQuery, pickTopEntry } from "./utils";

type OpportunityPriority = "high" | "medium" | "watch";

function computeOpportunityScore(entry: AreaAggregate, strongestSellingPoint: string | null, dominantProductType: string | null) {
  const supplyGap = Math.max(0, entry.demandSignals - entry.inventoryCount);
  return (
    entry.demandSignals * 3 +
    entry.researchRuns * 2 +
    Math.min(6, supplyGap * 2) +
    (strongestSellingPoint ? 3 : 0) +
    (dominantProductType ? 1 : 0)
  );
}

function resolveOpportunityPriority(entry: AreaAggregate, score: number): OpportunityPriority | null {
  if (entry.demandSignals >= 4 && entry.researchRuns >= 1 && score >= 12) return "high";
  if (entry.demandSignals >= 2 && score >= 7) return "medium";
  if (score >= 4) return "watch";
  return null;
}

function buildOpportunityReason(entry: AreaAggregate, strongestSellingPoint: string | null) {
  return strongestSellingPoint
    ? `الطلب أعلى من المعروض في ${entry.area} داخل ${entry.city} مع تكرار واضح لـ ${strongestSellingPoint}`
    : "الحي يظهر طلباً بحثياً متكرراً مقارنة بحجم المخزون الحالي";
}

function toRankedOpportunity(entry: AreaAggregate) {
  const dominantProductType = pickTopEntry(entry.productTypeCounts);
  const strongestSellingPoint = pickTopEntry(entry.signalCounts);
  const score = computeOpportunityScore(entry, strongestSellingPoint, dominantProductType);
  const priority = resolveOpportunityPriority(entry, score);
  if (!priority) return null;
  return {
    score,
    city: entry.city,
    area: entry.area,
    priority,
    demandSignals: entry.demandSignals,
    researchRuns: entry.researchRuns,
    inventoryCount: entry.inventoryCount,
    dominantProductType,
    strongestSellingPoint,
    reason: buildOpportunityReason(entry, strongestSellingPoint),
  };
}

export function buildMarketOpportunities(args: {
  areaAggregates: Map<string, AreaAggregate>;
  city?: string;
  queryText: string;
}): MarketSnapshotResult["opportunities"] {
  const ranked = Array.from(args.areaAggregates.values())
    .filter((entry) => !args.city || entry.city === args.city)
    .map(toRankedOpportunity)
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item) =>
      matchesTextQuery(args.queryText, item.city, item.area, item.dominantProductType, item.strongestSellingPoint, item.reason)
    )
    .sort((a, b) =>
      b.score - a.score ||
      b.demandSignals - a.demandSignals ||
      b.researchRuns - a.researchRuns ||
      a.area.localeCompare(b.area, "ar")
    )
    .slice(0, 12)
    .map(({ score: _score, ...item }) => item);

  return ranked;
}
