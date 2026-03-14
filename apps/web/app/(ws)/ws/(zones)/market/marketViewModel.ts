import type { MarketSnapshot } from "@/server/contracts/market";
import type { WorkspaceMarketPageModel } from "./marketTypes";

/**
 * WHY:   The route should keep formatting concerns out of the UI components while preserving the raw market snapshot contract.
 * WHAT:  Maps the server snapshot into the page model used by the market workspace components.
 * HOW:   Adds empty-state flags and deterministic window options for the filter form without exposing timestamps in the UI.
 */
export function mapMarketSnapshotToPageModel(snapshot: MarketSnapshot): WorkspaceMarketPageModel {
  return {
    ...snapshot,
    hasAnyData:
      snapshot.topCities.length > 0 ||
      snapshot.topAreas.length > 0 ||
      snapshot.keywordInsights.topKeywords.length > 0 ||
      snapshot.opportunities.length > 0 ||
      snapshot.sellingPoints.length > 0 ||
      snapshot.latestUpdate !== null,
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
    windowOptions: [
      { value: "30", label: "آخر 30 يوم", selected: snapshot.filters.windowDays === 30 },
      { value: "90", label: "آخر 90 يوم", selected: snapshot.filters.windowDays === 90 },
      { value: "180", label: "آخر 180 يوم", selected: snapshot.filters.windowDays === 180 },
    ],
  };
}
