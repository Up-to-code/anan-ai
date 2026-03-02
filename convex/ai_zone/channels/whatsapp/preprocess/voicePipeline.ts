/**
 * Voice pipeline – transcribe audio before agent.
 * Plan: processVoiceNote → transcription → ProcessedInput.text or VOICE_FALLBACK_MESSAGE.
 */
import { VOICE_FALLBACK_MESSAGE_AR } from "../../rules/whatsapp.rules";

export type VoicePipelineInput = {
  mediaId: string;
  userId: string;
  preferredLanguage?: "ar" | "en";
};

export type VoicePipelineResult =
  | { success: true; text: string }
  | { success: false; fallbackMessage: string };

/**
 * Placeholder: integrate with transcription service (AssemblyAI or similar).
 * Returns fallback when transcription not available.
 */
export async function processVoicePipeline(
  input: VoicePipelineInput,
): Promise<VoicePipelineResult> {
  // TODO: Call transformVoiceToText(mediaId) when services/transcription exists.
  // For now, return fallback so structure is in place.
  const fallback =
    input.preferredLanguage === "en"
      ? "Sorry, we couldn't transcribe your voice. Please type your message."
      : VOICE_FALLBACK_MESSAGE_AR;
  return { success: false, fallbackMessage: fallback };
}
