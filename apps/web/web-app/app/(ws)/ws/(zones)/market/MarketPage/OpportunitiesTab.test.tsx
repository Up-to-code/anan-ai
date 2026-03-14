import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mapMarketSnapshotToPageModel } from "../marketViewModel";
import OpportunitiesTab from "./OpportunitiesTab";

describe("OpportunitiesTab", () => {
  it("renders ranked opportunities with human-readable priority labels", () => {
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
      topCities: [],
      topAreas: [],
      sellingPoints: [],
      keywordInsights: { topKeywords: [], topTopics: [], mostResearchedLabel: null },
      opportunities: [
        {
          city: "الرياض",
          area: "الملقا",
          priority: "high",
          demandSignals: 8,
          researchRuns: 3,
          inventoryCount: 2,
          dominantProductType: "شقق",
          strongestSellingPoint: "مواقف خاصة",
          reason: "الطلب أعلى من المعروض في الملقا داخل الرياض مع تكرار واضح لـ مواقف خاصة",
        },
      ],
      chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
      latestUpdate: null,
    });

    const markup = renderToStaticMarkup(<OpportunitiesTab model={model} />);

    expect(markup).toContain("أولوية عالية");
    expect(markup).toContain("الملقا");
    expect(markup).toContain("مواقف خاصة");
  });
});
