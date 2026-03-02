/**
 * LLM providers for anan-lit agent. OpenRouter via @openrouter/ai-sdk-provider.
 */
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { EmbeddingModelV2 } from "@ai-sdk/provider";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { getAgentLLMConfig } from "../../ai_zone/agents/config";

const OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";

export function getChatModel(modelOverride?: string): LanguageModelV2 {
  const config = getAgentLLMConfig();
  const selectedModel = modelOverride?.trim() || config.model;
  const openrouter = createOpenRouter({ apiKey: config.apiKey });
  return openrouter.chat(selectedModel as `${string}/${string}`);
}

export function getEmbeddingModel(): EmbeddingModelV2<string> {
  const config = getAgentLLMConfig();
  const openrouter = createOpenRouter({ apiKey: config.apiKey });
  const model =
    (process.env as { OPENROUTER_EMBEDDING_MODEL?: string }).OPENROUTER_EMBEDDING_MODEL ??
    OPENROUTER_EMBEDDING_MODEL;
  return openrouter.textEmbeddingModel(model as `${string}/${string}`);
}
