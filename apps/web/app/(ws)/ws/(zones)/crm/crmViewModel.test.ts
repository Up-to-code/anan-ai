import { describe, expect, it } from "vitest";
import { mapDealToCrmClientRecord } from "./crmViewModel";

describe("crmViewModel", () => {
  it("preserves lost stage and follow-up timestamp", () => {
    const nextFollowUpAt = Date.now() + 2 * 60 * 60 * 1000;
    const mapped = mapDealToCrmClientRecord({
      id: "deal-1",
      createdAt: Date.now(),
      title: "Client One",
      contactName: "Client One",
      stage: "lost",
      relationType: "internal_client",
      nextFollowUpAt,
    });

    expect(mapped.stage).toBe("lost");
    expect(mapped.nextFollowUpAt).toBe(nextFollowUpAt);
  });
});
