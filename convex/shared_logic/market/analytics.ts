import {
  inferPropertyTypeLabel,
  normalizeMarketArea,
  normalizeSaudiCity,
  normalizeSellingFeature,
  parseSaudiGeography,
} from "./normalizers";

/**
 * WHY:   The market route needs one deterministic aggregation pipeline that can be reused by the query layer and tests.
 * WHAT:  Converts raw properties, research runs, and search logs into the stable market snapshot consumed by the web workspace.
 * HOW:   Normalizes geography first, then aggregates demand, supply, keywords, opportunities, selling points, and latest research using explicit fallbacks.
 */

export type MarketFiltersInput = {
  city?: string;
  area?: string;
  query?: string;
  windowDays?: number;
};

export type MarketSnapshotResult = {
  filters: {
    city: string;
    area: string;
    query: string;
    windowDays: 30 | 90 | 180;
  };
  availableCities: string[];
  availableAreas: string[];
  headline: {
    selectedCityLabel: string;
    selectedAreaLabel: string;
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
  };
  topCities: Array<{
    city: string;
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
  }>;
  topAreas: Array<{
    city: string;
    area: string;
    demandSignals: number;
    inventoryCount: number;
    averagePriceLabel: string | null;
    topProductType: string | null;
    topSignalLabel: string | null;
  }>;
  sellingPoints: Array<{
    label: string;
    count: number;
    source: "features" | "derived_configuration";
  }>;
  keywordInsights: {
    topKeywords: Array<{
      label: string;
      count: number;
      source: "query" | "feature" | "derived_topic";
    }>;
    topTopics: Array<{
      label: string;
      count: number;
      source: "query" | "feature" | "derived_topic";
    }>;
    mostResearchedLabel: string | null;
  };
  opportunities: Array<{
    city: string;
    area: string;
    priority: "high" | "medium" | "watch";
    demandSignals: number;
    researchRuns: number;
    inventoryCount: number;
    dominantProductType: string | null;
    strongestSellingPoint: string | null;
    reason: string;
  }>;
  chartSeries: {
    cityDemand: Array<{
      label: string;
      demandSignals: number;
      researchRuns: number;
      inventoryCount?: number;
    }>;
    areaDemand: Array<{
      label: string;
      demandSignals: number;
      researchRuns: number;
      inventoryCount?: number;
    }>;
    keywordCounts: Array<{ label: string; count: number }>;
  };
  latestUpdate: null | {
    query: string;
    createdAt: number;
    status: "completed" | "partial" | "failed";
    sourceCount: number;
    topFindings: Array<{
      title: string;
      locationHint?: string;
      priceHint?: string;
      area?: string;
      features?: string[];
      sourceTitle?: string;
      sourceUrl?: string;
    }>;
  };
};

type RawProperty = {
  title: string;
  description?: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  location?: string;
  area?: string;
  address?: string;
  status?: string;
  publicationState?: string;
};

type RawResearchFinding = {
  title: string;
  locationHint?: string;
  priceHint?: string;
  area?: string;
  features?: string[];
  sourceTitle?: string;
  sourceUrl?: string;
  beds?: string;
  bathrooms?: string;
};

type RawResearch = {
  query: string;
  createdAt: number;
  status: "completed" | "partial" | "failed";
  searchTerms?: string[];
  sourceRuns?: Array<unknown>;
  propertyFindings: RawResearchFinding[];
};

type RawSearchLog = {
  query?: string;
  _creationTime?: number;
  stage?: string;
  status?: string;
};

type NormalizedProperty = {
  city?: string;
  area?: string;
  price?: number;
  productType?: string;
  configuration?: string;
};

type NormalizedFinding = {
  title: string;
  city?: string;
  area?: string;
  priceHint?: string;
  features: string[];
  sourceTitle?: string;
  sourceUrl?: string;
  productType?: string;
  configuration?: string;
};

