import { getWorkspaceMarketSnapshot } from "@/server/market";
import { buildMockMarketSnapshot } from "../../fixtures/mockMarketSnapshot";
import { mapMarketSnapshotToPageModel } from "./marketViewModel";
import type { WorkspaceMarketPageModel } from "../../types/marketTypes";

type MarketSearchParams = {
  city?: string | string[];
  area?: string | string[];
  query?: string | string[];
  dateFrom?: string | string[];
  dateTo?: string | string[];
  windowDays?: string | string[];
};

function pickString(value?: string | string[]): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseWindowDays(value?: string): 30 | 90 | 180 | undefined {
  if (value === "30" || value === "90" || value === "180") {
    return Number(value) as 30 | 90 | 180;
  }
  return undefined;
}

function parseMarketDate(value?: string): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10) === value ? value : undefined;
}

function maxNumericValue<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((max, item) => Math.max(max, pick(item)), 0);
}

function needsMockCitySection(model: WorkspaceMarketPageModel): boolean {
  return (
    model.topCities.length < 3 ||
    maxNumericValue(model.topCities, (row) => row.demandSignals) <= 1 ||
    model.chartSeries.cityDemand.length < 3
  );
}

function needsMockAreaSection(model: WorkspaceMarketPageModel): boolean {
  return (
    model.topAreas.length < 4 ||
    maxNumericValue(model.topAreas, (row) => row.demandSignals) <= 1 ||
    model.chartSeries.areaDemand.length < 4
  );
}

function needsMockKeywordSection(model: WorkspaceMarketPageModel): boolean {
  return (
    model.keywordInsights.relatedSearches.length < 4 ||
    model.keywordInsights.topKeywords.length < 3 ||
    model.keywordInsights.topTopics.length < 3 ||
    model.chartSeries.keywordCounts.length < 4
  );
}

function needsMockOpportunitySection(model: WorkspaceMarketPageModel): boolean {
  return (
    model.opportunities.length < 3 ||
    maxNumericValue(model.opportunities, (row) => row.demandSignals) <= 1
  );
}

function needsMockSellingPoints(model: WorkspaceMarketPageModel): boolean {
  return model.sellingPoints.length < 3;
}

