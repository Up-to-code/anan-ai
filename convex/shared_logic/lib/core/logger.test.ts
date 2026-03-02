import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  isAgentDebugEnabled,
  debugLog,
  withDebugTiming,
  logSearchLifecycle,
} from "./logger";

describe("logger", () => {
  const origEnv = process.env;
  const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

  beforeEach(() => {
    process.env = { ...origEnv };
    debugSpy.mockClear();
  });

  afterEach(() => {
    process.env = origEnv;
    debugSpy.mockRestore();
  });

  describe("isAgentDebugEnabled", () => {
    it("returns false when NODE_ENV is production", () => {
      process.env.NODE_ENV = "production";
      expect(isAgentDebugEnabled()).toBe(false);
    });

    it("returns true when AGENT_DEBUG_LOGS is 1", () => {
      process.env.NODE_ENV = "test";
      process.env.AGENT_DEBUG_LOGS = "1";
      expect(isAgentDebugEnabled()).toBe(true);
    });

    it("returns true when AGENT_DEBUG_LOGS is true", () => {
      process.env.NODE_ENV = "test";
      process.env.AGENT_DEBUG_LOGS = "true";
      expect(isAgentDebugEnabled()).toBe(true);
    });
  });

  describe("debugLog", () => {
    it("does not call console.debug when debug disabled", () => {
      process.env.NODE_ENV = "production";
      debugLog("scope", "event", {});
      expect(debugSpy).not.toHaveBeenCalled();
    });

    it("executes without throw when AGENT_DEBUG_LOGS enabled", () => {
      process.env.NODE_ENV = "test";
      process.env.AGENT_DEBUG_LOGS = "1";
      expect(() => debugLog("scope", "event", { key: "value" })).not.toThrow();
    });
  });

  describe("withDebugTiming", () => {
    it("returns fn result on success", async () => {
      const result = await withDebugTiming("scope", "op", {}, async () => "ok");
      expect(result).toBe("ok");
    });

    it("throws on fn error", async () => {
      await expect(
        withDebugTiming("scope", "op", {}, async () => {
          throw new Error("fail");
        })
      ).rejects.toThrow("fail");
    });
  });

  describe("logSearchLifecycle", () => {
    it("executes without throw", () => {
      expect(() =>
        logSearchLifecycle(null, null, {
          query: "villas",
          stage: "db_checked",
          status: "success",
        })
      ).not.toThrow();
    });
  });
});
