import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { mapMarketSnapshotToPageModel } from "../marketViewModel";
import ResearchKeywordsTab from "./ResearchKeywordsTab";

describe("ResearchKeywordsTab", () => {
  it("renders scoped keyword and topic analysis", () => {
    const model = mapMarketSnapshotToPageModel({
      filters: { city: "الرياض", area: "الملقا", query: "", windowDays: 90 },
      availableCities: ["الرياض"],
      availableAreas: ["الملقا"],
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
      sellingPoints: [{ label: "مواقف خاصة", count: 3, source: "features" }],
      keywordInsights: {
        topKeywords: [{ label: "مواقف", count: 4, source: "query" }],
        topTopics: [{ label: "شقق", count: 3, source: "derived_topic" }],
        mostResearchedLabel: "مواقف",
      },
      opportunities: [],
      chartSeries: { cityDemand: [], areaDemand: [], keywordCounts: [] },
      latestUpdate: null,
    });

    const markup = renderToStaticMarkup(<ResearchKeywordsTab model={model} />);

    expect(markup).toContain("مواقف");
    expect(markup).toContain("شقق");
    expect(markup).toContain("مواقف خاصة");
  });
});