function mergeWithMockModel(realModel: WorkspaceMarketPageModel, mockModel: WorkspaceMarketPageModel): WorkspaceMarketPageModel {
  const usesMockSections =
    needsMockCitySection(realModel) ||
    needsMockAreaSection(realModel) ||
    needsMockKeywordSection(realModel) ||
    needsMockOpportunitySection(realModel) ||
    needsMockSellingPoints(realModel) ||
    realModel.latestUpdate === null;

  if (!usesMockSections) {
    return realModel;
  }

  return {
    ...realModel,
    isMockData: true,
    availableCities: realModel.availableCities.length > 0 ? realModel.availableCities : mockModel.availableCities,
    availableAreas: realModel.availableAreas.length > 0 ? realModel.availableAreas : mockModel.availableAreas,
    headline: {
      ...realModel.headline,
      demandSignals: realModel.headline.demandSignals > 3 ? realModel.headline.demandSignals : mockModel.headline.demandSignals,
      researchRuns: realModel.headline.researchRuns > 2 ? realModel.headline.researchRuns : mockModel.headline.researchRuns,
      inventoryCount: realModel.headline.inventoryCount > 0 ? realModel.headline.inventoryCount : mockModel.headline.inventoryCount,
      averagePriceLabel: realModel.headline.averagePriceLabel ?? mockModel.headline.averagePriceLabel,
    },
    topCities: needsMockCitySection(realModel) ? mockModel.topCities : realModel.topCities,
    topAreas: needsMockAreaSection(realModel) ? mockModel.topAreas : realModel.topAreas,
    sellingPoints: needsMockSellingPoints(realModel) ? mockModel.sellingPoints : realModel.sellingPoints,
    keywordInsights: {
      relatedSearches:
        needsMockKeywordSection(realModel)
          ? mockModel.keywordInsights.relatedSearches
          : realModel.keywordInsights.relatedSearches,
      topKeywords:
        needsMockKeywordSection(realModel)
          ? mockModel.keywordInsights.topKeywords
          : realModel.keywordInsights.topKeywords,
      topTopics:
        needsMockKeywordSection(realModel)
          ? mockModel.keywordInsights.topTopics
          : realModel.keywordInsights.topTopics,
      mostResearchedLabel:
        realModel.keywordInsights.mostResearchedLabel ??
        mockModel.keywordInsights.mostResearchedLabel,
    },
    opportunities: needsMockOpportunitySection(realModel) ? mockModel.opportunities : realModel.opportunities,
    chartSeries: {
      cityDemand: needsMockCitySection(realModel) ? mockModel.chartSeries.cityDemand : realModel.chartSeries.cityDemand,
      areaDemand: needsMockAreaSection(realModel) ? mockModel.chartSeries.areaDemand : realModel.chartSeries.areaDemand,
      keywordCounts:
        needsMockKeywordSection(realModel) ? mockModel.chartSeries.keywordCounts : realModel.chartSeries.keywordCounts,
    },
    latestUpdate: realModel.latestUpdate ?? mockModel.latestUpdate,
    hasAnyData: true,
    compactCharts: {
      cityDemand:
        needsMockCitySection(realModel) ? mockModel.compactCharts.cityDemand : realModel.compactCharts.cityDemand,
      areaDemand:
        needsMockAreaSection(realModel) ? mockModel.compactCharts.areaDemand : realModel.compactCharts.areaDemand,
      keywordCounts:
        needsMockKeywordSection(realModel)
          ? mockModel.compactCharts.keywordCounts
          : realModel.compactCharts.keywordCounts,
    },
    dateRange: {
      ...realModel.dateRange,
      helperText:
        "بعض أقسام هذه الصفحة تعتمد على بيانات تجريبية لأن البيانات الحقيقية الحالية لا تكفي لملء لوحة التحليل بالكامل.",
    },
  };
}

/**
 * WHY:   All market analysis routes should load the same server snapshot logic instead of duplicating search-param parsing.
 * WHAT:  Resolves the current market page model from route search params.
 * HOW:   Parses the shared market filters once, calls the market service, then maps the snapshot into the UI model.
 */
export async function loadMarketPageModel(searchParams: Promise<MarketSearchParams>): Promise<WorkspaceMarketPageModel> {
  const mockDataEnabled = process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED === "true";
  const resolvedSearchParams = await searchParams;
  const dateFrom = parseMarketDate(pickString(resolvedSearchParams.dateFrom));
  const dateTo = parseMarketDate(pickString(resolvedSearchParams.dateTo));
  const snapshot = await getWorkspaceMarketSnapshot({
    city: pickString(resolvedSearchParams.city),
    area: pickString(resolvedSearchParams.area),
    query: pickString(resolvedSearchParams.query),
    dateFrom: dateFrom && dateTo ? dateFrom : undefined,
    dateTo: dateFrom && dateTo ? dateTo : undefined,
    windowDays: parseWindowDays(pickString(resolvedSearchParams.windowDays)),
  });

  const model = mapMarketSnapshotToPageModel(snapshot);
  if (!mockDataEnabled) {
    return model;
  }

  const mockModel = mapMarketSnapshotToPageModel(buildMockMarketSnapshot(snapshot.filters));
  if (!model.hasAnyData) {
    return {
      ...mockModel,
      isMockData: true,
      dateRange: {
        ...mockModel.dateRange,
        helperText: "لا توجد بيانات حقيقية كافية لهذا النطاق حالياً، لذلك نعرض بيانات تجريبية لتوضيح لوحة التحليل.",
      },
    };
  }

  return mergeWithMockModel(model, mockModel);
}
