import type { MarketSnapshot } from "@/server/contracts/market";

/**
 * WHY:   The market page needs a UI-facing model that can add formatted labels without mutating the server contract.
 * WHAT:  Defines the serializable page model consumed by the `/ws/market` UI folder.
 * HOW:   Extends the server snapshot with derived empty-state flags and deterministic window-select metadata.
 */
export type WorkspaceMarketPageModel = MarketSnapshot & {
  hasAnyData: boolean;
  priorityLabels: Record<"high" | "medium" | "watch", string>;
  compactCharts: {
    cityDemand: MarketSnapshot["chartSeries"]["cityDemand"];
    areaDemand: MarketSnapshot["chartSeries"]["areaDemand"];
    keywordCounts: MarketSnapshot["chartSeries"]["keywordCounts"];
  };
  windowOptions: Array<{
    value: "30" | "90" | "180";
    label: string;
    selected: boolean;
  }>;
};
