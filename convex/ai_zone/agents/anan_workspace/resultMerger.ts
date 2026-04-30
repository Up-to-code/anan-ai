/**
 * resultMerger.ts — Workspace Result Merging
 *
 * WHY:   Workspace responses should be merged into one operational reply.
 * WHAT:  Merges multiple agent outputs into a single response.
 * HOW:   Uses an LLM merge prompt and falls back to concatenation.
 */

import type { ActionCtx } from "../../../_generated/server";
import { streamText } from "ai";
import { getChatModel } from "../../../shared_logic/lib/providers";
import { cachedGenerateText } from "../../../shared_logic/integrations/llmCacheNode";
import { FALLBACK_MESSAGES } from "../shared/errorHandler";
import type { AnanAgentResult } from "../AnanAgent";
import { getAgentLLMConfigSafe } from "../config";
import type { WorkspaceProjectFieldKey, WorkspaceStructuredOutput } from "./types";

export interface MergeInput {
  ctx: ActionCtx;
  prompt: string;
  successOutputs: string[];
  hasFailures: boolean;
  modelOverride?: string;
  onTextDelta?: (delta: string) => void | Promise<void>;
  onStreamCancelledCheck?: () => boolean | Promise<boolean>;
}

export interface MergeResult {
  text: string;
  cancelled?: boolean;
  mergeTokens: { inputTokens: number; outputTokens: number };
  structured: WorkspaceStructuredOutput;
}

const PROJECT_FIELD_QUESTIONS: Record<WorkspaceProjectFieldKey, string> = {
  name: "ما اسم المشروع؟",
  city: "ما المدينة؟",
  district: "ما الحي أو المنطقة؟",
  price: "ما السعر المستهدف للمشروع؟",
  rooms: "كم عدد الغرف؟",
  bathrooms: "كم عدد الحمامات؟",
  description: "اكتب وصفاً مختصراً للمشروع.",
};

function stripAgentPrefix(output: string) {
  return output.replace(/^\[anan_\w+\]\n/, "");
}

function extractTokenUsage(usage: any) {
  return {
    inputTokens: usage?.promptTokens ?? usage?.inputTokens ?? 0,
    outputTokens: usage?.completionTokens ?? usage?.outputTokens ?? 0,
  };
}

function toStructuredMergeResult(
  prompt: string,
  text: string,
  tokenUsage: { inputTokens: number; outputTokens: number },
  cancelled?: boolean,
): MergeResult {
  return {
    text,
    cancelled,
    mergeTokens: tokenUsage,
    structured: buildStructuredOutput(prompt, text),
  };
}

function buildMergePrompt(prompt: string, successOutputs: string[], hasFailures: boolean) {
  return `You are merging results from multiple AI agents into one coherent Arabic response.
User's original question: "${prompt}"

Agent outputs:
${successOutputs.join("\n\n---\n\n")}

Merge these into a single, natural Arabic response. Do not mention the agents.
Match the response length to the task: short for direct retrieval or simple operational asks, fuller only when the user asks for analysis.
Prefer data-first Arabic output over decorative wording.
If the task is operational, put the result first, then the next action only if needed.
If the user is missing actionable information, ask concrete, short, non-redundant follow-up questions in Arabic.
Do not ask for data already provided by the user in the current turn.
${hasFailures ? `Note: ${FALLBACK_MESSAGES.partialFailure}` : ""}`;
}

async function streamMergedResult(
  model: any,
  prompt: string,
  mergePrompt: string,
  onTextDelta: (delta: string) => void | Promise<void>,
  onStreamCancelledCheck?: () => boolean | Promise<boolean>,
): Promise<MergeResult> {
  const streamed = streamText({ model, prompt: mergePrompt, temperature: 0.3 });
  let text = "";
  for await (const delta of streamed.textStream) {
    if (!delta) continue;
    if (onStreamCancelledCheck && await onStreamCancelledCheck()) {
      return toStructuredMergeResult(prompt, text, { inputTokens: 0, outputTokens: 0 }, true);
    }
    text += delta;
    await onTextDelta(delta);
  }
  const usage = await Promise.resolve((streamed as any).usage).catch(() => null);
  return toStructuredMergeResult(prompt, text, extractTokenUsage(usage));
}

