import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { mapMarketSnapshotToPageModel } from "../marketViewModel";
import MarketPage from "./index";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const previewModel = mapMarketSnapshotToPageModel({
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

const previewIntro = {
  eyebrow: "ذكاء السوق",
  title: "جدول المدن",
  description: "وصف تجريبي",
};

let previousFlag: string | undefined;

beforeEach(() => {
  previousFlag = process.env.NEXT_PUBLIC_MARKET_UNDER_DEVELOPMENT;
  process.env.NEXT_PUBLIC_MARKET_UNDER_DEVELOPMENT = "true";
});

afterEach(() => {
  if (previousFlag === undefined) {
    delete process.env.NEXT_PUBLIC_MARKET_UNDER_DEVELOPMENT;
  } else {
    process.env.NEXT_PUBLIC_MARKET_UNDER_DEVELOPMENT = previousFlag;
  }
});

it("shows a simple coming-soon card above a strongly blurred page preview", () => {
  const markup = renderToStaticMarkup(
    <MarketPage model={previewModel} actionPath="/ws/market/cities" intro={previewIntro}>
      <div>Market content</div>
    </MarketPage>,
  );

  expect(markup).toContain("Coming soon");
  expect(markup).toContain("هذه الصفحة قريباً");
  expect(markup).toContain("Market content");
});
