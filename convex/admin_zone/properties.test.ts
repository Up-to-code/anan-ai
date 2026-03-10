import { describe, expect, it } from "vitest";
import { buildPropertySearchText } from "../shared_logic/properties/searchText";

describe("buildPropertySearchText", () => {
  it("joins title, address, description", () => {
    const result = buildPropertySearchText({
      title: "Villa A",
      address: "123 Main St",
      description: "Spacious villa",
    });
    expect(result).toBe("Villa A 123 Main St Spacious villa");
  });

  it("includes optional location and area when present", () => {
    const result = buildPropertySearchText({
      title: "Apartment",
      address: "456 Oak Ave",
      description: "Modern",
      location: "Riyadh",
      area: "Al Olaya",
    });
    expect(result).toBe("Apartment 456 Oak Ave Modern Riyadh Al Olaya");
  });

  it("omits undefined optional fields", () => {
    const result = buildPropertySearchText({
      title: "Studio",
      address: "789 Beach Rd",
      description: "Cozy",
      location: undefined,
      area: undefined,
    });
    expect(result).toBe("Studio 789 Beach Rd Cozy");
  });
});
