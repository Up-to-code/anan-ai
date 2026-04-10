/**
 * Voice pipeline – transcribe audio before agent.
 * Plan: processVoiceNote → transcription → ProcessedInput.text or VOICE_FALLBACK_MESSAGE.
 */
import {
  VOICE_FALLBACK_MESSAGE_AR,
  VOICE_FALLBACK_MESSAGE_EN,
} from "../../rules/whatsapp.rules";

export type VoicePipelineInput = {
  mediaId: string;
  userId: string;
  preferredLanguage?: "ar" | "en";
};

export type VoicePipelineResult =
  | { success: true; text: string }
  | { success: false; fallbackMessage: string; assistantContextText: string };

/**
 * Placeholder: integrate with transcription service (AssemblyAI or similar).
 * Returns fallback when transcription not available.
 */
export async function processVoicePipeline(
  input: VoicePipelineInput,
): Promise<VoicePipelineResult> {
  // TODO(voicePipeline): Replace with transformVoiceToText(mediaId) when services/transcription exists.
  // For now, return fallback so structure is in place.
  const isEnglish = input.preferredLanguage === "en";
  const fallback = isEnglish ? VOICE_FALLBACK_MESSAGE_EN : VOICE_FALLBACK_MESSAGE_AR;
  const assistantContextText = isEnglish
    ? "[System] The user sent a voice note but transcription is unavailable. Ask for a short typed summary and continue helping."
    : "[System] أرسل المستخدم ملاحظة صوتية لكن خدمة التفريغ غير متاحة. اطلب منه كتابة ملخص قصير ثم واصل المساعدة.";
  return {
    success: false,
    fallbackMessage: fallback,
    assistantContextText,
  };
}
