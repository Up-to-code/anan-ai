/**
 * Agent LLM config for anan-ai. OpenRouter only (MVP).
 */
const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash";

export function getAgentLLMConfig(): { mode: "openrouter"; model: string; apiKey: string } {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY must be set in Convex Dashboard (Settings → Environment Variables)",
    );
  }
  return {
    mode: "openrouter",
    model: process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL,
    apiKey,
  };
}

export function getAgentLLMConfigSafe(): { mode: string; model: string } | null {
  try {
    const config = getAgentLLMConfig();
    return { mode: config.mode, model: config.model };
  } catch {
    return null;
  }
}

export function getLLMMaxRetries(): number {
  const raw = process.env.LLM_MAX_RETRIES;
  if (raw == null || raw === "") return 2;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 2;
}
