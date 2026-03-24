import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

async function seedRichProperties(ctx: any) {
  await ctx.db.insert("properties", { title: "شقة عائلية", address: "الملقا، الرياض", price: 1400000, beds: 3, baths: 3, description: "وحدة شمال الرياض", location: "الرياض", area: "الملقا", publicationState: "published", status: "available" });
  await ctx.db.insert("properties", { title: "فيلا مستقلة", address: "حطين، الرياض", price: 2600000, beds: 4, baths: 5, description: "فيلا شمال الرياض", location: "الرياض", area: "حطين", publicationState: "published", status: "available" });
  await ctx.db.insert("properties", { title: "شقة بحرية", address: "أبحر، جدة", price: 1250000, beds: 3, baths: 2, description: "وحدة في جدة", location: "جدة", area: "أبحر", publicationState: "published", status: "available" });
}

async function seedRichDemandSignals(ctx: any) {
  await ctx.db.insert("searchLogs", { query: "شقق الملقا الرياض", stage: "completed", status: "completed" });
  await ctx.db.insert("searchLogs", { query: "فلل حطين الرياض", stage: "completed", status: "completed" });
}

async function seedRichResearch(ctx: any) {
  await ctx.db.insert("knowledgeResearch", {
    userId: "user-1",
    query: "أفضل شقق في الملقا الرياض",
    status: "completed",
    requestedTopSources: 3,
    requestedTopCardsPerSource: 5,
    createdAt: Date.now(),
    taskList: [],
    searchTerms: ["الملقا الرياض"],
    sourceRuns: [{ rank: 1, title: "Anan", url: "https://example.com" }],
    propertyFindings: [
      { sourceRank: 1, sourceUrl: "https://example.com/a", cardRank: 1, title: "شقة 3 غرف في الملقا", locationHint: "الرياض", area: "الملقا", imageUrls: [], features: ["مواقف خاصة", "تقسيط مرن"], beds: "3", bathrooms: "3" },
      { sourceRank: 1, sourceUrl: "https://example.com/b", cardRank: 2, title: "شقة عائلية في الملقا", locationHint: "الرياض", area: "الملقا", imageUrls: [], features: ["مواقف خاصة"], beds: "3", bathrooms: "3" },
    ],
  });
}

async function seedRichMarketScenario(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await seedRichProperties(ctx);
    await seedRichDemandSignals(ctx);
    await seedRichResearch(ctx);
  });
}

async function seedSparseMarketScenario(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await ctx.db.insert("properties", {
      title: "Villa in Riyadh",
      address: "الياسمين، الرياض",
      price: 3100000,
      beds: 4,
      baths: 5,
      sqft: 260,
      description: "North Riyadh villa",
      location: "Riyadh",
      area: "الياسمين",
      publicationState: "published",
      status: "available",
    });
    await ctx.db.insert("knowledgeResearch", {
      userId: "user-2",
      query: "سوق العقار في الرياض",
      status: "completed",
      requestedTopSources: 2,
      requestedTopCardsPerSource: 2,
      createdAt: Date.now(),
      taskList: [],
      searchTerms: ["الرياض"],
      sourceRuns: [{ rank: 1, title: "Anan", url: "https://example.com" }],
      propertyFindings: [{ sourceRank: 1, sourceUrl: "https://example.com/c", cardRank: 1, title: "فيلا مستقلة شمال الرياض", locationHint: "الرياض", area: "الياسمين", imageUrls: [] }],
    });
  });
}

function registerRichRankingTest() {
  it("combines inventory, research, and search demand for city and area ranking", async () => {
    const t = convexTest(schema, modules);
    await seedRichMarketScenario(t);

    const snapshot = (await t.query(api.shared_logic.market.getMarketSnapshot as never, { city: "الرياض", area: "الملقا", windowDays: 90 } as never)) as any;

    expect(snapshot.filters.city).toBe("الرياض");
    expect(snapshot.filters.area).toBe("الملقا");
    expect(snapshot.topCities[0]?.city).toBe("الرياض");
    expect(snapshot.topAreas[0]?.area).toBe("الملقا");
    expect(snapshot.headline.inventoryCount).toBe(1);
    expect(snapshot.sellingPoints[0]?.label).toBe("مواقف خاصة");
    expect(snapshot.keywordInsights.mostResearchedLabel).toBeTruthy();
    expect(snapshot.opportunities[0]?.area).toBe("الملقا");
    expect(snapshot.chartSeries.cityDemand.length).toBeGreaterThan(0);
    expect(snapshot.latestUpdate?.query).toContain("الملقا");
  });
}

function registerSparseFallbackTest() {
  it("falls back to derived selling points and latest national research when area data is sparse", async () => {
    const t = convexTest(schema, modules);
    await seedSparseMarketScenario(t);

    const snapshot = (await t.query(api.shared_logic.market.getMarketSnapshot as never, {
      city: "riyadh",
      area: "الياسمين",
      query: "ياسمين",
      windowDays: 90,
    } as never)) as any;

    expect(snapshot.sellingPoints.some((item: { source: string }) => item.source === "derived_configuration")).toBe(true);
    expect(snapshot.opportunities.every((item: { area: string }) => item.area === "الياسمين")).toBe(true);
    expect(snapshot.keywordInsights.topKeywords.every((item: { label: string }) => item.label.includes("ياسمين") || item.label.includes("الرياض") === false)).toBe(true);
    expect(snapshot.latestUpdate?.query).toBe("سوق العقار في الرياض");
  });
}

function registerMarketSnapshotTests() {
  registerRichRankingTest();
  registerSparseFallbackTest();
}

describe("shared market snapshot", registerMarketSnapshotTests);
