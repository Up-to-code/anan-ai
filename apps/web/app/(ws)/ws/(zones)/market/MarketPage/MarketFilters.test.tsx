import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { mapMarketSnapshotToPageModel } from "../marketViewModel";
import MarketFilters from "./MarketFilters";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("MarketFilters", () => {
  it("keeps filter submissions and reset links on the active market route", () => {
    const model = mapMarketSnapshotToPageModel({
      filters: { city: "الرياض", area: "الملقا", query: "مواقف", windowDays: 90 },
      availableCities: ["الرياض", "جدة"],
      availableAreas: ["الملقا", "حطين"],
      headline: {
        selectedCityLabel: "الرياض",
        selectedAreaLabel: "الملقا",
        demandSignals: 12,
        researchRuns: 3,
        inventoryCount: 4,
        averagePriceLabel: "1.8M ر.س",
      },
      topCities: [],
      topAreas: [],
      sellingPoints: [],
      keywordInsights: { topKeywords: [], topTopics: [], mostResearchedLabel: null },
      opportunities: [],
      chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
      latestUpdate: null,
    });

    const markup = renderToStaticMarkup(
      <MarketFilters model={model} actionPath="/ws/market/areas" />,
    );

    expect(markup).toContain("action=\"/ws/market/areas\"");
    expect(markup).toContain("href=\"/ws/market/areas\"");
  });
});
