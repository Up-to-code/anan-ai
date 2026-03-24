import { describe, expect, it } from "vitest";
import {
  WHATSAPP_SEND_GAP_MS,
  MAX_NORMAL_MESSAGES_PER_TURN,
  WA_LINE_MAX_CHARS,
  WA_MAX_LINES,
  VOICE_FALLBACK_MESSAGE_AR,
  VOICE_FALLBACK_MESSAGE_EN,
  WHATSAPP_GENERIC_ERROR_MESSAGE_AR,
} from "./whatsapp.rules";

describe("whatsapp.rules", () => {
  it("exports send gap constant", () => {
    expect(WHATSAPP_SEND_GAP_MS).toBe(200);
  });

  it("exports message limits", () => {
    expect(MAX_NORMAL_MESSAGES_PER_TURN).toBe(3);
    expect(WA_LINE_MAX_CHARS).toBe(380);
    expect(WA_MAX_LINES).toBe(10);
  });

  it("exports voice fallback messages", () => {
    expect(VOICE_FALLBACK_MESSAGE_AR).toBeTruthy();
    expect(VOICE_FALLBACK_MESSAGE_AR.length).toBeGreaterThan(0);
    expect(VOICE_FALLBACK_MESSAGE_EN).toBeTruthy();
    expect(WHATSAPP_GENERIC_ERROR_MESSAGE_AR).toBeTruthy();
  });
});
