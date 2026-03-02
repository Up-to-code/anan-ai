import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchJsonWithRetry } from "./httpFetch";

describe("fetchJsonWithRetry", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns parsed JSON on success", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "test" }),
    });

    const result = await fetchJsonWithRetry(
      "https://example.com",
      { method: "GET" },
      { timeoutMs: 1000, maxRetries: 0 }
    );
    expect(result).toEqual({ data: "test" });
  });

  it("throws on non-ok response when no retries left", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Server error"),
    });

    await expect(
      fetchJsonWithRetry("https://example.com", { method: "GET" }, { maxRetries: 0 })
    ).rejects.toThrow();
  });
});
