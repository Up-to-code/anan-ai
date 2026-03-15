/**
 * LLM providers for anan-ai agent. OpenRouter via @openrouter/ai-sdk-provider.
 */
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { EmbeddingModelV2 } from "@ai-sdk/provider";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { getAgentLLMConfig } from "../../ai_zone/agents/config";
import type { OrchestratorId } from "../../ai_zone/agents/types";

const OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export function getChatModel(
  modelOverride?: string,
  orchestratorId: OrchestratorId = "anan",
): LanguageModelV2 {
  const config = getAgentLLMConfig(orchestratorId);
  const selectedModel = modelOverride?.trim() || config.model;
  const openrouter = createOpenRouter({ apiKey: config.apiKey });
  return openrouter.chat(selectedModel as `${string}/${string}`);
}

export function getEmbeddingModel(
  orchestratorId: OrchestratorId = "anan",
): EmbeddingModelV2<string> {
  const config = getAgentLLMConfig(orchestratorId);
  const openrouter = createOpenRouter({ apiKey: config.apiKey });
  const model =
    (process.env as { OPENROUTER_EMBEDDING_MODEL?: string }).OPENROUTER_EMBEDDING_MODEL ??
    OPENROUTER_EMBEDDING_MODEL;
  return openrouter.textEmbeddingModel(model as `${string}/${string}`);
}
