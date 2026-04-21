import { describe, expect, it } from "vitest";
import {
  buildBuyerComparisonDigestHash,
  buildBuyerComparisonSnapshot,
} from "./builder";

function createProperty(id: string, overrides: Partial<Parameters<typeof buildBuyerComparisonSnapshot>[0]["properties"][number]> = {}) {
  return {
    id: id as never,
    title: `Property ${id}`,
    address: `Address ${id}`,
    location: "Riyadh",
    area: "Al Yasmin",
    price: 1_000_000,
    beds: 3,
    baths: 3,
    sqft: 180,
    status: "available",
    owner: {
      name: `Owner ${id}`,
      type: "broker" as const,
      agencyLabel: `Agency ${id}`,
    },
    ...overrides,
  };
}

describe("buyerComparisons builder", () => {
  it("builds a comparison snapshot with one column per property", () => {
    const result = buildBuyerComparisonSnapshot({
      locale: "en",
      selectionSource: "ui_selected",
      properties: [createProperty("property-1"), createProperty("property-2", { price: 1_250_000, beds: 4 })],
    });

    expect(result.snapshot.cards[0]).toMatchObject({
      type: "comparison_table",
      title: "Property comparison",
    });
    expect((result.snapshot.cards[0] as any).columns).toEqual([
      "Metric",
      "Property property-1",
      "Property property-2",
    ]);
    expect(result.snapshot.activePropertyId).toBe("property-1");
    expect(result.digestHash.startsWith("cmp_")).toBe(true);
  });

  it("changes the digest hash when a decision-driving property field changes", () => {
    const first = buildBuyerComparisonSnapshot({
      locale: "ar",
      selectionSource: "history_resolved",
      properties: [createProperty("property-1"), createProperty("property-2")],
    });
    const second = buildBuyerComparisonSnapshot({
      locale: "ar",
      selectionSource: "history_resolved",
      properties: [
        createProperty("property-1"),
        createProperty("property-2", { price: 1_450_000 }),
      ],
    });

    expect(buildBuyerComparisonDigestHash(first.snapshot)).not.toBe(
      buildBuyerComparisonDigestHash(second.snapshot),
    );
  });
});
