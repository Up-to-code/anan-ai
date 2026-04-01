import { describe, expect, it } from "vitest";
import {
  formatLocaleDateTime,
  formatLocaleNumber,
  getLocaleLabel,
  getNextLocale,
  isRtlLocale,
  resolveLocale,
} from "./locale";

describe("web locale helpers", () => {
  it("resolves invalid locale values back to Arabic", () => {
    expect(resolveLocale("ar")).toBe("ar");
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("fr")).toBe("fr");
    expect(resolveLocale("de")).toBe("ar");
    expect(resolveLocale(null)).toBe("ar");
  });

  it("tracks direction and labels for the supported locales", () => {
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("fr")).toBe(false);
    expect(getLocaleLabel("ar")).toBe("العربية");
    expect(getLocaleLabel("fr")).toBe("Français");
  });

  it("cycles through locales in the expected order", () => {
    expect(getNextLocale("ar")).toBe("en");
    expect(getNextLocale("en")).toBe("fr");
    expect(getNextLocale("fr")).toBe("ar");
  });

  it("formats dates and numbers with locale-aware Intl mappings", () => {
    expect(formatLocaleDateTime("en", new Date("2025-03-01T10:15:00.000Z"), {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })).toContain("Mar");

    expect(formatLocaleNumber("fr", 12345.6, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })).toContain("12");
  });
});
