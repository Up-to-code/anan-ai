import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/domains/workspaces/service", () => ({
  getWorkspaceBehaviorForCurrentUser: vi.fn(),
}));

vi.mock("@/server/infrastructure/convex/marketRepository", () => ({
  convexMarketRepository: {
    getSnapshot: vi.fn(),
  },
}));

import { getWorkspaceMarketSnapshot } from "./index";

describe("getWorkspaceMarketSnapshot", () => {
  it("rejects workspaces without market access", async () => {
    await expect(
      getWorkspaceMarketSnapshot(
        {},
        {
          getWorkspaceBehavior: vi.fn(async () => ({ capabilities: { canAccessMarket: false } })),
          repository: { getSnapshot: vi.fn() },
        },
      ),
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("validates filters and returns the repository snapshot", async () => {
    const repository = {
      getSnapshot: vi.fn(async () => ({
        filters: { city: "الرياض", area: "", query: "استثماري", windowDays: 90 as const },
        availableCities: ["الرياض"],
        availableAreas: [],
        headline: {
          selectedCityLabel: "الرياض",
          selectedAreaLabel: "كل الأحياء",
          demandSignals: 3,
          researchRuns: 1,
          inventoryCount: 2,
          averagePriceLabel: "2.0M ر.س",
        },
        topCities: [],
        topAreas: [],
        sellingPoints: [],
        keywordInsights: { topKeywords: [], topTopics: [], mostResearchedLabel: null },
        opportunities: [],
        chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
        latestUpdate: null,
      })),
    };

    await expect(
      getWorkspaceMarketSnapshot(
        { city: "الرياض", query: "استثماري", windowDays: 90 },
        {
          getWorkspaceBehavior: vi.fn(async () => ({ capabilities: { canAccessMarket: true } })),
          repository,
        },
      ),
    ).resolves.toMatchObject({
      filters: { city: "الرياض", query: "استثماري", windowDays: 90 },
    });

    expect(repository.getSnapshot).toHaveBeenCalledWith({ city: "الرياض", query: "استثماري", windowDays: 90 });
  });

  it("normalizes blank text filters before validating", async () => {
    const repository = {
      getSnapshot: vi.fn(async () => ({
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
      })),
    };

    await getWorkspaceMarketSnapshot(
      { city: "   ", area: "", query: "  ", windowDays: 90 },
      {
        getWorkspaceBehavior: vi.fn(async () => ({ capabilities: { canAccessMarket: true } })),
        repository,
      },
    );

    expect(repository.getSnapshot).toHaveBeenCalledWith({ windowDays: 90 });
  });
});