type NormalizedResearch = {
  query: string;
  createdAt: number;
  status: "completed" | "partial" | "failed";
  sourceCount: number;
  searchTerms: string[];
  primaryCity?: string;
  primaryArea?: string;
  findings: NormalizedFinding[];
};

type NormalizedSearchSignal = {
  city?: string;
  area?: string;
  query?: string;
};

type AreaAggregate = {
  city: string;
  area: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  prices: number[];
  productTypeCounts: Map<string, number>;
  signalCounts: Map<string, number>;
};

type CityAggregate = {
  city: string;
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  prices: number[];
};

type KeywordCounts = {
  query: Map<string, number>;
  feature: Map<string, number>;
  derived: Map<string, number>;
};

const KEYWORD_STOPWORDS = new Set([
  "عقار",
  "عقارات",
  "العقاري",
  "السعودية",
  "سعودي",
  "في",
  "من",
  "على",
  "عن",
  "الى",
  "إلى",
  "داخل",
  "حي",
  "منطقة",
  "شقة",
  "شقق",
  "فيلا",
  "فلل",
  "ارض",
  "أرض",
  "أراض",
  "للبيع",
  "للايجار",
  "للإيجار",
  "افضل",
  "أفضل",
  "سوق",
  "market",
  "search",
  "property",
  "properties",
  "real",
  "estate",
  "best",
  "top",
  "good",
  "area",
  "city",
  "research",
]);

function normalizeWindowDays(value?: number): 30 | 90 | 180 {
  if (value === 30 || value === 180) return value;
  return 90;
}

function isActiveProperty(property: RawProperty): boolean {
  if (property.publicationState === "draft" || property.publicationState === "archived") return false;
  if (property.status === "sold" || property.status === "reserved") return false;
  return true;
}

function formatAveragePriceLabel(prices: number[]): string | null {
  if (prices.length === 0) return null;
  const average = prices.reduce((sum, value) => sum + value, 0) / prices.length;
  if (average >= 1_000_000) {
    return `${(average / 1_000_000).toFixed(1)}M ر.س`;
  }
  if (average >= 1_000) {
    return `${Math.round(average / 1_000)}K ر.س`;
  }
  return `${Math.round(average)} ر.س`;
}

function buildConfigurationLabel(args: {
  beds?: string | number;
  baths?: string | number;
  area?: string | number;
}): string | undefined {
  const parts: string[] = [];
  const beds = typeof args.beds === "number" ? args.beds : Number.parseInt(String(args.beds ?? ""), 10);
  const baths = typeof args.baths === "number" ? args.baths : Number.parseInt(String(args.baths ?? ""), 10);
  const numericArea =
    typeof args.area === "number"
      ? args.area
      : Number.parseInt(String(args.area ?? "").replace(/[^\d]/g, ""), 10);

  if (Number.isFinite(beds) && beds > 0) parts.push(`${beds} غرف`);
  if (Number.isFinite(baths) && baths > 0) parts.push(`${baths} حمامات`);
  if (Number.isFinite(numericArea) && numericArea > 0) parts.push(`${numericArea}م²`);
  return parts.length > 0 ? parts.join(" / ") : undefined;
}

function normalizeSearchText(value?: string | null): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[،,/|]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesScope(args: {
  targetCity?: string;
  targetArea?: string;
  city?: string;
  area?: string;
}): boolean {
  if (args.targetCity && args.city !== args.targetCity) return false;
  if (args.targetArea && args.area !== args.targetArea) return false;
  return true;
}

function matchesTextQuery(queryText: string, ...values: Array<string | null | undefined>): boolean {
  if (!queryText) return true;
  return values.some((value) => normalizeSearchText(value).includes(queryText));
}

function pickTopEntry(counts: Map<string, number>): string | null {
  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"));
  return sorted[0]?.[0] ?? null;
}

function tokenizeKeywordText(value: string, excludedPhrases: Set<string>): string[] {
  const normalized = normalizeSearchText(value)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

  return normalized.filter((token) => token.length >= 2 && !KEYWORD_STOPWORDS.has(token) && !excludedPhrases.has(token));
}

