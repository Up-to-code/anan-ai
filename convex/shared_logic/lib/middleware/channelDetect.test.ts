import { describe, expect, it } from "vitest";
import { detectChannelFromRequest } from "./channelDetect";

describe("detectChannelFromRequest", () => {
  it("returns whatsapp high when path contains whatsapp", () => {
    const result = detectChannelFromRequest({ path: "/api/whatsapp/webhook" });
    expect(result.channel).toBe("whatsapp");
    if (result.channel === "whatsapp") expect(result.confidence).toBe("high");
  });

  it("returns whatsapp high when path contains webhook", () => {
    const result = detectChannelFromRequest({ path: "/webhook" });
    expect(result.channel).toBe("whatsapp");
  });

  it("returns whatsapp medium when user-agent contains WhatsApp", () => {
    const result = detectChannelFromRequest({
      headers: { "user-agent": "WhatsApp/2.0" },
    });
    expect(result.channel).toBe("whatsapp");
    if (result.channel === "whatsapp") expect(result.confidence).toBe("medium");
  });

  it("returns null when no match", () => {
    const result = detectChannelFromRequest({
      path: "/api/other",
      headers: {},
    });
    expect(result.channel).toBeNull();
    expect((result as { reason: string }).reason).toContain("Could not detect");
  });
});
