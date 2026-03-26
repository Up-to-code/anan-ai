import type { MarketSnapshot } from "@/server/contracts/market";

const CITY_BASE = [
  { city: "الرياض", demandSignals: 1420, researchRuns: 184, inventoryCount: 326, averagePriceLabel: "2.1M ر.س" },
  { city: "جدة", demandSignals: 1110, researchRuns: 141, inventoryCount: 288, averagePriceLabel: "1.7M ر.س" },
  { city: "الخبر", demandSignals: 740, researchRuns: 93, inventoryCount: 166, averagePriceLabel: "1.5M ر.س" },
  { city: "الدمام", demandSignals: 690, researchRuns: 88, inventoryCount: 173, averagePriceLabel: "1.4M ر.س" },
  { city: "مكة", demandSignals: 520, researchRuns: 67, inventoryCount: 118, averagePriceLabel: "1.3M ر.س" },
];

const AREAS_BY_CITY: Record<string, Array<{
  area: string;
  demandSignals: number;
  inventoryCount: number;
  averagePriceLabel: string;
  topProductType: string;
  topSignalLabel: string;
}>> = {
  الرياض: [
    { area: "الملقا", demandSignals: 310, inventoryCount: 54, averagePriceLabel: "2.3M ر.س", topProductType: "شقق", topSignalLabel: "قرب الخدمات" },
    { area: "حطين", demandSignals: 286, inventoryCount: 49, averagePriceLabel: "2.8M ر.س", topProductType: "فلل", topSignalLabel: "تشطيب فاخر" },
    { area: "الياسمين", demandSignals: 244, inventoryCount: 45, averagePriceLabel: "2.5M ر.س", topProductType: "فلل", topSignalLabel: "مساحات كبيرة" },
  ],
  جدة: [
    { area: "أبحر", demandSignals: 250, inventoryCount: 60, averagePriceLabel: "1.8M ر.س", topProductType: "شقق", topSignalLabel: "إطلالة بحرية" },
    { area: "الشاطئ", demandSignals: 231, inventoryCount: 44, averagePriceLabel: "2.0M ر.س", topProductType: "شقق", topSignalLabel: "قرب الواجهة" },
    { area: "النهضة", demandSignals: 194, inventoryCount: 39, averagePriceLabel: "1.6M ر.س", topProductType: "شقق", topSignalLabel: "جاهزية السكن" },
  ],
  الخبر: [
    { area: "العليا", demandSignals: 178, inventoryCount: 31, averagePriceLabel: "1.5M ر.س", topProductType: "شقق", topSignalLabel: "عائد استثماري" },
    { area: "البحر", demandSignals: 163, inventoryCount: 28, averagePriceLabel: "1.7M ر.س", topProductType: "شقق", topSignalLabel: "إطلالة مفتوحة" },
  ],
  الدمام: [
    { area: "الشاطئ الغربي", demandSignals: 154, inventoryCount: 34, averagePriceLabel: "1.4M ر.س", topProductType: "شقق", topSignalLabel: "قرب العمل" },
    { area: "طيبة", demandSignals: 141, inventoryCount: 27, averagePriceLabel: "1.2M ر.س", topProductType: "فلل", topSignalLabel: "سعر أقل" },
  ],
  مكة: [
    { area: "العزيزية", demandSignals: 133, inventoryCount: 25, averagePriceLabel: "1.3M ر.س", topProductType: "شقق", topSignalLabel: "قرب الحرم" },
    { area: "الشرائع", demandSignals: 118, inventoryCount: 20, averagePriceLabel: "1.1M ر.س", topProductType: "أراض", topSignalLabel: "فرص تطوير" },
  ],
};

function normalizeText(value?: string): string {
  return String(value ?? "").trim().toLowerCase();
}

function matchesQuery(query: string, ...values: Array<string | undefined>): boolean {
  if (!query) return true;
  return values.some((value) => normalizeText(value).includes(query));
}

/**
 * WHY:   The redesigned market dashboard still needs analyzable content when real data is sparse or unavailable.
 * WHAT:  Builds a deterministic Saudi market snapshot with sample metrics that respect the current filters.
 * HOW:   Starts from a small curated mock dataset, narrows it by city/area/query, and shapes it into the same snapshot contract as real data.
 */
