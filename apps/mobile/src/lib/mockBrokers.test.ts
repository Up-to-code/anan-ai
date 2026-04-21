import { describe, expect, it } from "vitest";
import { filterMockBrokers, getMockBrokers } from "@/lib/mockBrokers";

describe("mock broker discovery data", () => {
  it("filters brokers by name or company", () => {
    const brokers = getMockBrokers();
    const results = filterMockBrokers({
      brokers,
      query: "nada",
      location: "كل المناطق",
      verifiedOnly: false,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toContain("Nada");
  });

  it("keeps local location and verification filters deterministic", () => {
    const brokers = getMockBrokers();
    const results = filterMockBrokers({
      brokers,
      query: "",
      location: "الشيخ زايد",
      verifiedOnly: true,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.location).toBe("الشيخ زايد");
  });
});
