import { normalizeMarketArea, normalizeSaudiCity } from "../normalizers";
import { aggregateCitiesAndAreas } from "./aggregate";
import { buildChartSeries } from "./charts";
import { buildKeywordInsights } from "./keywords";
import { selectLatestUpdate } from "./latestUpdate";
import {
  normalizeConversationAnalyses,
  normalizeProperties,
  normalizeResearchRows,
  normalizeSearchSignals,
} from "./normalize";
import { buildMarketOpportunities } from "./opportunities";
import { buildSellingPoints } from "./sellingPoints";
import {
  MarketFiltersInput,
  MarketSnapshotResult,
  RawConversationAnalysis,
  RawProperty,
  RawResearch,
  RawSearchLog,
} from "./types";
import {
  formatAveragePriceLabel,
  matchesScope,
  matchesTextQuery,
  normalizeSearchText,
  pickTopEntry,
  resolveMarketDateRange,
} from "./utils";

/**
 * WHY:   The Convex query should stay thin and delegate all market-specific calculations to one pure helper.
 * WHAT:  Builds the full market snapshot for the requested Saudi city/area scope and date range.
 * HOW:   Normalizes raw rows, aggregates city/area stats, applies the requested scope and free-text filter, then derives selling points, keywords, opportunities, charts, and latest research.
 */
export function buildMarketSnapshot(args: {
  properties: RawProperty[];
  researchRows: RawResearch[];
  searchLogs: RawSearchLog[];
  conversationAnalyses?: RawConversationAnalysis[];
  filters?: MarketFiltersInput;
}): MarketSnapshotResult {
  const normalizedCity = normalizeSaudiCity(args.filters?.city);
  const normalizedArea = normalizedCity ? normalizeMarketArea(args.filters?.area) : undefined;
  const queryText = normalizeSearchText(args.filters?.query);
  const dateRange = resolveMarketDateRange(args.filters);

  const properties = normalizeProperties(args.properties);
  const researchRows = normalizeResearchRows(args.researchRows, dateRange);
  const searchSignals = normalizeSearchSignals(args.searchLogs, dateRange);
  const conversationDemands = normalizeConversationAnalyses(
    args.conversationAnalyses ?? [],
    dateRange,
  );
  const { cityAggregates, areaAggregates, availableCities } = aggregateCitiesAndAreas({
    properties,
    researchRows,
    searchSignals,
    conversationDemands,
  });

  const availableAreas = Array.from(areaAggregates.values())
    .filter((entry) => !normalizedCity || entry.city === normalizedCity)
    .map((entry) => entry.area)
    .filter((area, index, array) => array.indexOf(area) === index)
    .sort((a, b) => a.localeCompare(b, "ar"));

  const scopedProperties = properties.filter((property) =>
    matchesScope({ targetCity: normalizedCity, targetArea: normalizedArea, city: property.city, area: property.area })
  );
  const scopedSearchSignals = searchSignals.filter((signal) =>
    matchesScope({ targetCity: normalizedCity, targetArea: normalizedArea, city: signal.city, area: signal.area })
  );
  const scopedConversationDemands = conversationDemands.filter((demand) => {
    if (normalizedArea) {
      return demand.areas.some(
        (area) => area.city === normalizedCity && area.area === normalizedArea,
      );
    }
    if (normalizedCity) {
      return (
        demand.cities.includes(normalizedCity) ||
        demand.areas.some((area) => area.city === normalizedCity)
      );
    }
    return true;
  });
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
      a.city.localeCompare(b.city, "ar")
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
      a.area.localeCompare(b.area, "ar")
    )
    .slice(0, 15)
    .map(({ researchRuns: _researchRuns, ...entry }) => entry);

  const keywordInsights = buildKeywordInsights({
    researchRows: scopedResearchRows,
    searchSignals: scopedSearchSignals,
    conversationDemands: scopedConversationDemands,
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
    scopedConversationDemands.length +
    scopedResearchRows.reduce((sum, row) => {
      const matchingFindings = row.findings.filter((finding) =>
        matchesScope({ targetCity: normalizedCity, targetArea: normalizedArea, city: finding.city, area: finding.area })
      );
      return sum + Math.max(1, matchingFindings.length);
    }, 0);

  return {
    filters: {
      city: normalizedCity ?? "",
      area: normalizedArea ?? "",
      query: args.filters?.query?.trim() ?? "",
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
      windowDays: dateRange.windowDays,
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
