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
    const { ctx, prompt, successOutputs, hasFailures, modelOverride } = input;
    const orchestratorId = input.orchestratorId ?? "anan";

    // Case 1: No successful outputs
    if (successOutputs.length === 0) {
        return {
            text: FALLBACK_MESSAGES.totalFailure,
            mergeTokens: { inputTokens: 0, outputTokens: 0 },
        };
    }

    // Case 2: Single output — use directly (strip agent name prefix)
    if (successOutputs.length === 1) {
        return {
            text: successOutputs[0].replace(/^\[anan_\w+\]\n/, ""),
            mergeTokens: { inputTokens: 0, outputTokens: 0 },
        };
    }

    // Case 3: Multiple outputs — merge with LLM
    try {
        const model = getChatModel(modelOverride, orchestratorId);
        const modelName =
            modelOverride ?? getAgentLLMConfigSafe(orchestratorId)?.model ?? "unknown";
        const mergeResult = await cachedGenerateText(
            ctx,
            {
                model: model as any,
                prompt: `You are merging results from multiple AI agents into one coherent Arabic response.
User's original question: "${prompt}"

Agent outputs:
${successOutputs.join("\n\n---\n\n")}

Merge these into a single, natural Arabic response. Do not mention the agents.
${hasFailures ? `Note: ${FALLBACK_MESSAGES.partialFailure}` : ""}`,
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
                    outputsCount: successOutputs.length,
                    hasFailures,
                },
            },
        );

        const usage = mergeResult.usage as any;
        return {
            text: mergeResult.text,
            mergeTokens: {
                inputTokens: usage?.promptTokens ?? usage?.inputTokens ?? 0,
                outputTokens: usage?.completionTokens ?? usage?.outputTokens ?? 0,
            },
        };
    } catch {
        // Case 4: Merge failed — concatenate as fallback
        let text = successOutputs
            .map((o) => o.replace(/^\[anan_\w+\]\n/, ""))
            .join("\n\n");
        if (hasFailures) text += `\n\n${FALLBACK_MESSAGES.partialFailure}`;
        return {
            text,
            mergeTokens: { inputTokens: 0, outputTokens: 0 },
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
    const agentResults: AnanAgentResult[] = [];
    const successOutputs: string[] = [];
    let totalInput = 0;
    let totalOutput = 0;
    let hasFailures = false;

    for (const result of settled) {
        if (result.status === "fulfilled") {
            agentResults.push(result.value);
            if (result.value.ok && result.value.output) {
                successOutputs.push(
                    `[${result.value.agentName}]\n${result.value.output}`,
                );
            } else {
                hasFailures = true;
            }
            totalInput += result.value.tokenUsage.inputTokens;
            totalOutput += result.value.tokenUsage.outputTokens;
        } else {
            hasFailures = true;
        }
    }

    return { agentResults, successOutputs, totalInput, totalOutput, hasFailures };
}
