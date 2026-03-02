import { describe, expect, it } from "vitest";
import { detectPreferredLanguage } from "./language";

describe("detectPreferredLanguage", () => {
  it("returns ar for empty string", () => {
    expect(detectPreferredLanguage("")).toBe("ar");
    expect(detectPreferredLanguage(undefined)).toBe("ar");
  });

  it("returns en for latin-only text", () => {
    expect(detectPreferredLanguage("Hello world")).toBe("en");
    expect(detectPreferredLanguage("mortgage rates")).toBe("en");
  });

  it("returns ar for arabic-only text", () => {
    expect(detectPreferredLanguage("مرحبا")).toBe("ar");
    expect(detectPreferredLanguage("عقار الرياض")).toBe("ar");
  });

  it("returns ar when arabic dominates mixed text", () => {
    expect(detectPreferredLanguage("عقار في Riyadh")).toBe("ar");
  });

  it("returns en when latin dominates mixed text", () => {
    expect(detectPreferredLanguage("Property في Jeddah")).toBe("en");
  });
});
