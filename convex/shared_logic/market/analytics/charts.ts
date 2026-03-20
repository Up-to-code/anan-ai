import { MarketSnapshotResult } from "./types";

export function buildChartSeries(args: {
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

