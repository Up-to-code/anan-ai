/**
 * Agent LLM config for anan-ai. OpenRouter only (MVP).
 */
import type { OrchestratorId } from "./types";

const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash";
const DEFAULT_OPENROUTER_WORKSPACE_MODEL = "google/gemini-2.5-flash";

export function getAgentLLMConfig(
  orchestratorId: OrchestratorId = "anan",
): { mode: "openrouter"; model: string; apiKey: string } {
  if (orchestratorId === "anan_workspace") {
    const apiKey = process.env.OPENROUTER_WORKSPACE_API_KEY?.trim();
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_WORKSPACE_API_KEY must be set in Convex Dashboard (Settings → Environment Variables)",
      );
    }
    return {
      mode: "openrouter",
      model: process.env.OPENROUTER_WORKSPACE_MODEL?.trim() || DEFAULT_OPENROUTER_WORKSPACE_MODEL,
      apiKey,
    };
  }

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

export function getAgentLLMConfigSafe(
  orchestratorId: OrchestratorId = "anan",
): { mode: string; model: string } | null {
  try {
    const config = getAgentLLMConfig(orchestratorId);
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