function incrementCount(counts: Map<string, number>, key: string | undefined): void {
  if (!key) return;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function normalizeProperties(properties: RawProperty[]): NormalizedProperty[] {
  return properties
    .filter(isActiveProperty)
    .map((property) => {
      const geography = parseSaudiGeography({
        location: property.location,
        area: property.area,
        address: property.address,
      });
      return {
        city: geography.city,
        area: geography.area,
        price: typeof property.price === "number" && Number.isFinite(property.price) ? property.price : undefined,
        productType: inferPropertyTypeLabel(`${property.title ?? ""} ${property.description ?? ""}`),
        configuration: buildConfigurationLabel({
          beds: property.beds,
          baths: property.baths,
          area: property.sqft,
        }),
      };
    });
}

function normalizeResearchRows(researchRows: RawResearch[], windowDays: 30 | 90 | 180): NormalizedResearch[] {
  const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  return researchRows
    .filter((row) => row.createdAt >= since)
    .map((row) => {
      const queryGeo = parseSaudiGeography({ query: row.query });
      const findings = row.propertyFindings.map((finding) => {
        const findingGeo = parseSaudiGeography({
          location: finding.locationHint,
          area: finding.area,
          query: row.query,
        });
        return {
          title: finding.title,
          city: findingGeo.city ?? queryGeo.city,
          area: findingGeo.area ?? normalizeMarketArea(finding.area),
          priceHint: finding.priceHint,
          features: (finding.features ?? [])
            .map((feature) => normalizeSellingFeature(feature))
            .filter((feature): feature is string => typeof feature === "string"),
          sourceTitle: finding.sourceTitle,
          sourceUrl: finding.sourceUrl,
          productType: inferPropertyTypeLabel(finding.title),
          configuration: buildConfigurationLabel({
            beds: finding.beds,
            baths: finding.bathrooms,
            area: finding.area,
          }),
        };
      });

      return {
        query: row.query,
        createdAt: row.createdAt,
        status: row.status,
        sourceCount: row.sourceRuns?.length ?? 0,
        searchTerms: row.searchTerms ?? [],
        primaryCity: findings.find((finding) => finding.city)?.city ?? queryGeo.city,
        primaryArea: findings.find((finding) => finding.area)?.area ?? queryGeo.area,
        findings,
      };
    });
}

function normalizeSearchSignals(searchLogs: RawSearchLog[], windowDays: 30 | 90 | 180): NormalizedSearchSignal[] {
  const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  return searchLogs
    .filter((log) => (log._creationTime ?? 0) >= since)
    .filter((log) => !!log.query)
    .filter((log) => !log.stage || log.stage === "completed" || log.stage === "serper" || log.stage === "db")
    .map((log) => ({ ...parseSaudiGeography({ query: log.query! }), query: log.query }))
    .filter((geo) => geo.city || geo.area);
}

function aggregateCitiesAndAreas(args: {
  properties: NormalizedProperty[];
  researchRows: NormalizedResearch[];
  searchSignals: NormalizedSearchSignal[];
}): {
  cityAggregates: Map<string, CityAggregate>;
  areaAggregates: Map<string, AreaAggregate>;
  availableCities: string[];
} {
  const cityAggregates = new Map<string, CityAggregate>();
  const areaAggregates = new Map<string, AreaAggregate>();

  function ensureCity(city: string): CityAggregate {
    const existing = cityAggregates.get(city);
    if (existing) return existing;
    const created: CityAggregate = {
      city,
      demandSignals: 0,
      researchRuns: 0,
      inventoryCount: 0,
      prices: [],
    };
    cityAggregates.set(city, created);
    return created;
  }

  function ensureArea(city: string, area: string): AreaAggregate {
    const key = `${city}::${area}`;
    const existing = areaAggregates.get(key);
    if (existing) return existing;
    const created: AreaAggregate = {
      city,
      area,
      demandSignals: 0,
      researchRuns: 0,
      inventoryCount: 0,
      prices: [],
      productTypeCounts: new Map<string, number>(),
      signalCounts: new Map<string, number>(),
    };
    areaAggregates.set(key, created);
    return created;
  }

  for (const property of args.properties) {
    if (!property.city) continue;
    const city = ensureCity(property.city);
    city.inventoryCount += 1;
    if (property.price) city.prices.push(property.price);
    if (!property.area) continue;
    const area = ensureArea(property.city, property.area);
    area.inventoryCount += 1;
    if (property.price) area.prices.push(property.price);
    incrementCount(area.productTypeCounts, property.productType);
    incrementCount(area.signalCounts, property.productType);
    incrementCount(area.signalCounts, property.configuration);
  }

  for (const signal of args.searchSignals) {
    if (!signal.city) continue;
    ensureCity(signal.city).demandSignals += 1;
    if (signal.area) ensureArea(signal.city, signal.area).demandSignals += 1;
  }

  for (const research of args.researchRows) {
    if (research.primaryCity) {
      ensureCity(research.primaryCity).researchRuns += 1;
      ensureCity(research.primaryCity).demandSignals += 1;
      if (research.primaryArea) {
        ensureArea(research.primaryCity, research.primaryArea).researchRuns += 1;
        ensureArea(research.primaryCity, research.primaryArea).demandSignals += 1;
      }
    }

    for (const finding of research.findings) {
      if (!finding.city) continue;
      ensureCity(finding.city).demandSignals += 1;
      if (!finding.area) continue;
      const area = ensureArea(finding.city, finding.area);
      area.demandSignals += 1;
      incrementCount(area.productTypeCounts, finding.productType);
      incrementCount(area.signalCounts, finding.productType);
      incrementCount(area.signalCounts, finding.configuration);
      for (const feature of finding.features) {
        incrementCount(area.signalCounts, feature);
      }
    }
  }

  return {
    cityAggregates,
    areaAggregates,
    availableCities: Array.from(cityAggregates.keys()).sort((a, b) => a.localeCompare(b, "ar")),
  };
}

function buildSellingPoints(args: {
  properties: NormalizedProperty[];
  researchRows: NormalizedResearch[];
  city?: string;
  area?: string;
}): MarketSnapshotResult["sellingPoints"] {
  const featureCounts = new Map<string, number>();
  const derivedCounts = new Map<string, number>();

  for (const research of args.researchRows) {
    for (const finding of research.findings) {
      if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: finding.city, area: finding.area })) continue;
      for (const feature of finding.features) {
        incrementCount(featureCounts, feature);
      }
      incrementCount(derivedCounts, finding.configuration ?? finding.productType);
    }
  }

  if (featureCounts.size < 3) {
    for (const property of args.properties) {
      if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: property.city, area: property.area })) continue;
      incrementCount(derivedCounts, property.configuration ?? property.productType);
    }
  }

  const features = Array.from(featureCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, source: "features" as const }));

  if (featureCounts.size >= 3) {
    return features;
  }

  const derived = Array.from(derivedCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
    .filter(([label]) => !featureCounts.has(label))
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, source: "derived_configuration" as const }));

  return [...features, ...derived].slice(0, 5);
}

