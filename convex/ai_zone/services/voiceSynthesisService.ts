import { ConvexError } from "convex/values";

type ElevenLabsResponse = {
  detail?: {
    message?: string;
  };
};

const DEFAULT_ARABIC_ASSISTANT_VOICE_SETTINGS = {
  stability: 0.52,
  similarity_boost: 0.78,
  style: 0.1,
  use_speaker_boost: true,
  speed: 0.96,
};

function getElevenLabsConfig() {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_flash_v2_5";

  if (!apiKey || !voiceId) {
    throw new ConvexError({
      code: "AUTH_CONFIGURATION_ERROR",
      message: "Missing ElevenLabs configuration.",
    });
  }

  return { apiKey, voiceId, modelId };
}

/**
 * WHY:   The public main assistant should speak back with low-latency synthesized voice tuned for conversational Arabic playback.
 * WHAT:  Calls ElevenLabs TTS and returns base64 audio payload plus metadata for immediate browser playback.
 * HOW:   Uses the configured voice/model, applies calm assistant voice settings, requests MP3 output, and serializes the binary response to base64.
 */
export async function synthesizeAssistantVoice(text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Voice synthesis text is required.",
    });
  }

  const { apiKey, voiceId, modelId } = getElevenLabsConfig();
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: trimmedText,
      model_id: modelId,
      optimize_streaming_latency: 3,
      output_format: "mp3_44100_128",
      voice_settings: DEFAULT_ARABIC_ASSISTANT_VOICE_SETTINGS,
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ElevenLabsResponse | null;
    throw new ConvexError({
      code: "INTERNAL_ERROR",
      message: payload?.detail?.message || "Voice synthesis failed.",
    });
  }

  const audioBuffer = await response.arrayBuffer();
  if (audioBuffer.byteLength === 0) {
    throw new ConvexError({
      code: "INTERNAL_ERROR",
      message: "Voice synthesis returned empty audio.",
    });
  }

  return {
    audioBase64: Buffer.from(audioBuffer).toString("base64"),
    mimeType: "audio/mpeg",
  };
}
