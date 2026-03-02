import { describe, expect, it } from "vitest";
import {
  authWhatsAppWebhook,
  authApp,
  authWeb,
} from "./auth";

describe("auth", () => {
  describe("authWhatsAppWebhook", () => {
    it("authorizes when from is valid phone length", () => {
      const result = authWhatsAppWebhook({
        from: "966501234567",
        displayName: "John",
      });
      expect(result.authorized).toBe(true);
      expect((result as { userId: string }).userId).toBe("966501234567");
      expect((result as { displayName?: string }).displayName).toBe("John");
    });

    it("rejects when from too short", () => {
      const result = authWhatsAppWebhook({ from: "123" });
      expect(result.authorized).toBe(false);
      expect((result as { reason: string }).reason).toContain("Invalid");
    });

    it("rejects when from empty", () => {
      const result = authWhatsAppWebhook({ from: "" });
      expect(result.authorized).toBe(false);
    });
  });

  describe("authApp", () => {
    it("authorizes when credentials exist", () => {
      const result = authApp({ sessionId: "session-user-1" });
      expect(result.authorized).toBe(true);
    });

    it("rejects when credentials are missing", () => {
      const result = authApp({});
      expect(result.authorized).toBe(false);
    });
  });

  describe("authWeb", () => {
    it("authorizes when api key and user id are valid", () => {
      const result = authWeb({ apiKey: "1234567890abcd", userId: "web-user-1" });
      expect(result.authorized).toBe(true);
    });

    it("rejects invalid api key", () => {
      const result = authWeb({ apiKey: "key1", userId: "web-user-1" });
      expect(result.authorized).toBe(false);
    });
  });
});