function buildKeywordInsights(args: {
  researchRows: NormalizedResearch[];
  city?: string;
  area?: string;
  queryText: string;
}): MarketSnapshotResult["keywordInsights"] {
  const excludedPhrases = new Set<string>();
  for (const token of tokenizeKeywordText(args.city ?? "", new Set())) excludedPhrases.add(token);
  for (const token of tokenizeKeywordText(args.area ?? "", new Set())) excludedPhrases.add(token);

  const counts: KeywordCounts = {
    query: new Map<string, number>(),
    feature: new Map<string, number>(),
    derived: new Map<string, number>(),
  };

  for (const research of args.researchRows) {
    for (const token of tokenizeKeywordText(research.query, excludedPhrases)) {
      incrementCount(counts.query, token);
    }
    for (const term of research.searchTerms) {
      for (const token of tokenizeKeywordText(term, excludedPhrases)) {
        incrementCount(counts.query, token);
      }
    }

    for (const finding of research.findings) {
      if (!matchesScope({ targetCity: args.city, targetArea: args.area, city: finding.city, area: finding.area })) continue;
      for (const feature of finding.features) {
        incrementCount(counts.feature, feature);
      }
      incrementCount(counts.derived, finding.productType);
      incrementCount(counts.derived, finding.configuration);
    }
  }

  const topKeywords = [
    ...Array.from(counts.query.entries()).map(([label, count]) => ({ label, count, source: "query" as const })),
    ...Array.from(counts.feature.entries()).map(([label, count]) => ({ label, count, source: "feature" as const })),
  ]
    .filter((item) => matchesTextQuery(args.queryText, item.label))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ar"))
    .slice(0, 12);

  const topTopics = Array.from(counts.derived.entries())
    .map(([label, count]) => ({ label, count, source: "derived_topic" as const }))
    .filter((item) => matchesTextQuery(args.queryText, item.label))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ar"))
    .slice(0, 12);

  return {
    topKeywords,
    topTopics,
    mostResearchedLabel: topKeywords[0]?.label ?? topTopics[0]?.label ?? null,
  };
}

