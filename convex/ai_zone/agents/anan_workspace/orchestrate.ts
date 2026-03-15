// @ts-nocheck
/**
 * orchestrate.ts — Workspace Orchestration Logic
 *
 * WHY:   Partner workflows need a separate orchestration runtime to isolate
 *        operational traffic from public user flows.
 * WHAT:  Receives a user message → analyzes intent → dispatches workspace agents → merges results.
 */

import { FALLBACK_MESSAGES } from "../shared/errorHandler";
import { internal } from "../../../_generated/api";
import type { OrchestrateInput, OrchestrateOutput } from "./types";
import { getAvailableTeams, getTeamAgents, getTeamDefinitions } from "./teamRegistry";
import { analyzeWorkspaceIntent } from "./intentAnalyzer";
import { mergeResults, collectResults } from "./resultMerger";
import { getAgentLLMConfigSafe } from "../config";

export async function orchestrate(
  input: OrchestrateInput,
): Promise<OrchestrateOutput> {
  const {
    ctx,
    prompt,
    role,
    userId,
    threadId,
    ragContext,
    modelOverride,
    channel,
  } = input;

  if (!getAgentLLMConfigSafe("anan_workspace")) {
    return {
      ok: false,
      output:
        "تعذر تشغيل anan workspace حالياً لأن مفتاح النموذج غير مضبوط في Convex. أضف `OPENROUTER_WORKSPACE_API_KEY` من Convex Dashboard ثم أعد المحاولة.",
      agentsDispatched: [],
      agentResults: [],
      totalTokenUsage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  const availableTeams = getAvailableTeams(role);

  const selectedTeams = await analyzeWorkspaceIntent(
    ctx,
    prompt,
    availableTeams,
    modelOverride,
  );

  const agents = getTeamAgents(selectedTeams);
  const selectedTeamDefinitions = getTeamDefinitions(selectedTeams);

  if (agents.length === 0) {
    return {
      ok: false,
      output: FALLBACK_MESSAGES.orchestratorFailure,
      agentsDispatched: [],
      agentResults: [],
      totalTokenUsage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  const context = ragContext
    ? `[RAG Context]\n${ragContext}\n[User ID: ${userId}]`
    : `[User ID: ${userId}]`;

  const settled = await Promise.allSettled(
    agents.map((agent) =>
      agent.run(ctx, {
        prompt,
        context,
        userId,
        orchestratorId: "anan_workspace",
        threadId,
        channel,
        role,
      }),
    ),
  );

  const { agentResults, successOutputs, totalInput, totalOutput, hasFailures } =
    collectResults(settled);

  const merged = await mergeResults({
    ctx,
    prompt,
    successOutputs,
    hasFailures,
    modelOverride,
  });

  try {
    await ctx.runMutation(
      (internal as any).ai_zone.agents.shared.orchestrationTrackerActions
        .trackOrchestrationUsageInternal,
      {
        orchestratorName: "anan_workspace_orchestrator",
        role,
        channel,
        userId,
        threadId,
        agentsDispatched: agents.map((a) => a.definition.name),
        successfulAgents: agentResults.filter((result) => result.ok).map((result) => result.agentName),
        failedAgents: agentResults.filter((result) => !result.ok).map((result) => result.agentName),
        totalInputTokens: totalInput + merged.mergeTokens.inputTokens,
        totalOutputTokens: totalOutput + merged.mergeTokens.outputTokens,
      },
    );
  } catch (error) {
    console.warn("[anan_workspace] Orchestration analytics failed (non-critical):", error);
  }

  return {
    ok: successOutputs.length > 0,
    output: merged.text,
    agentsDispatched: agents.map((a) => a.definition?.name ?? "unknown_agent"),
    agentResults,
    totalTokenUsage: {
      inputTokens: totalInput + merged.mergeTokens.inputTokens,
      outputTokens: totalOutput + merged.mergeTokens.outputTokens,
    },
  };
}
// @ts-nocheck
