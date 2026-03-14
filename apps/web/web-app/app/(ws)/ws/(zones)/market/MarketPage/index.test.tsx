import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { mapMarketSnapshotToPageModel } from "../marketViewModel";
import MarketPage from "./index";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("MarketPage", () => {
  it("shows a simple coming-soon card above a strongly blurred page preview", () => {
    const model = mapMarketSnapshotToPageModel({
      filters: { city: "الرياض", area: "", query: "", windowDays: 90 },
      availableCities: ["الرياض"],
      availableAreas: ["الملقا"],
      headline: {
        selectedCityLabel: "الرياض",
        selectedAreaLabel: "كل الأحياء",
        demandSignals: 12,
        researchRuns: 3,
        inventoryCount: 4,
        averagePriceLabel: "1.8M ر.س",
      },
      topCities: [
        {
          city: "الرياض",
          demandSignals: 12,
          researchRuns: 3,
          inventoryCount: 4,
          averagePriceLabel: "1.8M ر.س",
        },
      ],
      topAreas: [],
      sellingPoints: [],
      keywordInsights: { topKeywords: [], topTopics: [], mostResearchedLabel: null },
      opportunities: [],
      chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
      latestUpdate: null,
    });

    const markup = renderToStaticMarkup(
      <MarketPage
        model={model}
        actionPath="/ws/market/cities"
        intro={{
          eyebrow: "ذكاء السوق",
          title: "جدول المدن",
          description: "وصف تجريبي",
        }}
      >
        <div>Market content</div>
      </MarketPage>,
    );

    expect(markup).toContain("Coming Soon");
    expect(markup).toContain("هذه الصفحة قريباً");
    expect(markup).toContain("Market content");
  });
});