function buildMarketOpportunities(args: {
  areaAggregates: Map<string, AreaAggregate>;
  city?: string;
  queryText: string;
}): MarketSnapshotResult["opportunities"] {
  const ranked = Array.from(args.areaAggregates.values())
    .filter((entry) => !args.city || entry.city === args.city)
    .map((entry) => {
      const dominantProductType = pickTopEntry(entry.productTypeCounts);
      const strongestSellingPoint = pickTopEntry(entry.signalCounts);
      const supplyGap = Math.max(0, entry.demandSignals - entry.inventoryCount);
      const score =
        entry.demandSignals * 3 +
        entry.researchRuns * 2 +
        Math.min(6, supplyGap * 2) +
        (strongestSellingPoint ? 3 : 0) +
        (dominantProductType ? 1 : 0);

      let priority: "high" | "medium" | "watch" | null = null;
      if (entry.demandSignals >= 4 && entry.researchRuns >= 1 && score >= 12) priority = "high";
      else if (entry.demandSignals >= 2 && score >= 7) priority = "medium";
      else if (score >= 4) priority = "watch";

      if (!priority) return null;

      const reason = strongestSellingPoint
        ? `الطلب أعلى من المعروض في ${entry.area} داخل ${entry.city} مع تكرار واضح لـ ${strongestSellingPoint}`
        : `الحي يظهر طلباً بحثياً متكرراً مقارنة بحجم المخزون الحالي`;

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
        reason,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .filter((item) =>
      matchesTextQuery(args.queryText, item.city, item.area, item.dominantProductType, item.strongestSellingPoint, item.reason),
    )
    .sort((a, b) =>
      b.score - a.score ||
      b.demandSignals - a.demandSignals ||
      b.researchRuns - a.researchRuns ||
      a.area.localeCompare(b.area, "ar"),
    )
    .slice(0, 12)
    .map(({ score: _score, ...item }) => item);

  return ranked;
}

function selectLatestUpdate(args: {
  researchRows: NormalizedResearch[];
  city?: string;
  area?: string;
}): MarketSnapshotResult["latestUpdate"] {
  const sorted = [...args.researchRows].sort((a, b) => b.createdAt - a.createdAt);
  const areaMatch =
    args.city && args.area
      ? sorted.find((row) =>
          row.findings.some((finding) => finding.city === args.city && finding.area === args.area) ||
          (row.primaryCity === args.city && row.primaryArea === args.area),
        )
      : undefined;
  const cityMatch =
    args.city && !areaMatch
      ? sorted.find((row) =>
          row.findings.some((finding) => finding.city === args.city) || row.primaryCity === args.city,
        )
      : undefined;
  const row = areaMatch ?? cityMatch ?? sorted[0];
  if (!row) return null;

  const scopedFindings = row.findings.filter((finding) =>
    matchesScope({ targetCity: args.city, targetArea: args.area, city: finding.city, area: finding.area }),
  );
  const findingsToShow = (scopedFindings.length > 0 ? scopedFindings : row.findings).slice(0, 3);

  return {
    query: row.query,
    createdAt: row.createdAt,
    status: row.status,
    sourceCount: row.sourceCount,
    topFindings: findingsToShow.map((finding) => ({
      title: finding.title,
      locationHint: finding.city,
      priceHint: finding.priceHint,
      area: finding.area,
      features: finding.features.length > 0 ? finding.features : undefined,
      sourceTitle: finding.sourceTitle,
      sourceUrl: finding.sourceUrl,
    })),
  };
}

function buildChartSeries(args: {
  topCities: MarketSnapshotResult["topCities"];
  topAreas: MarketSnapshotResult["topAreas"];
  keywordInsights: MarketSnapshotResult["keywordInsights"];
}): MarketSnapshotResult["chartSeries"] {
  return {
    cityDemand: args.topCities.slice(0, 8).map((city) => ({
      label: city.city,
      demandSignals: city.demandSignals,
      researchRuns: city.researchRuns,
      inventoryCount: city.inventoryCount,
    })),
    areaDemand: args.topAreas.slice(0, 8).map((area) => ({
      label: area.area,
      demandSignals: area.demandSignals,
      researchRuns: 0,
      inventoryCount: area.inventoryCount,
    })),
    keywordCounts: args.keywordInsights.topKeywords.slice(0, 8).map((item) => ({
      label: item.label,
      count: item.count,
    })),
  };
}

/**
 * WHY:   The Convex query should stay thin and delegate all market-specific calculations to one pure helper.
 * WHAT:  Builds the full market snapshot for the requested Saudi city/area scope and lookback window.
 * HOW:   Normalizes raw rows, aggregates city/area stats, applies the requested scope and free-text filter, then derives selling points, keywords, opportunities, charts, and latest research.
 */
export function buildMarketSnapshot(args: {
  properties: RawProperty[];
  researchRows: RawResearch[];
  searchLogs: RawSearchLog[];
  filters?: MarketFiltersInput;
}): MarketSnapshotResult {
  const normalizedCity = normalizeSaudiCity(args.filters?.city);
  const normalizedArea = normalizedCity ? normalizeMarketArea(args.filters?.area) : undefined;
  const queryText = normalizeSearchText(args.filters?.query);
  const windowDays = normalizeWindowDays(args.filters?.windowDays);

  const properties = normalizeProperties(args.properties);
  const researchRows = normalizeResearchRows(args.researchRows, windowDays);
  const searchSignals = normalizeSearchSignals(args.searchLogs, windowDays);
  const { cityAggregates, areaAggregates, availableCities } = aggregateCitiesAndAreas({
    properties,
    researchRows,
    searchSignals,
  });

  const availableAreas = Array.from(areaAggregates.values())
    .filter((entry) => !normalizedCity || entry.city === normalizedCity)
    .map((entry) => entry.area)
    .filter((area, index, array) => array.indexOf(area) === index)
    .sort((a, b) => a.localeCompare(b, "ar"));

  const scopedProperties = properties.filter((property) =>
    matchesScope({ targetCity: normalizedCity, targetArea: normalizedArea, city: property.city, area: property.area }),
  );
  const scopedSearchSignals = searchSignals.filter((signal) =>
    matchesScope({ targetCity: normalizedCity, targetArea: normalizedArea, city: signal.city, area: signal.area }),
  );
  const scopedResearchRows = researchRows.filter((row) => {
    if (normalizedCity && normalizedArea) {
      return (
        row.findings.some((finding) => finding.city === normalizedCity && finding.area === normalizedArea) ||
        (row.primaryCity === normalizedCity && row.primaryArea === normalizedArea)
      );
    }
    if (normalizedCity) {
      return row.findings.some((finding) => finding.city === normalizedCity) || row.primaryCity === normalizedCity;
    }
    return true;
  });

  const sellingPoints = buildSellingPoints({
    properties,
    researchRows,
    city: normalizedCity,
    area: normalizedArea,
  });

  const topCities = Array.from(cityAggregates.values())
    .filter((city) => matchesTextQuery(queryText, city.city))
    .sort((a, b) =>
      b.demandSignals - a.demandSignals ||
      b.researchRuns - a.researchRuns ||
      b.inventoryCount - a.inventoryCount ||
      a.city.localeCompare(b.city, "ar"),
    )
    .slice(0, 12)
    .map((city) => ({
      city: city.city,
      demandSignals: city.demandSignals,
      researchRuns: city.researchRuns,
      inventoryCount: city.inventoryCount,
      averagePriceLabel: formatAveragePriceLabel(city.prices),
    }));

  const topAreas = Array.from(areaAggregates.values())
    .filter((entry) => !normalizedCity || entry.city === normalizedCity)
    .map((entry) => ({
      city: entry.city,
      area: entry.area,
      demandSignals: entry.demandSignals,
      researchRuns: entry.researchRuns,
      inventoryCount: entry.inventoryCount,
      averagePriceLabel: formatAveragePriceLabel(entry.prices),
      topProductType: pickTopEntry(entry.productTypeCounts),
      topSignalLabel: pickTopEntry(entry.signalCounts),
    }))
    .filter((entry) => matchesTextQuery(queryText, entry.city, entry.area, entry.topProductType, entry.topSignalLabel))
    .sort((a, b) =>
      b.demandSignals - a.demandSignals ||
      b.researchRuns - a.researchRuns ||
      b.inventoryCount - a.inventoryCount ||
      a.area.localeCompare(b.area, "ar"),
    )
    .slice(0, 15)
    .map(({ researchRuns: _researchRuns, ...entry }) => entry);

  const keywordInsights = buildKeywordInsights({
    researchRows: scopedResearchRows,
    city: normalizedCity,
    area: normalizedArea,
    queryText,
  });

  const opportunities = buildMarketOpportunities({
    areaAggregates,
    city: normalizedCity,
    queryText,
  }).filter((item) => !normalizedArea || item.area === normalizedArea);

  const headlineDemandSignals =
    scopedSearchSignals.length +
    scopedResearchRows.reduce((sum, row) => {
      const matchingFindings = row.findings.filter((finding) =>
        matchesScope({ targetCity: normalizedCity, targetArea: normalizedArea, city: finding.city, area: finding.area }),
      );
      return sum + Math.max(1, matchingFindings.length);
    }, 0);

  return {
    filters: {
      city: normalizedCity ?? "",
      area: normalizedArea ?? "",
      query: args.filters?.query?.trim() ?? "",
      windowDays,
    },
    availableCities,
    availableAreas,
    headline: {
      selectedCityLabel: normalizedCity ?? "كل المدن السعودية",
      selectedAreaLabel: normalizedArea ?? "كل الأحياء",
      demandSignals: headlineDemandSignals,
      researchRuns: scopedResearchRows.length,
      inventoryCount: normalizedCity || normalizedArea ? scopedProperties.length : properties.length,
      averagePriceLabel: formatAveragePriceLabel(scopedProperties.flatMap((property) => (property.price ? [property.price] : []))),
    },
    topCities,
    topAreas,
    sellingPoints,
    keywordInsights,
    opportunities,
    chartSeries: buildChartSeries({
      topCities,
      topAreas,
      keywordInsights,
    }),
    latestUpdate: selectLatestUpdate({
      researchRows,
      city: normalizedCity,
      area: normalizedArea,
    }),
  };
}
