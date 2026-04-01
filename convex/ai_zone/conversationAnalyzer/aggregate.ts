import type {
  ConversationDailyAreaMetric,
  ConversationDailyMetric,
  ConversationDailySummary,
  ConversationDemandOutput,
} from "./types";

function incrementMetric(
  map: Map<string, number>,
  values: string[],
) {
  for (const value of new Set(values.filter(Boolean))) {
    map.set(value, (map.get(value) ?? 0) + 1);
  }
}

function toMetrics(map: Map<string, number>): ConversationDailyMetric[] {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ar"))
    .slice(0, 12);
}

function toAreaMetrics(
  map: Map<string, ConversationDailyAreaMetric>,
): ConversationDailyAreaMetric[] {
  return Array.from(map.values())
    .sort(
      (a, b) =>
        b.count - a.count ||
        `${a.city ?? ""}${a.area}`.localeCompare(`${b.city ?? ""}${b.area}`, "ar"),
    )
    .slice(0, 15);
}

function buildDailySummaryText(summary: ConversationDailySummary) {
  const parts: string[] = [];
  if (summary.topCities[0]) parts.push(`المدن الأبرز ${summary.topCities[0].label}`);
  if (summary.topAreas[0]) {
    parts.push(
      `والأحياء الأكثر طلباً ${summary.topAreas[0].city ? `${summary.topAreas[0].city} / ` : ""}${summary.topAreas[0].area}`,
    );
  }
  if (summary.propertyTypes[0]) parts.push(`مع تركيز على ${summary.propertyTypes[0].label}`);
  if (summary.budgetBands[0]) parts.push(`وبميزانيات ${summary.budgetBands[0].label}`);
  if (summary.paymentIntents[0]) parts.push(`ونمط دفع ${summary.paymentIntents[0].label}`);
  if (summary.mustHaveFeatures[0]) parts.push(`وأبرز المتطلبات ${summary.mustHaveFeatures[0].label}`);
  return parts.join("، ") || "لا توجد إشارات كافية لتوليد ملخص يومي";
}

/**
 * WHY:   The noon analyzer should publish one stable day-level record instead of forcing dashboards to re-aggregate every chat client-side.
 * WHAT:  Aggregates completed per-chat analyzer outputs into top cities, areas, requirements, and keyword summaries.
 * HOW:   Counts each normalized signal once per chat, sorts by frequency, and derives a concise summary sentence for the day.
 */
export function buildConversationDailySummary(
  outputs: ConversationDemandOutput[],
): ConversationDailySummary {
  const cityCounts = new Map<string, number>();
  const areaCounts = new Map<string, ConversationDailyAreaMetric>();
  const propertyTypeCounts = new Map<string, number>();
  const budgetCounts = new Map<string, number>();
  const paymentCounts = new Map<string, number>();
  const configurationCounts = new Map<string, number>();
  const bedroomCounts = new Map<string, number>();
  const bathroomCounts = new Map<string, number>();
  const timelineCounts = new Map<string, number>();
  const featureCounts = new Map<string, number>();
  const constraintCounts = new Map<string, number>();
  const intentCounts = new Map<string, number>();
  const keywordCounts = new Map<string, number>();
  const topicCounts = new Map<string, number>();

  for (const output of outputs) {
    incrementMetric(cityCounts, output.hotCities);
    for (const area of output.hotAreas) {
      const key = `${area.city ?? ""}::${area.area}`;
      const current = areaCounts.get(key);
      areaCounts.set(key, {
        city: area.city,
        area: area.area,
        count: (current?.count ?? 0) + 1,
      });
    }
    incrementMetric(propertyTypeCounts, output.propertyTypes);
    incrementMetric(budgetCounts, output.budgetBands);
    incrementMetric(paymentCounts, output.paymentIntents);
    incrementMetric(configurationCounts, output.configurations);
    incrementMetric(bedroomCounts, output.bedroomCounts);
    incrementMetric(bathroomCounts, output.bathroomCounts);
    incrementMetric(timelineCounts, output.timelineSignals);
    incrementMetric(featureCounts, output.mustHaveFeatures);
    incrementMetric(constraintCounts, output.strongConstraints);
    incrementMetric(intentCounts, output.intent === "unknown" ? [] : [output.intent]);
    incrementMetric(keywordCounts, output.repeatedKeywords);
    incrementMetric(topicCounts, output.repeatedTopics);
  }

  const summary: ConversationDailySummary = {
    summaryText: "",
    topCities: toMetrics(cityCounts),
    topAreas: toAreaMetrics(areaCounts),
    propertyTypes: toMetrics(propertyTypeCounts),
    budgetBands: toMetrics(budgetCounts),
    paymentIntents: toMetrics(paymentCounts),
    configurations: toMetrics(configurationCounts),
    bedroomCounts: toMetrics(bedroomCounts),
    bathroomCounts: toMetrics(bathroomCounts),
    timelineSignals: toMetrics(timelineCounts),
    mustHaveFeatures: toMetrics(featureCounts),
    strongConstraints: toMetrics(constraintCounts),
    intents: toMetrics(intentCounts),
    repeatedKeywords: toMetrics(keywordCounts),
    repeatedTopics: toMetrics(topicCounts),
  };
  summary.summaryText = buildDailySummaryText(summary);
  return summary;
}
