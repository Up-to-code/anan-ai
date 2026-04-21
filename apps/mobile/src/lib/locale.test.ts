import { describe, expect, it } from "vitest";
import { getDirection, getNumberLocale, resolveLocale } from "@/lib/locale";

describe("mobile locale helpers", () => {
  it("resolves supported locales directly", () => {
    expect(resolveLocale("ar")).toBe("ar");
    expect(resolveLocale("en")).toBe("en");
  });

  it("falls back unknown and legacy locales to Arabic", () => {
    expect(resolveLocale("fr")).toBe("ar");
    expect(resolveLocale("de")).toBe("ar");
    expect(resolveLocale(null)).toBe("ar");
    expect(resolveLocale(undefined)).toBe("ar");
  });

  it("returns direction and number locale per mobile locale", () => {
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en")).toBe("ltr");
    expect(getNumberLocale("ar")).toBe("ar-SA");
    expect(getNumberLocale("en")).toBe("en-US");
  });
});
