import { describe, expect, it } from "vitest";
import {
  inferPropertyTypeLabel,
  normalizeSaudiCity,
  normalizeSellingFeature,
  parseSaudiGeography,
} from "./normalizers";

describe("market normalizers", () => {
  it("parses Arabic and English city aliases", () => {
    expect(normalizeSaudiCity("شقق في الرياض")).toBe("الرياض");
    expect(normalizeSaudiCity("apartments in jeddah")).toBe("جدة");
  });

  it("extracts city and area from mixed location strings", () => {
    expect(parseSaudiGeography({ location: "الملقا، الرياض" })).toEqual({
      city: "الرياض",
      area: "الملقا",
    });
    expect(parseSaudiGeography({ query: "villa in al khobar al bahar" })).toEqual({
      city: "الخبر",
      area: "bahar",
    });
  });

  it("normalizes selling features and property types", () => {
    expect(normalizeSellingFeature("Private parking")).toBe("مواقف خاصة");
    expect(normalizeSellingFeature("تقسيط مرن")).toBe("خطة سداد");
    expect(inferPropertyTypeLabel("Luxury villas in north riyadh")).toBe("فلل");
    expect(inferPropertyTypeLabel("أرض تجارية على شارع رئيسي")).toBe("أراضٍ");
  });
});
