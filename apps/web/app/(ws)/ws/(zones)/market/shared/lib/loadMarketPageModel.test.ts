import { afterEach, describe, expect, it, vi } from "vitest";
import { loadMarketPageModel } from "./loadMarketPageModel";

const {
  mockGetWorkspaceMarketSnapshot,
  mockBuildMockMarketSnapshot,
  mockMapMarketSnapshotToPageModel,
} = vi.hoisted(() => ({
  mockGetWorkspaceMarketSnapshot: vi.fn(async () => ({ filters: {} })),
  mockBuildMockMarketSnapshot: vi.fn(() => ({ filters: {} })),
  mockMapMarketSnapshotToPageModel: vi.fn(),
}));

vi.mock("@/server/market", () => ({
  getWorkspaceMarketSnapshot: mockGetWorkspaceMarketSnapshot,
}));

vi.mock("../../fixtures/mockMarketSnapshot", () => ({
  buildMockMarketSnapshot: mockBuildMockMarketSnapshot,
}));

vi.mock("./marketViewModel", () => ({
  mapMarketSnapshotToPageModel: mockMapMarketSnapshotToPageModel,
}));

const baseModel = {
  hasAnyData: true,
  isMockData: false,
  availableCities: [],
  availableAreas: [],
  headline: {
    demandSignals: 0,
    researchRuns: 0,
    inventoryCount: 0,
    averagePriceLabel: null,
  },
  topCities: [],
  topAreas: [],
  sellingPoints: [],
  keywordInsights: {
    relatedSearches: [],
    topKeywords: [],
    topTopics: [],
    mostResearchedLabel: null,
  },
  opportunities: [],
  chartSeries: {
    cityDemand: [],
    areaDemand: [],
    keywordCounts: [],
  },
  latestUpdate: null,
  compactCharts: {
    cityDemand: [],
    areaDemand: [],
    keywordCounts: [],
  },
  dateRange: {
    helperText: "",
  },
};

const mockModel = {
  ...baseModel,
  hasAnyData: true,
  topCities: [{ demandSignals: 2 }],
  topAreas: [{ demandSignals: 2 }, { demandSignals: 2 }, { demandSignals: 2 }, { demandSignals: 2 }],
  keywordInsights: {
    relatedSearches: ["a", "b", "c", "d"],
    topKeywords: ["a", "b", "c"],
    topTopics: ["a", "b", "c"],
    mostResearchedLabel: "mock",
  },
  opportunities: [{ demandSignals: 2 }, { demandSignals: 2 }, { demandSignals: 2 }],
  chartSeries: {
    cityDemand: [1, 2, 3],
    areaDemand: [1, 2, 3, 4],
    keywordCounts: [1, 2, 3, 4],
  },
  compactCharts: {
    cityDemand: [1, 2, 3],
    areaDemand: [1, 2, 3, 4],
    keywordCounts: [1, 2, 3, 4],
  },
  latestUpdate: "2026-01-01",
  sellingPoints: ["a", "b", "c"],
  availableCities: ["Riyadh"],
  availableAreas: ["Area 1"],
  headline: {
    demandSignals: 5,
    researchRuns: 3,
    inventoryCount: 10,
    averagePriceLabel: "100",
  },
};

const originalMockFlag = process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED;

afterEach(() => {
  process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED = originalMockFlag;
  mockGetWorkspaceMarketSnapshot.mockClear();
  mockBuildMockMarketSnapshot.mockClear();
  mockMapMarketSnapshotToPageModel.mockClear();
});

describe("loadMarketPageModel mock gating", () => {
  it("skips mock merge when NEXT_PUBLIC_MOCK_DATA_ENABLED is false", async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED = "false";
    mockMapMarketSnapshotToPageModel.mockReturnValue(baseModel);

    const result = await loadMarketPageModel(Promise.resolve({}));

    expect(result).toBe(baseModel);
    expect(mockBuildMockMarketSnapshot).not.toHaveBeenCalled();
    expect(mockMapMarketSnapshotToPageModel).toHaveBeenCalledTimes(1);
  });

  it("merges mock data when NEXT_PUBLIC_MOCK_DATA_ENABLED is true", async () => {
    process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED = "true";
    mockMapMarketSnapshotToPageModel
      .mockReturnValueOnce(baseModel)
      .mockReturnValueOnce(mockModel);

    const result = await loadMarketPageModel(Promise.resolve({}));

    expect(mockBuildMockMarketSnapshot).toHaveBeenCalledTimes(1);
    expect(mockMapMarketSnapshotToPageModel).toHaveBeenCalledTimes(2);
    expect(result.isMockData).toBe(true);
    expect(result.topCities).toEqual(mockModel.topCities);
  });
});
