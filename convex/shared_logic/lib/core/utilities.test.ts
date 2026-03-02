import { describe, expect, it } from "vitest";
import {
  cleanWhitespace,
  sanitizeWebText,
  extractPriceHint,
  extractLocationHint,
  stripProviderBranding,
  tokenizeTitle,
  tokenizeQuery,
  wordCount,
  truncate,
  normalizeWhitespace,
} from "./utilities";

describe("utilities", () => {
  describe("cleanWhitespace", () => {
    it("trims and collapses spaces", () => {
      expect(cleanWhitespace("  hello   world  ")).toBe("hello world");
    });
  });

  describe("sanitizeWebText", () => {
    it("returns fallback for undefined/empty", () => {
      expect(sanitizeWebText(undefined)).toBe("");
      expect(sanitizeWebText("")).toBe("");
      expect(sanitizeWebText(undefined, "n/a")).toBe("n/a");
    });

    it("strips provider branding", () => {
      const result = sanitizeWebText("Great property - Serper");
      expect(result).not.toContain("Serper");
    });
  });

  describe("extractPriceHint", () => {
    it("extracts SAR amounts", () => {
      expect(extractPriceHint("Property for SAR 1,500,000")).toMatch(/1.*500.*000|1500000/);
    });

    it("returns undefined when no price", () => {
      expect(extractPriceHint("No price here")).toBeUndefined();
    });
  });

  describe("extractLocationHint", () => {
    it("extracts location after in/at/near", () => {
      expect(extractLocationHint("apartment in Riyadh")).toBe("Riyadh");
    });

    it("returns undefined when no match", () => {
      expect(extractLocationHint("random text")).toBeUndefined();
    });

    it("extracts location after at", () => {
      expect(extractLocationHint("villa at Jeddah")).toBe("Jeddah");
    });

    it("extracts location after near", () => {
      expect(extractLocationHint("property near Dammam")).toBe("Dammam");
    });
  });

  describe("cleanWhitespace", () => {
    it("handles multiple spaces", () => {
      expect(cleanWhitespace("a    b    c")).toBe("a b c");
    });
    it("handles tabs and newlines", () => {
      expect(cleanWhitespace("a\t\n  b")).toBe("a b");
    });
  });

  describe("stripProviderBranding", () => {
    it("strips Serper", () => {
      expect(stripProviderBranding("Result - Serper")).not.toContain("Serper");
    });
  });

  describe("tokenizeTitle", () => {
    it("splits and filters short tokens", () => {
      const tokens = tokenizeTitle("Villa in Riyadh 4 beds");
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens).toContain("villa");
      expect(tokens).toContain("riyadh");
    });
  });

  describe("wordCount", () => {
    it("counts words", () => {
      expect(wordCount("hello world")).toBe(2);
      expect(wordCount("  a  b  c  ")).toBe(3);
    });
  });

  describe("truncate", () => {
    it("truncates long text", () => {
      expect(truncate("hello world", 5)).toContain("...");
      expect(truncate("hi", 5)).toBe("hi");
    });
  });

  describe("normalizeWhitespace", () => {
    it("collapses spaces", () => {
      expect(normalizeWhitespace("  a   b  ")).toBe("a b");
    });
  });

  describe("tokenizeQuery", () => {
    it("returns tokens and locationPhrases", () => {
      const result = tokenizeQuery("villas in Riyadh");
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.locationPhrases).toContain("riyadh");
    });
    it("filters stopwords", () => {
      const result = tokenizeQuery("the villa in the city");
      expect(result.tokens).not.toContain("the");
    });
  });
});
