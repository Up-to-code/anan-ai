import { describe, expect, it } from "vitest";
import { processVoicePipeline } from "./voicePipeline";

describe("processVoicePipeline", () => {
  it("returns english fallback and assistant context when transcription is unavailable", async () => {
    const result = await processVoicePipeline({
      mediaId: "media-1",
      userId: "user-1",
      preferredLanguage: "en",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fallbackMessage.toLowerCase()).toContain("transcribe");
      expect(result.assistantContextText.toLowerCase()).toContain("voice note");
    }
  });

  it("returns arabic fallback and assistant context by default", async () => {
    const result = await processVoicePipeline({
      mediaId: "media-2",
      userId: "user-2",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fallbackMessage).toContain("الصوتية");
      expect(result.assistantContextText).toContain("المستخدم");
    }
  });
});
