"use node";

import { generateText } from "ai";
import type { ActionCtx } from "../../_generated/server";
import { components } from "../../_generated/api";
import { LLMCache } from "@mzedstudio/llm-cache";

type GenerateTextOptions = Parameters<typeof generateText>[0];
type GenerateTextResult = Awaited<ReturnType<typeof generateText>>;
type GenerateTextUsage = GenerateTextResult["usage"];
type CacheRequest = ReturnType<typeof buildCacheRequest>;
type CachedGenerateTextConfig = {
  modelName: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  pin?: boolean;
  modelVersion?: string;
  bypass?: boolean;
};

type CachedGenerateTextResponse = {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    inputTokens?: number;
    outputTokens?: number;
    reasoningTokens?: number;
    cachedInputTokens?: number;
  };
};

const llmCache = new LLMCache(components.llmCache);

function buildCacheRequest(options: GenerateTextOptions, modelName: string) {
  const toolNames = options.tools ? Object.keys(options.tools) : undefined;
  return {
    model: modelName,
    prompt: "prompt" in options ? options.prompt : undefined,
    messages: "messages" in options ? options.messages : undefined,
    system: "system" in options ? (options as { system?: string }).system : undefined,
    temperature: "temperature" in options ? options.temperature : undefined,
    maxTokens: "maxTokens" in options ? (options as { maxTokens?: number }).maxTokens : undefined,
    maxSteps: "maxSteps" in options ? (options as { maxSteps?: number }).maxSteps : undefined,
    topP: "topP" in options ? (options as { topP?: number }).topP : undefined,
    frequencyPenalty: "frequencyPenalty" in options ? (options as { frequencyPenalty?: number }).frequencyPenalty : undefined,
    presencePenalty: "presencePenalty" in options ? (options as { presencePenalty?: number }).presencePenalty : undefined,
    stop: "stop" in options ? (options as { stop?: string | string[] }).stop : undefined,
    toolChoice: "toolChoice" in options ? (options as { toolChoice?: unknown }).toolChoice : undefined,
    toolNames,
  };
}

function toFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeUsage(usage: unknown): CachedGenerateTextResponse["usage"] | undefined {
  if (!usage || typeof usage !== "object") return undefined;
  const record = usage as Record<string, unknown>;
  const promptTokens = toFiniteNumber(record.promptTokens) ?? toFiniteNumber(record.inputTokens);
  const completionTokens =
    toFiniteNumber(record.completionTokens) ?? toFiniteNumber(record.outputTokens);
  const totalTokens = toFiniteNumber(record.totalTokens);
  const reasoningTokens = toFiniteNumber(record.reasoningTokens);
  const cachedInputTokens = toFiniteNumber(record.cachedInputTokens);
  const normalized: CachedGenerateTextResponse["usage"] = {
    promptTokens,
    completionTokens,
    totalTokens,
    inputTokens: promptTokens,
    outputTokens: completionTokens,
    reasoningTokens,
    cachedInputTokens,
  };
  return Object.values(normalized).some((value) => value !== undefined) ? normalized : undefined;
}

function toCachedResponse(value: unknown): CachedGenerateTextResponse | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.text !== "string") return null;
  const usage = normalizeUsage(record.usage);
  return usage ? { text: record.text, usage } : { text: record.text };
}

function toGenerateTextResultFromCache(cachedResponse: unknown): GenerateTextResult | null {
  const normalized = toCachedResponse(cachedResponse);
  if (!normalized) return null;
  return {
    text: normalized.text,
    usage: normalized.usage as GenerateTextUsage,
  } as GenerateTextResult;
}

async function lookupCachedResult(
  ctx: ActionCtx,
  request: CacheRequest,
  modelVersion?: string,
): Promise<GenerateTextResult | null> {
  try {
    const cached = await llmCache.lookup(ctx, { request, modelVersion });
    if (!cached?.response) return null;
    const parsed = toGenerateTextResultFromCache(cached.response);
    if (parsed) return parsed;
    console.warn("[llmCache] Ignoring malformed cached response and regenerating");
  } catch (error) {
    console.warn("[llmCache] Cache lookup failed, regenerating:", error);
  }
  return null;
}

async function storeCachedResult(
  ctx: ActionCtx,
  request: CacheRequest,
  cache: CachedGenerateTextConfig,
  response: CachedGenerateTextResponse,
) {
  try {
    await llmCache.store(ctx, {
      request,
      response,
      tags: cache.tags,
      metadata: cache.metadata,
      pin: cache.pin,
      modelVersion: cache.modelVersion,
    });
  } catch (error) {
    console.warn("[llmCache] Cache store failed (non-critical):", error);
  }
}

export async function cachedGenerateText(
  ctx: ActionCtx,
  options: GenerateTextOptions,
  cache: CachedGenerateTextConfig,
): Promise<GenerateTextResult> {
  const request = buildCacheRequest(options, cache.modelName);
  if (!cache.bypass) {
    const cachedResult = await lookupCachedResult(ctx, request, cache.modelVersion);
    if (cachedResult) return cachedResult;
  }

  const response = await generateText(options);
  const safeResponse = toCachedResponse(response);
  if (safeResponse) {
    await storeCachedResult(ctx, request, cache, safeResponse);
  } else {
    console.warn("[llmCache] Skipping cache store due to unsupported response shape");
  }
  return response;
}
