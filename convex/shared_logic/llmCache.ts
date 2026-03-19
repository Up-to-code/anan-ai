import { generateText } from "ai";
import { v } from "convex/values";
import { LLMCache } from "@mzedstudio/llm-cache";
import type { ActionCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";
import { components } from "../_generated/api";
import { requireRole } from "../_core/security/accessPolicy";

type GenerateTextOptions = Parameters<typeof generateText>[0];
type GenerateTextResult = Awaited<ReturnType<typeof generateText>>;
type GenerateTextUsage = GenerateTextResult["usage"];

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

  const hasValue = Object.values(normalized).some((value) => value !== undefined);
  return hasValue ? normalized : undefined;
}

function toCachedResponse(value: unknown): CachedGenerateTextResponse | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.text !== "string") return null;

  const usage = normalizeUsage(record.usage);
  return usage ? { text: record.text, usage } : { text: record.text };
}

function toGenerateTextResultFromCache(
  cachedResponse: unknown,
): GenerateTextResult | null {
  const normalized = toCachedResponse(cachedResponse);
  if (!normalized) return null;
  return {
    text: normalized.text,
    usage: normalized.usage as GenerateTextUsage,
  } as GenerateTextResult;
}

/**
 * WHY:   LLM calls are expensive and repeated prompts should be cached automatically.
 * WHAT:  Runs `generateText` with an LLM cache lookup/store around it.
 * HOW:   Builds a normalized request object, checks cache, then stores the response on miss.
 */
export async function cachedGenerateText(
  ctx: ActionCtx,
  options: GenerateTextOptions,
  cache: {
    modelName: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    pin?: boolean;
    modelVersion?: string;
    bypass?: boolean;
  },
): Promise<GenerateTextResult> {
  const request = buildCacheRequest(options, cache.modelName);

  if (!cache.bypass) {
    try {
      const cached = await llmCache.lookup(ctx, { request, modelVersion: cache.modelVersion });
      if (cached?.response) {
        const parsed = toGenerateTextResultFromCache(cached.response);
        if (parsed) {
          return parsed;
        }
        console.warn("[llmCache] Ignoring malformed cached response and regenerating");
      }
    } catch (error) {
      console.warn("[llmCache] Cache lookup failed, regenerating:", error);
    }
  }

  const response = await generateText(options);
  const safeResponse = toCachedResponse(response);
  if (safeResponse) {
    try {
      await llmCache.store(ctx, {
        request,
        response: safeResponse,
        tags: cache.tags,
        metadata: cache.metadata,
        pin: cache.pin,
        modelVersion: cache.modelVersion,
      });
    } catch (error) {
      console.warn("[llmCache] Cache store failed (non-critical):", error);
    }
  } else {
    console.warn("[llmCache] Skipping cache store due to unsupported response shape");
  }

  return response;
}

/**
 * WHY:   Admin operators need visibility into current LLM cache tuning.
 * WHAT:  Returns the active cache configuration document.
 * HOW:   Enforces admin access then reads config from the cache component.
 */
export const getLlmCacheConfig = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return llmCache.getConfig(ctx);
  },
});

/**
 * WHY:   Cache tuning should be adjustable without code redeploys.
 * WHAT:  Updates the LLM cache configuration for TTLs, limits, and normalization.
 * HOW:   Enforces admin access then writes the config through the cache component.
 */
export const updateLlmCacheConfig = mutation({
  args: {
    config: v.object({
      defaultTtlMs: v.optional(v.number()),
      promotionTtlMs: v.optional(v.number()),
      ttlByModel: v.optional(v.record(v.string(), v.number())),
      ttlByTag: v.optional(v.record(v.string(), v.number())),
      normalizeRequests: v.optional(v.boolean()),
      maxEntries: v.optional(v.number()),
    }),
    replace: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return llmCache.setConfig(ctx, {
      config: args.config,
      replace: args.replace,
    });
  },
});

/**
 * WHY:   Ops dashboards need cache volume and hit-rate visibility.
 * WHAT:  Returns LLM cache statistics for admin viewing.
 * HOW:   Enforces admin access then reads stats from the cache component.
 */
export const getLlmCacheStats = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return llmCache.getStats(ctx);
  },
});
