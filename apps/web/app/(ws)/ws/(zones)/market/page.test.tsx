import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { MarketSnapshot } from "@/server/contracts/market";

const { getWorkspaceMarketSnapshot } = vi.hoisted(() => ({
  getWorkspaceMarketSnapshot: vi.fn(async (): Promise<MarketSnapshot> => ({
    filters: { city: "الرياض", area: "الملقا", query: "مواقف", windowDays: 90 as const },
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
    topCities: [
      {
        city: "الرياض",
        demandSignals: 12,
        researchRuns: 3,
        inventoryCount: 4,
        averagePriceLabel: "1.8M ر.س",
      },
    ],
    topAreas: [
      {
        city: "الرياض",
        area: "الملقا",
        demandSignals: 8,
        inventoryCount: 2,
        averagePriceLabel: "1.9M ر.س",
        topProductType: "شقق",
        topSignalLabel: "مواقف خاصة",
      },
    ],
    sellingPoints: [
      { label: "مواقف خاصة", count: 4, source: "features" as const },
    ],
    keywordInsights: {
      topKeywords: [{ label: "مواقف", count: 4, source: "query" as const }],
      topTopics: [{ label: "شقق", count: 3, source: "derived_topic" as const }],
      mostResearchedLabel: "مواقف",
    },
    opportunities: [
      {
        city: "الرياض",
        area: "الملقا",
        priority: "high" as const,
        demandSignals: 8,
        researchRuns: 3,
        inventoryCount: 2,
        dominantProductType: "شقق",
        strongestSellingPoint: "مواقف خاصة",
        reason: "الطلب أعلى من المعروض في الملقا داخل الرياض مع تكرار واضح لـ مواقف خاصة",
      },
    ],
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
      topFindings: [
        {
          title: "شقة 3 غرف في الملقا",
          locationHint: "الرياض",
          area: "الملقا",
        },
        ],
      },
  } satisfies MarketSnapshot)),
}));

vi.mock("@/server/market", () => ({
  getWorkspaceMarketSnapshot,
}));

import WorkspaceMarketRoute from "./page";

describe("/ws/market page", () => {
  it("renders the blurred market overview preview with an under-development overlay", async () => {
    const element = await WorkspaceMarketRoute({
      searchParams: Promise.resolve({ city: "الرياض", area: "الملقا", query: "مواقف", windowDays: "90" }),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("Coming Soon");
    expect(markup).toContain("هذه الصفحة قريباً");
    expect(markup).toContain("المدن الأعلى طلباً");
    expect(markup).toContain("الفرص الحالية");
    expect(markup).toContain("أفضل شقق في الملقا");
  });

  it("renders the honest empty state when no usable data exists", async () => {
    const emptySnapshot = {
      filters: { city: "", area: "", query: "", windowDays: 90 as const },
      availableCities: [],
      availableAreas: [],
      headline: {
        selectedCityLabel: "كل المدن السعودية",
        selectedAreaLabel: "كل الأحياء",
        demandSignals: 0,
        researchRuns: 0,
        inventoryCount: 0,
        averagePriceLabel: null,
      },
      topCities: [],
      topAreas: [],
      sellingPoints: [],
      keywordInsights: { topKeywords: [], topTopics: [], mostResearchedLabel: null },
      opportunities: [],
      chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
      latestUpdate: null,
    } satisfies MarketSnapshot;

    getWorkspaceMarketSnapshot.mockResolvedValueOnce(emptySnapshot);

    const element = await WorkspaceMarketRoute({
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("لا توجد إشارات كافية لهذا النطاق");
  });
});
