/**
 * resultMerger.ts — Workspace Result Merging
 *
 * WHY:   Partner responses should be merged into one operational reply.
 * WHAT:  Merges multiple agent outputs into a single response.
 * HOW:   Uses an LLM merge prompt and falls back to concatenation.
 */

import type { ActionCtx } from "../../../_generated/server";
import { getChatModel } from "../../../shared_logic/lib/providers";
import { cachedGenerateText } from "../../../shared_logic/llmCache";
import { FALLBACK_MESSAGES } from "../shared/errorHandler";
import type { AnanAgentResult } from "../AnanAgent";
import { getAgentLLMConfigSafe } from "../config";

export interface MergeInput {
  ctx: ActionCtx;
  prompt: string;
  successOutputs: string[];
  hasFailures: boolean;
  modelOverride?: string;
}

export interface MergeResult {
  text: string;
  mergeTokens: { inputTokens: number; outputTokens: number };
}

export async function mergeResults(input: MergeInput): Promise<MergeResult> {
  const { ctx, prompt, successOutputs, hasFailures, modelOverride } = input;

  if (successOutputs.length === 0) {
    return {
      text: FALLBACK_MESSAGES.totalFailure,
      mergeTokens: { inputTokens: 0, outputTokens: 0 },
    };
  }

  if (successOutputs.length === 1) {
    return {
      text: successOutputs[0].replace(/^\[anan_\w+\]\n/, ""),
      mergeTokens: { inputTokens: 0, outputTokens: 0 },
    };
  }

  try {
    const model = getChatModel(modelOverride, "anan_workspace");
    const modelName =
      modelOverride ?? getAgentLLMConfigSafe("anan_workspace")?.model ?? "unknown";

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
        tags: ["merge", "anan_workspace_orchestrator"],
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
        successOutputs.push(`[${result.value.agentName}]\n${result.value.output}`);
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