export function buildMockMarketSnapshot(filters: MarketSnapshot["filters"]): MarketSnapshot {
  const normalizedCity = filters.city;
  const normalizedArea = filters.area;
  const query = normalizeText(filters.query);

  const cities = CITY_BASE
    .filter((row) => !normalizedCity || row.city === normalizedCity)
    .filter((row) => matchesQuery(query, row.city))
    .map((row) => ({ ...row }));

  const areaRows = Object.entries(AREAS_BY_CITY)
    .filter(([city]) => !normalizedCity || city === normalizedCity)
    .flatMap(([city, areas]) =>
      areas.map((area) => ({
        city,
        area: area.area,
        demandSignals: area.demandSignals,
        inventoryCount: area.inventoryCount,
        averagePriceLabel: area.averagePriceLabel,
        topProductType: area.topProductType,
        topSignalLabel: area.topSignalLabel,
      })),
    )
    .filter((row) => !normalizedArea || row.area === normalizedArea)
    .filter((row) => matchesQuery(query, row.city, row.area, row.topProductType, row.topSignalLabel));

  const visibleCity = normalizedCity || areaRows[0]?.city || cities[0]?.city || "الرياض";
  const visibleArea = normalizedArea || areaRows[0]?.area || "";

  const headlineDemandSignals = areaRows.reduce((sum, row) => sum + row.demandSignals, 0) || cities[0]?.demandSignals || 0;
  const headlineResearchRuns = Math.max(12, Math.round(headlineDemandSignals / 8));
  const headlineInventory = normalizedCity
    ? areaRows.reduce((sum, row) => sum + row.inventoryCount, 0)
    : cities.reduce((sum, row) => sum + row.inventoryCount, 0);

  const relatedSearchSeed = [
    `أفضل عقار في ${visibleCity}`,
    `تحليل سوق ${visibleCity}`,
    visibleArea ? `أسعار ${visibleArea} ${visibleCity}` : `أحياء ${visibleCity} الساخنة`,
    `استثمار عقاري ${visibleCity}`,
  ].filter((item) => matchesQuery(query, item));

  return {
    filters,
    availableCities: CITY_BASE.map((row) => row.city),
    availableAreas: Array.from(new Set((AREAS_BY_CITY[visibleCity] ?? []).map((row) => row.area))),
    headline: {
      selectedCityLabel: normalizedCity || "كل المدن السعودية",
      selectedAreaLabel: normalizedArea || "كل الأحياء",
      demandSignals: headlineDemandSignals,
      researchRuns: headlineResearchRuns,
      inventoryCount: headlineInventory,
      averagePriceLabel:
        areaRows[0]?.averagePriceLabel ??
        cities.find((row) => row.city === visibleCity)?.averagePriceLabel ??
        "1.9M ر.س",
    },
    topCities: cities.length > 0 ? cities : CITY_BASE.slice(0, 4),
    topAreas: areaRows.length > 0 ? areaRows : [],
    sellingPoints: [
      { label: "قرب الخدمات", count: 88, source: "features" as const },
      { label: "جاهزية السكن", count: 71, source: "features" as const },
      { label: "عوائد استثمارية", count: 64, source: "derived_configuration" as const },
      { label: "3 غرف / 2 حمامات", count: 59, source: "derived_configuration" as const },
    ],
    keywordInsights: {
      relatedSearches: relatedSearchSeed.map((label, index) => ({
        label,
        count: 42 - index * 6,
        source: (index < 2 ? "research_query" : "search_log") as "research_query" | "research_term" | "search_log",
      })),
      topKeywords: ([
        { label: "استثمار", count: 34, source: "query" },
        { label: "جاهز", count: 27, source: "query" },
        { label: "تشطيب", count: 22, source: "feature" },
      ] as const).map(item => ({ ...item })).filter((row) => matchesQuery(query, row.label)),
      topTopics: ([
        { label: "شقق", count: 41, source: "derived_topic" },
        { label: "فلل", count: 25, source: "derived_topic" },
        { label: "أراض", count: 16, source: "derived_topic" },
      ] as const).map(item => ({ ...item })).filter((row) => matchesQuery(query, row.label)),
      mostResearchedLabel: relatedSearchSeed[0] ?? `أفضل عقار في ${visibleCity}`,
    },
    opportunities: areaRows.slice(0, 4).map((row, index) => ({
      city: row.city,
      area: row.area,
      priority: index === 0 ? "high" : index === 1 ? "medium" : "watch",
      demandSignals: row.demandSignals,
      researchRuns: Math.round(row.demandSignals / 10),
      inventoryCount: row.inventoryCount,
      dominantProductType: row.topProductType,
      strongestSellingPoint: row.topSignalLabel,
      reason: `الطلب على ${row.area} في ${row.city} أعلى من المخزون المتاح حالياً مع تكرار واضح لعبارة ${row.topSignalLabel}.`,
    })),
    chartSeries: {
      cityDemand: (cities.length > 0 ? cities : CITY_BASE.slice(0, 4)).map((row) => ({
        label: row.city,
        demandSignals: row.demandSignals,
        researchRuns: row.researchRuns,
        inventoryCount: row.inventoryCount,
      })),
      areaDemand: areaRows.slice(0, 8).map((row) => ({
        label: row.area,
        demandSignals: row.demandSignals,
        researchRuns: Math.round(row.demandSignals / 10),
        inventoryCount: row.inventoryCount,
      })),
      keywordCounts: [
        { label: "استثمار", count: 34 },
        { label: "تشطيب", count: 22 },
        { label: "عوائد", count: 18 },
        { label: "جاهز", count: 27 },
      ].filter((row) => matchesQuery(query, row.label)),
    },
    latestUpdate: {
      query: `تحليل سوق ${visibleArea ? `${visibleArea} ${visibleCity}` : visibleCity}`,
      createdAt: new Date(`${filters.dateTo}T12:00:00.000Z`).getTime(),
      status: "completed",
      sourceCount: 6,
      topFindings: [
        {
          title: `وحدة سكنية مطلوبة في ${visibleArea || visibleCity}`,
          locationHint: visibleCity,
          area: visibleArea || undefined,
          priceHint: areaRows[0]?.averagePriceLabel,
          features: ["قرب الخدمات", "جاهزية السكن"],
        },
        {
          title: `فرصة استثمارية في ${visibleCity}`,
          locationHint: visibleCity,
          area: areaRows[1]?.area,
          priceHint: areaRows[1]?.averagePriceLabel,
          features: ["عوائد أعلى", "طلب متكرر"],
        },
      ],
    },
  };
}
