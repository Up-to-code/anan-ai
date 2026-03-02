import { describe, expect, it } from "vitest";
import {
  SEARCH_CACHE_TTL_MS,
  GLOBAL_SEARCH_CACHE_TTL_MS,
  SEARCH_CACHE_TTL_HOT_MS,
} from "./constants";

describe("constants", () => {
  it("SEARCH_CACHE_TTL_MS is 15 minutes", () => {
    expect(SEARCH_CACHE_TTL_MS).toBe(15 * 60 * 1000);
  });

  it("GLOBAL_SEARCH_CACHE_TTL_MS is 2 hours", () => {
    expect(GLOBAL_SEARCH_CACHE_TTL_MS).toBe(2 * 60 * 60 * 1000);
  });

  it("SEARCH_CACHE_TTL_HOT_MS is defined", () => {
    expect(typeof SEARCH_CACHE_TTL_HOT_MS).toBe("number");
    expect(SEARCH_CACHE_TTL_HOT_MS).toBeGreaterThan(0);
  });
});
