import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MarketSnapshot } from "@/server/contracts/market";

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => undefined,
  })),
}));

function createDefaultSnapshot(): MarketSnapshot {
  return {
    filters: { city: "الرياض", area: "الملقا", query: "مواقف", dateFrom: "2026-03-01", dateTo: "2026-03-25" },
    availableCities: ["الرياض", "جدة"],
    availableAreas: ["الملقا", "حطين"],
    headline: { selectedCityLabel: "الرياض", selectedAreaLabel: "الملقا", demandSignals: 12, researchRuns: 3, inventoryCount: 4, averagePriceLabel: "1.8M ر.س" },
    topCities: [{ city: "الرياض", demandSignals: 12, researchRuns: 3, inventoryCount: 4, averagePriceLabel: "1.8M ر.س" }],
    topAreas: [{ city: "الرياض", area: "الملقا", demandSignals: 8, inventoryCount: 2, averagePriceLabel: "1.9M ر.س", topProductType: "شقق", topSignalLabel: "مواقف خاصة" }],
    sellingPoints: [{ label: "مواقف خاصة", count: 4, source: "features" as const }],
    keywordInsights: {
      relatedSearches: [{ label: "أفضل شقق في الملقا", count: 3, source: "research_query" as const }],
      topKeywords: [{ label: "مواقف", count: 4, source: "query" as const }],
      topTopics: [{ label: "شقق", count: 3, source: "derived_topic" as const }],
      mostResearchedLabel: "أفضل شقق في الملقا",
    },
    opportunities: [{ city: "الرياض", area: "الملقا", priority: "high" as const, demandSignals: 8, researchRuns: 3, inventoryCount: 2, dominantProductType: "شقق", strongestSellingPoint: "مواقف خاصة", reason: "الطلب أعلى من المعروض في الملقا داخل الرياض مع تكرار واضح لـ مواقف خاصة" }],
    chartSeries: {
      cityDemand: [{ label: "الرياض", demandSignals: 12, researchRuns: 3, inventoryCount: 4 }],
      areaDemand: [{ label: "الملقا", demandSignals: 8, researchRuns: 1, inventoryCount: 2 }],
      keywordCounts: [{ label: "مواقف", count: 4 }],
    },
    latestUpdate: {
      query: "أفضل شقق في الملقا",
      createdAt: new Date("2026-03-10T09:30:00Z").getTime(),
      status: "completed" as const,
      sourceCount: 2,
      topFindings: [{ title: "شقة 3 غرف في الملقا", locationHint: "الرياض", area: "الملقا" }],
    },
  };
}

const { getWorkspaceMarketSnapshot } = vi.hoisted(() => ({
  getWorkspaceMarketSnapshot: vi.fn(),
}));
vi.mock("@/server/market", () => ({ getWorkspaceMarketSnapshot }));
vi.mock("./pages/MarketPage/MarketChartPanel", () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

import WorkspaceMarketRoute from "./page";

const originalMockFlag = process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED;

function createEmptySnapshot(): MarketSnapshot {
  return {
    filters: { city: "", area: "", query: "", dateFrom: "2026-03-01", dateTo: "2026-03-25" },
    availableCities: [],
    availableAreas: [],
    headline: { selectedCityLabel: "كل المدن السعودية", selectedAreaLabel: "كل الأحياء", demandSignals: 0, researchRuns: 0, inventoryCount: 0, averagePriceLabel: null },
    topCities: [],
    topAreas: [],
    sellingPoints: [],
    keywordInsights: { relatedSearches: [], topKeywords: [], topTopics: [], mostResearchedLabel: null },
    opportunities: [],
    chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
    latestUpdate: null,
  };
}

function createSparseSnapshot(): MarketSnapshot {
  return {
    filters: { city: "", area: "", query: "", dateFrom: "2026-03-01", dateTo: "2026-03-25" },
    availableCities: [],
    availableAreas: [],
    headline: { selectedCityLabel: "كل المدن السعودية", selectedAreaLabel: "كل الأحياء", demandSignals: 0, researchRuns: 0, inventoryCount: 1, averagePriceLabel: null },
    topCities: [],
    topAreas: [],
    sellingPoints: [],
    keywordInsights: { relatedSearches: [], topKeywords: [], topTopics: [], mostResearchedLabel: null },
    opportunities: [],
    chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
    latestUpdate: null,
  };
}

function registerMarketPageTests() {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED = "false";
    getWorkspaceMarketSnapshot.mockResolvedValue(createDefaultSnapshot());
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED = originalMockFlag;
  });

  it("renders the rebuilt market overview with filters, results, and helper panels", async () => {
    const element = await WorkspaceMarketRoute({
      searchParams: Promise.resolve({
        city: "الرياض",
        area: "الملقا",
        query: "مواقف",
        dateFrom: "2026-03-01",
        dateTo: "2026-03-25",
      }),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("تحليل السوق");
    expect(markup).toContain("Market marker");
    expect(markup).toContain("جميع صفحات ذكاء السوق معروضة الآن كواجهة قيد التطوير");
    expect(markup).toContain("مساعد الكلمات");
  });

  it("renders the honest empty state when no usable data exists", async () => {
    getWorkspaceMarketSnapshot.mockResolvedValueOnce(createEmptySnapshot());
    const element = await WorkspaceMarketRoute({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(element);
    expect(markup).toContain("لا توجد إشارات كافية لهذا النطاق");
    expect(markup).not.toContain("بيانات تجريبية");
    expect(markup).toContain("Market marker");
  });

  it("keeps sparse real snapshots honest when mock data is disabled", async () => {
    getWorkspaceMarketSnapshot.mockResolvedValueOnce(createSparseSnapshot());
    const element = await WorkspaceMarketRoute({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(element);
    expect(markup).toContain("لا توجد إشارات كافية لهذا النطاق");
    expect(markup).not.toContain("بيانات تجريبية");
    expect(markup).not.toContain("أفضل عقار في الرياض");
    expect(markup).toContain("Market marker");
  });
}

describe("/ws/market page", registerMarketPageTests);
