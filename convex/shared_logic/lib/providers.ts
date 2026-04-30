/**
 * LLM providers for anan-ai agent. OpenRouter via @openrouter/ai-sdk-provider.
 */
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { EmbeddingModelV3 } from "@ai-sdk/provider";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import { resolveEmbeddingModelName } from "../../../packages/base-logic/src/providers";
import { getAgentLLMConfig } from "../../ai_zone/agents/config";
import type { OrchestratorId } from "../../ai_zone/agents/types";

export function getChatModel(
  modelOverride?: string,
  orchestratorId: OrchestratorId = "anan_workspace",
): LanguageModelV3 {
  const config = getAgentLLMConfig(orchestratorId);
  const selectedModel = modelOverride?.trim() || config.model;
  const openrouter = createOpenRouter({ apiKey: config.apiKey });
  return openrouter.chat(selectedModel as `${string}/${string}`);
}

export function getEmbeddingModel(
  orchestratorId: OrchestratorId = "anan_workspace",
): EmbeddingModelV3 {
  const config = getAgentLLMConfig(orchestratorId);
  const openrouter = createOpenRouter({ apiKey: config.apiKey });
  const model = resolveEmbeddingModelName(
    (process.env as { OPENROUTER_EMBEDDING_MODEL?: string }).OPENROUTER_EMBEDDING_MODEL,
  );
  return openrouter.textEmbeddingModel(model as `${string}/${string}`);
}
