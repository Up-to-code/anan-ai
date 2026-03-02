/**
 * WhatsApp channel rules – message limits, fallbacks, response modes.
 */
export const WHATSAPP_SEND_GAP_MS = 200;
export const MAX_NORMAL_MESSAGES_PER_TURN = 3;
export const MAX_SEND_ATTEMPTS = 3;
export const WA_SILENT_RETRY_MAX_ATTEMPTS = 2;
export const WA_SILENT_RETRY_MAX_BUDGET_MS = 4000;
export const WA_LINE_MAX_CHARS = 380;
export const WA_MAX_LINES = 10;

export const VOICE_FALLBACK_MESSAGE_AR =
  "وصلتني الملاحظة الصوتية لكن ما قدرت أفهمها بالكامل. أرسلها مرة ثانية بشكل أقصر أو اكتب المطلوب.";

export const VOICE_FALLBACK_MESSAGE_EN =
  "Sorry, we couldn't transcribe your voice. Please try again or type your message.";
