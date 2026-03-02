/**
 * Error handling, retry strategy, fallback messages.
 * Plan: Keep logger + utilities in lib/core together.
 */

export const AGENT_FALLBACK_MESSAGE_AR =
  "عذراً، واجهت مشكلة تقنية. نطور الخدمة ونصلح الأمور. جرّب مرة ثانية. 🙏";

export const AGENT_FALLBACK_MESSAGE_EN =
  "Sorry, I ran into an issue. We're improving things for you. Please try again. 🙏";

export const VOICE_FALLBACK_MESSAGE_AR =
  "عذراً، لم نستطع تحويل الصوت إلى نص. جرّب كتابة رسالتك.";

export const VOICE_FALLBACK_MESSAGE_EN =
  "Sorry, we couldn't transcribe your voice. Please type your message instead.";

export function getLocalizedFallbackMessage(preferredLanguage?: "ar" | "en"): string {
  return preferredLanguage === "en" ? AGENT_FALLBACK_MESSAGE_EN : AGENT_FALLBACK_MESSAGE_AR;
}

export function getVoiceFallbackMessage(preferredLanguage?: "ar" | "en"): string {
  return preferredLanguage === "en" ? VOICE_FALLBACK_MESSAGE_EN : VOICE_FALLBACK_MESSAGE_AR;
}

/** Retry configuration. */
export type RetryConfig = {
  maxAttempts: number;
  initialBackoffMs: number;
  base: number;
};

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialBackoffMs: 250,
  base: 2,
};

export function shouldRetry(error: unknown, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) return false;
  const message = error instanceof Error ? error.message : String(error);
  const retryable = /\b(503|429|timeout|ECONNRESET|rate limit)\b/i.test(message);
  return retryable;
}

export function getBackoffMs(attempt: number, config: RetryConfig): number {
  return config.initialBackoffMs * Math.pow(config.base, attempt);
}

export function errorHandler(
  error: unknown,
  context: string,
): { message: string; code?: string } {
  const msg = error instanceof Error ? error.message : String(error);
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : undefined;
  console.error(`[${context}]`, error);
  return { message: msg, code };
}
