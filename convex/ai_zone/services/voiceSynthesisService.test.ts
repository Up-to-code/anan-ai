import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { synthesizeAssistantVoice } from "./voiceSynthesisService";

describe("voiceSynthesisService", () => {
  beforeEach(() => {
    process.env.ELEVENLABS_API_KEY = "test-eleven";
    process.env.ELEVENLABS_VOICE_ID = "voice-123";
    process.env.ELEVENLABS_MODEL_ID = "model-123";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete process.env.ELEVENLABS_API_KEY;
    delete process.env.ELEVENLABS_VOICE_ID;
    delete process.env.ELEVENLABS_MODEL_ID;
  });

  it("returns base64 encoded audio when ElevenLabs succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    } as Response);

    const result = await synthesizeAssistantVoice("مرحبا");
    expect(result.mimeType).toBe("audio/mpeg");
    expect(result.audioBase64).toBe(Buffer.from([1, 2, 3]).toString("base64"));
  });

  it("fails when ElevenLabs config is missing", async () => {
    delete process.env.ELEVENLABS_API_KEY;
    await expect(synthesizeAssistantVoice("مرحبا")).rejects.toMatchObject({
      data: {
        code: "AUTH_CONFIGURATION_ERROR",
      },
    });
  });

  it("fails when ElevenLabs returns an error payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ detail: { message: "bad request" } }),
    } as Response);

    await expect(synthesizeAssistantVoice("مرحبا")).rejects.toMatchObject({
      data: {
        message: "bad request",
      },
    });
  });
});
