import { describe, expect, it } from "vitest";
import { buildPropertySearchText } from "./searchText";

describe("buildPropertySearchText", () => {
  it("concatenates present fields", () => {
    expect(
      buildPropertySearchText({
        title: "Villa",
        address: "Riyadh",
        description: "Garden home",
        location: "North",
        area: "Hittin",
      }),
    ).toBe("Villa Riyadh Garden home North Hittin");
  });

  it("skips missing optional fields", () => {
    expect(
      buildPropertySearchText({
        title: "Apartment",
        address: "Jeddah",
        description: "Sea view",
      }),
    ).toBe("Apartment Jeddah Sea view");
  });
});
