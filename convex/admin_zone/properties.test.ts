import { describe, expect, it } from "vitest";
import { buildSearchText } from "./services/propertiesService";

describe("buildSearchText", () => {
  it("joins title, address, description", () => {
    const result = buildSearchText({
      title: "Villa A",
      address: "123 Main St",
      description: "Spacious villa",
    });
    expect(result).toBe("Villa A 123 Main St Spacious villa");
  });

  it("includes optional location and area when present", () => {
    const result = buildSearchText({
      title: "Apartment",
      address: "456 Oak Ave",
      description: "Modern",
      location: "Riyadh",
      area: "Al Olaya",
    });
    expect(result).toBe("Apartment 456 Oak Ave Modern Riyadh Al Olaya");
  });

  it("omits undefined optional fields", () => {
    const result = buildSearchText({
      title: "Studio",
      address: "789 Beach Rd",
      description: "Cozy",
      location: undefined,
      area: undefined,
    });
    expect(result).toBe("Studio 789 Beach Rd Cozy");
  });
});
