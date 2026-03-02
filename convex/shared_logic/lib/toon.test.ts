import { decode } from "@toon-format/toon";
import { describe, expect, it } from "vitest";
import { toonEncode } from "./toon";

describe("toonEncode", () => {
  it("encodes plain object", () => {
    const data = { id: 1, name: "Test" };
    const result = toonEncode(data);
    expect(result).toContain("id");
    expect(result).toContain("name");
    expect(result).toContain("Test");
    const decoded = decode(result);
    expect(decoded).toEqual(data);
  });

  it("encodes array of objects", () => {
    const data = [
      { sku: "A1", qty: 2, price: 9.99 },
      { sku: "B2", qty: 1, price: 14.5 },
    ];
    const result = toonEncode(data);
    expect(result).toContain("sku");
    const decoded = decode(result);
    expect(decoded).toEqual(data);
  });

  it("encodes nested objects", () => {
    const input = { a: { b: { c: 1 } } };
    const result = toonEncode(input);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("encodes arrays with mixed types", () => {
    const input = [1, "two", { three: 3 }, null];
    const result = toonEncode(input);
    expect(typeof result).toBe("string");
  });

  it("encodes null and falls back safely", () => {
    const result = toonEncode(null);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    const decoded = decode(result);
    expect(decoded).toBeNull();
  });
});
