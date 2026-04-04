import type { MarketSnapshot } from "@/server/contracts/market";
import type { WorkspaceMarketPageModel } from "../../types/marketTypes";

const RANGE_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatRangeDate(value: string): string {
  return RANGE_FORMATTER.format(new Date(`${value}T00:00:00.000Z`));
}

function buildScopeLabel(snapshot: MarketSnapshot): string {
  if (snapshot.filters.area) {
    return `${snapshot.headline.selectedCityLabel} / ${snapshot.headline.selectedAreaLabel}`;
  }

  return snapshot.headline.selectedCityLabel;
}

/**
 * WHY:   The route should keep formatting concerns out of the UI components while preserving the raw market snapshot contract.
 * WHAT:  Maps the server snapshot into the page model used by the market workspace components.
 * HOW:   Adds empty-state flags and readable date-range labels so the UI can stay presentational.
 */
export function mapMarketSnapshotToPageModel(snapshot: MarketSnapshot): WorkspaceMarketPageModel {
  return {
    ...snapshot,
    isMockData: false,
    hasAnyData:
      snapshot.topCities.length > 0 ||
      snapshot.topAreas.length > 0 ||
      snapshot.keywordInsights.topKeywords.length > 0 ||
      snapshot.keywordInsights.relatedSearches.length > 0 ||
      snapshot.opportunities.length > 0 ||
      snapshot.sellingPoints.length > 0 ||
      snapshot.latestUpdate !== null,
    scopeLabel: buildScopeLabel(snapshot),
    priorityLabels: {
      high: "أولوية عالية",
      medium: "أولوية متوسطة",
      watch: "تحت المتابعة",
    },
    compactCharts: {
      cityDemand: snapshot.chartSeries.cityDemand.slice(0, 5),
      areaDemand: snapshot.chartSeries.areaDemand.slice(0, 5),
      keywordCounts: snapshot.chartSeries.keywordCounts.slice(0, 6),
    },
    dateRange: {
      from: snapshot.filters.dateFrom,
      to: snapshot.filters.dateTo,
      label: `${formatRangeDate(snapshot.filters.dateFrom)} - ${formatRangeDate(snapshot.filters.dateTo)}`,
      helperText: snapshot.filters.windowDays
        ? `تم تحميل هذا النطاق تلقائياً من آخر ${snapshot.filters.windowDays} يوم`
        : "تم تطبيق النطاق الزمني المحدد مباشرة على الأبحاث وإشارات البحث",
      isPresetFallback: snapshot.filters.windowDays !== undefined,
    },
  };
}
