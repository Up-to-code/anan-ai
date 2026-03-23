import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  shouldRetry,
  getBackoffMs,
  getLocalizedFallbackMessage,
  getVoiceFallbackMessage,
  DEFAULT_RETRY_CONFIG,
  errorHandler,
} from "./errors";

const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => errorSpy.mockClear());
afterEach(() => errorSpy.mockRestore());

describe("shouldRetry", () => {
  it("returns false when attempt >= maxAttempts", () => {
    expect(shouldRetry(new Error("503"), 3, 3)).toBe(false);
  });

  it("returns true for 503 error", () => {
    expect(shouldRetry(new Error("Service 503"), 0, 3)).toBe(true);
  });

  it("returns true for 429 rate limit", () => {
    expect(shouldRetry(new Error("429 rate limit"), 1, 3)).toBe(true);
  });

  it("returns true for timeout", () => {
    expect(shouldRetry(new Error("ETIMEDOUT timeout"), 0, 3)).toBe(true);
  });

  it("returns false for non-retryable error", () => {
    expect(shouldRetry(new Error("validation failed"), 0, 3)).toBe(false);
  });
});

describe("getBackoffMs", () => {
  it("returns initialBackoff for attempt 0", () => {
    expect(getBackoffMs(0, DEFAULT_RETRY_CONFIG)).toBe(250);
  });

  it("exponential backoff for attempt 1", () => {
    expect(getBackoffMs(1, DEFAULT_RETRY_CONFIG)).toBe(500);
  });
});

describe("getLocalizedFallbackMessage", () => {
  it("returns English when en", () => {
    expect(getLocalizedFallbackMessage("en")).toContain("Sorry");
  });

  it("returns Arabic when ar", () => {
    expect(getLocalizedFallbackMessage("ar")).toContain("عذراً");
  });
});

describe("getVoiceFallbackMessage", () => {
  it("returns English voice message when en", () => {
    expect(getVoiceFallbackMessage("en")).toContain("transcribe");
  });

  it("returns Arabic voice message when ar", () => {
    expect(getVoiceFallbackMessage("ar")).toContain("تحويل");
  });
});

describe("errorHandler", () => {
  it("returns message and code from error", () => {
    const err = Object.assign(new Error("msg"), { code: "ERR_CODE" });
    const result = errorHandler(err, "ctx");
    expect(result.message).toBe("msg");
    expect(result.code).toBe("ERR_CODE");
  });

  it("returns message for plain Error", () => {
    const result = errorHandler(new Error("x"), "ctx");
    expect(result.message).toBe("x");
  });
});
