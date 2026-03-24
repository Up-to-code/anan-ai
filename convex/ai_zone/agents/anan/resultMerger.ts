/**
 * resultMerger.ts — Multi-Agent Result Merging
 *
 * WHY:   When multiple agents return results, we need to combine them into
 *        one coherent response. We can't just concatenate — we need an LLM
 *        to merge them naturally.
 * WHAT:  Takes an array of agent outputs and merges them via LLM call.
 * HOW:   If single output → return directly. If multiple → LLM merge.
 *        If merge LLM call fails → fallback to concatenation.
 *
 * TO EDIT:
 * - To change merge style: Edit the merge prompt below
 * - To change fallback behavior: Edit the catch block
 */

import type { ActionCtx } from "../../../_generated/server";
import { getChatModel } from "../../../shared_logic/lib/providers";
import { cachedGenerateText } from "../../../shared_logic/llmCache";
import { FALLBACK_MESSAGES } from "../shared/errorHandler";
import type { AnanAgentResult } from "../AnanAgent";
import { getAgentLLMConfigSafe } from "../config";
import type { OrchestratorId } from "../types";

/**
 * MergeInput — What the merger needs to produce a final response.
 */
export interface MergeInput {
    /** Convex action context (required for cached LLM calls) */
    ctx: ActionCtx;
    /** The user's original message (for context) */
    prompt: string;
    /** Successful agent outputs with agent names */
    successOutputs: string[];
    /** Whether any agents failed (adds partial failure note) */
    hasFailures: boolean;
    /** Optional model override for the merge LLM call */
    modelOverride?: string;
    /** Which orchestrator is running the merge */
    orchestratorId?: OrchestratorId;
}

/**
 * MergeResult — The merged response plus any token usage from the merge call.
 */
export interface MergeResult {
    /** The final merged text */
    text: string;
    /** Token usage from the merge LLM call (0 if no LLM call needed) */
    mergeTokens: { inputTokens: number; outputTokens: number };
}

const ZERO_TOKENS = { inputTokens: 0, outputTokens: 0 } as const;

function stripAgentPrefix(output: string) {
  return output.replace(/^\[anan_\w+\]\n/, "");
}

function buildMergePrompt(prompt: string, successOutputs: string[], hasFailures: boolean) {
  return `You are merging results from multiple AI agents into one coherent Arabic response.
User's original question: "${prompt}"

Agent outputs:
${successOutputs.join("\n\n---\n\n")}

Merge these into a single, natural Arabic response. Do not mention the agents.
${hasFailures ? `Note: ${FALLBACK_MESSAGES.partialFailure}` : ""}`;
}

function resolveMergeModel(orchestratorId: OrchestratorId, modelOverride?: string) {
  return {
    model: getChatModel(modelOverride, orchestratorId),
    modelName: modelOverride ?? getAgentLLMConfigSafe(orchestratorId)?.model ?? "unknown",
  };
}

function toMergeUsage(usage: any) {
  return {
    inputTokens: usage?.promptTokens ?? usage?.inputTokens ?? 0,
    outputTokens: usage?.completionTokens ?? usage?.outputTokens ?? 0,
  };
}

function buildFallbackMergedText(successOutputs: string[], hasFailures: boolean) {
  let text = successOutputs.map(stripAgentPrefix).join("\n\n");
  if (hasFailures) text += `\n\n${FALLBACK_MESSAGES.partialFailure}`;
  return text;
}

async function mergeWithLlm(input: MergeInput) {
  const orchestratorId = input.orchestratorId ?? "anan";
  const { model, modelName } = resolveMergeModel(orchestratorId, input.modelOverride);
  const mergeResult = await cachedGenerateText(
    input.ctx,
    {
      model: model as any,
      prompt: buildMergePrompt(input.prompt, input.successOutputs, input.hasFailures),
      temperature: 0.3,
    },
    {
      modelName,
      tags: [
        "merge",
        orchestratorId === "anan_workspace"
          ? "anan_workspace_orchestrator"
          : "anan_orchestrator",
      ],
      metadata: {
        outputsCount: input.successOutputs.length,
        hasFailures: input.hasFailures,
      },
    },
  );
  return {
    text: mergeResult.text,
    mergeTokens: toMergeUsage((mergeResult as any).usage),
  };
}

/**
 * mergeResults — Combines multiple agent outputs into one coherent response.
 *
 * WHY:   Users should see ONE natural response, not fragmented agent outputs.
 * WHAT:  Single output → pass through. Multiple → LLM merge. Failure → concat.
 * HOW:
 *   1. If no outputs → return total failure message
 *   2. If one output → strip agent prefix, return directly
 *   3. If many outputs → call LLM to merge into natural Arabic response
 *   4. If merge LLM fails → concatenate with separators
 *
 * @param input - The merge input (ctx, prompt, outputs, failure flag)
 * @returns MergeResult with final text and token usage
 */
export async function mergeResults(input: MergeInput): Promise<MergeResult> {
    if (input.successOutputs.length === 0) {
      return { text: FALLBACK_MESSAGES.totalFailure, mergeTokens: { ...ZERO_TOKENS } };
    }
    if (input.successOutputs.length === 1) {
      return { text: stripAgentPrefix(input.successOutputs[0]), mergeTokens: { ...ZERO_TOKENS } };
    }
    try {
      return await mergeWithLlm(input);
    } catch {
      return {
        text: buildFallbackMergedText(input.successOutputs, input.hasFailures),
        mergeTokens: { ...ZERO_TOKENS },
      };
    }
}

/**
 * collectResults — Processes Promise.allSettled results into structured data.
 *
 * WHY:   After parallel dispatch, we need to separate successes from failures
 *        and aggregate token usage.
 * WHAT:  Iterates settled promises → collects outputs, counts tokens, flags failures.
 *
 * @param settled - Results from Promise.allSettled
 * @returns Structured collection of results, outputs, totals, and failure flag
 */
export function collectResults(settled: PromiseSettledResult<AnanAgentResult>[]) {
    const aggregate = {
      agentResults: [] as AnanAgentResult[],
      successOutputs: [] as string[],
      totalInput: 0,
      totalOutput: 0,
      hasFailures: false,
    };
    for (const result of settled) {
      if (result.status !== "fulfilled") {
        aggregate.hasFailures = true;
        continue;
      }
      aggregate.agentResults.push(result.value);
      if (result.value.ok && result.value.output) {
        aggregate.successOutputs.push(`[${result.value.agentName}]\n${result.value.output}`);
      } else {
        aggregate.hasFailures = true;
      }
      aggregate.totalInput += result.value.tokenUsage.inputTokens;
      aggregate.totalOutput += result.value.tokenUsage.outputTokens;
    }
    return aggregate;
}