async function generateMergedResult(
  ctx: ActionCtx,
  model: any,
  prompt: string,
  mergePrompt: string,
  modelName: string,
  successOutputs: string[],
  hasFailures: boolean,
): Promise<MergeResult> {
  const mergeResult = await cachedGenerateText(
    ctx,
    { model, prompt: mergePrompt, temperature: 0.3 },
    {
      modelName,
      tags: ["merge", "anan_workspace_orchestrator"],
      metadata: { outputsCount: successOutputs.length, hasFailures },
    },
  );
  return toStructuredMergeResult(prompt, mergeResult.text, extractTokenUsage(mergeResult.usage as any));
}

function buildFallbackMergedText(successOutputs: string[], hasFailures: boolean) {
  let text = successOutputs.map(stripAgentPrefix).join("\n\n");
  if (hasFailures) text += `\n\n${FALLBACK_MESSAGES.partialFailure}`;
  return text;
}

function extractQuestionsFromText(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim().replace(/^\d+[.)-]\s*/, ""))
    .filter(Boolean);

  const normalized = lines
    .filter((line) => line.includes("?") || line.includes("؟"))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .map((line) => (line.endsWith("?") || line.endsWith("؟") ? line : `${line}؟`));

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const question of normalized) {
    const key = question
      .replace(/[؟?]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(question);
    if (deduped.length >= 6) break;
  }

  return deduped;
}

function buildStructuredOutput(prompt: string, mergedText: string): WorkspaceStructuredOutput {
  const lowerPrompt = prompt.toLowerCase();
  const projectIntent =
    /(?:إنشاء|اضف|أضف|ابدأ|بناء).{0,12}(?:مشروع|عقار)/.test(prompt) ||
    lowerPrompt.includes("create project");

  const extractedQuestions = extractQuestionsFromText(mergedText);
  if (!projectIntent) {
    return { questions: extractedQuestions };
  }

  const requiredFields: WorkspaceProjectFieldKey[] = [
    "name",
    "city",
    "district",
    "price",
    "rooms",
    "bathrooms",
    "description",
  ];

  return {
    questions: extractedQuestions.length > 0
      ? extractedQuestions
      : requiredFields.slice(0, 3).map((field) => PROJECT_FIELD_QUESTIONS[field]),
    actionCandidate: {
      type: "create_project",
      fields: {},
      missingFields: requiredFields,
      state: "collecting",
    },
  };
}

export async function mergeResults(input: MergeInput): Promise<MergeResult> {
  const { ctx, prompt, successOutputs, hasFailures, modelOverride, onTextDelta, onStreamCancelledCheck } = input;
  if (successOutputs.length === 0) {
    return { text: FALLBACK_MESSAGES.totalFailure, mergeTokens: { inputTokens: 0, outputTokens: 0 }, structured: { questions: [] } };
  }
  if (successOutputs.length === 1) {
    const text = stripAgentPrefix(successOutputs[0]);
    if (onTextDelta && text) await onTextDelta(text);
    return toStructuredMergeResult(prompt, text, { inputTokens: 0, outputTokens: 0 });
  }
  try {
    const model = getChatModel(modelOverride, "anan_workspace");
    const modelName = modelOverride ?? getAgentLLMConfigSafe("anan_workspace")?.model ?? "unknown";
    const mergePrompt = buildMergePrompt(prompt, successOutputs, hasFailures);
    if (onTextDelta) return streamMergedResult(model as any, prompt, mergePrompt, onTextDelta, onStreamCancelledCheck);
    return generateMergedResult(ctx, model as any, prompt, mergePrompt, modelName, successOutputs, hasFailures);
  } catch {
    const text = buildFallbackMergedText(successOutputs, hasFailures);
    return toStructuredMergeResult(prompt, text, { inputTokens: 0, outputTokens: 0 });
  }
}

export function collectResults(settled: PromiseSettledResult<AnanAgentResult>[]) {
  const agentResults: AnanAgentResult[] = [];
  const successOutputs: string[] = [];
  let totalInput = 0;
  let totalOutput = 0;
  let hasFailures = false;

  for (const result of settled) {
    if (result.status !== "fulfilled") {
      hasFailures = true;
      continue;
    }
    const value = result.value;
    agentResults.push(value);
    totalInput += value.tokenUsage.inputTokens;
    totalOutput += value.tokenUsage.outputTokens;
    if (!(value.ok && value.output)) {
      hasFailures = true;
      continue;
    }
    successOutputs.push(`[${value.agentName}]\n${value.output}`);
  }

  return { agentResults, successOutputs, totalInput, totalOutput, hasFailures };
}
