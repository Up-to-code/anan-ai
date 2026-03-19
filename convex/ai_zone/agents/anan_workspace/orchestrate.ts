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
    onStageEvent,
    onTextDelta,
    onStreamCancelledCheck,
  } = input;

  const emitStage = async (
    phase: OrchestrateInput["onStageEvent"] extends (...args: infer A) => any
      ? A[0]["phase"]
      : never,
    extra: Record<string, unknown> = {},
  ) => {
    if (!onStageEvent) return;
    await onStageEvent({
      phase: phase as any,
      timestamp: Date.now(),
      ...extra,
    });
  };

  if (!getAgentLLMConfigSafe("anan_workspace")) {
    return {
      ok: false,
      output:
        "تعذر تشغيل anan workspace حالياً لأن مفتاح النموذج غير مضبوط في Convex. أضف `OPENROUTER_WORKSPACE_API_KEY` من Convex Dashboard ثم أعد المحاولة.",
      structured: { questions: [] },
      agentsDispatched: [],
      agentResults: [],
      totalTokenUsage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  const availableTeams = getAvailableTeams(role);

  await emitStage("intent_started", { status: "running" });
  const selectedTeams = await analyzeWorkspaceIntent(
    ctx,
    prompt,
    availableTeams,
    modelOverride,
  );
  await emitStage("intent_done", {
    status: "completed",
    details: { selectedTeams },
  });

  const agents = getTeamAgents(selectedTeams);
  const selectedTeamDefinitions = getTeamDefinitions(selectedTeams);

  if (agents.length === 0) {
    return {
      ok: false,
      output: FALLBACK_MESSAGES.orchestratorFailure,
      structured: { questions: [] },
      agentsDispatched: [],
      agentResults: [],
      totalTokenUsage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  const context = ragContext
    ? `[RAG Context]\n${ragContext}\n[User ID: ${userId}]`
    : `[User ID: ${userId}]`;

  const settled = await Promise.allSettled(
    agents.map(async (agent) => {
      const teamId = agent.definition?.team ?? "unknown_team";
      const agentName = agent.definition?.name ?? "unknown_agent";
      await emitStage("team_started", {
        status: "running",
        teamId,
        agentName,
      });
      try {
        const result = await agent.run(ctx, {
          prompt,
          context,
          userId,
          orchestratorId: "anan_workspace",
          threadId,
          channel,
          role,
        });
        await emitStage("team_done", {
          status: result.ok ? "completed" : "failed",
          teamId,
          agentName,
        });
        return result;
      } catch (error) {
        await emitStage("team_done", {
          status: "failed",
          teamId,
          agentName,
          details: {
            error: error instanceof Error ? error.message : "TEAM_EXECUTION_FAILED",
          },
        });
        throw error;
      }
    }),
  );

  const { agentResults, successOutputs, totalInput, totalOutput, hasFailures } =
    collectResults(settled);

  await emitStage("merge_started", { status: "running" });
  const merged = await mergeResults({
    ctx,
    prompt,
    successOutputs,
    hasFailures,
    modelOverride,
    onTextDelta,
    onStreamCancelledCheck,
  });
  await emitStage("merge_done", {
    status: merged.cancelled ? "failed" : "completed",
    details: {
      hasFailures,
      outputLength: merged.text.length,
      cancelled: merged.cancelled ?? false,
    },
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
    cancelled: merged.cancelled,
    structured: merged.structured,
    agentsDispatched: agents.map((a) => a.definition?.name ?? "unknown_agent"),
    agentResults,
    totalTokenUsage: {
      inputTokens: totalInput + merged.mergeTokens.inputTokens,
      outputTokens: totalOutput + merged.mergeTokens.outputTokens,
    },
  };
}
// @ts-nocheck
