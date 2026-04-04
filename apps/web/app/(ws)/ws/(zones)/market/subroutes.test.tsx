import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketSnapshot } from "@/server/contracts/market";

const { getWorkspaceMarketSnapshot } = vi.hoisted(() => ({
  getWorkspaceMarketSnapshot: vi.fn(),
}));

vi.mock("@/server/market", () => ({ getWorkspaceMarketSnapshot }));
vi.mock("./pages/MarketPage/MarketChartPanel", () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

function createSnapshot(): MarketSnapshot {
  return {
    filters: { city: "الرياض", area: "", query: "", dateFrom: "2026-03-01", dateTo: "2026-03-25" },
    availableCities: ["الرياض", "جدة"],
    availableAreas: ["الملقا", "حطين"],
    headline: {
      selectedCityLabel: "الرياض",
      selectedAreaLabel: "كل الأحياء",
      demandSignals: 14,
      researchRuns: 4,
      inventoryCount: 7,
      averagePriceLabel: "1.9M ر.س",
    },
    topCities: [
      { city: "الرياض", demandSignals: 14, researchRuns: 4, inventoryCount: 7, averagePriceLabel: "1.9M ر.س" },
      { city: "جدة", demandSignals: 9, researchRuns: 2, inventoryCount: 5, averagePriceLabel: "1.4M ر.س" },
    ],
    topAreas: [
      { city: "الرياض", area: "الملقا", demandSignals: 8, inventoryCount: 3, averagePriceLabel: "2.0M ر.س", topProductType: "شقق", topSignalLabel: "مواقف خاصة" },
    ],
    sellingPoints: [{ label: "مواقف خاصة", count: 4, source: "features" as const }],
    keywordInsights: {
      relatedSearches: [{ label: "أفضل شقق شمال الرياض", count: 3, source: "research_query" as const }],
      topKeywords: [{ label: "مواقف", count: 4, source: "query" as const }],
      topTopics: [{ label: "شقق", count: 3, source: "derived_topic" as const }],
      mostResearchedLabel: "أفضل شقق شمال الرياض",
    },
    opportunities: [
      {
        city: "الرياض",
        area: "الملقا",
        priority: "high" as const,
        demandSignals: 8,
        researchRuns: 3,
        inventoryCount: 3,
        dominantProductType: "شقق",
        strongestSellingPoint: "مواقف خاصة",
        reason: "الطلب يتجاوز العرض الحالي في الملقا.",
      },
    ],
    chartSeries: {
      cityDemand: [{ label: "الرياض", demandSignals: 14, researchRuns: 4, inventoryCount: 7 }],
      areaDemand: [{ label: "الملقا", demandSignals: 8, researchRuns: 3, inventoryCount: 3 }],
      keywordCounts: [{ label: "مواقف", count: 4 }],
    },
    latestUpdate: {
      query: "أفضل شقق شمال الرياض",
      createdAt: new Date("2026-03-22T10:00:00.000Z").getTime(),
      status: "completed" as const,
      sourceCount: 3,
      topFindings: [{ title: "شقة 3 غرف", locationHint: "الرياض", area: "الملقا" }],
    },
  };
}

import MarketCitiesRoute from "./cities/page";
import MarketAreasRoute from "./areas/page";
import MarketOpportunitiesRoute from "./opportunities/page";
import MarketResearchRoute from "./research/page";

describe("market subroutes", () => {
  const originalMockFlag = process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED = "false";
    getWorkspaceMarketSnapshot.mockResolvedValue(createSnapshot());
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED = originalMockFlag;
  });

  it("renders the cities route", async () => {
    const element = await MarketCitiesRoute({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(element);
    expect(markup).toContain("تحليل المدن");
    expect(markup).toContain("ترتيب المدن");
    expect(markup).toContain("Market marker");
  });

  it("renders the areas route", async () => {
    const element = await MarketAreasRoute({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(element);
    expect(markup).toContain("المناطق الساخنة");
    expect(markup).toContain("الملقا");
    expect(markup).toContain("Market marker");
  });

  it("renders the opportunities route", async () => {
    const element = await MarketOpportunitiesRoute({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(element);
    expect(markup).toContain("نتائج السوق");
    expect(markup).toContain("الطلب يتجاوز العرض الحالي في الملقا.");
    expect(markup).toContain("Market marker");
  });

  it("renders the research route", async () => {
    const element = await MarketResearchRoute({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(element);
    expect(markup).toContain("مساعد الكلمات");
    expect(markup).toContain("أفضل شقق شمال الرياض");
    expect(markup).toContain("Market marker");
  });
});
