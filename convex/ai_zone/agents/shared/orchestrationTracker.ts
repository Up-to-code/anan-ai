import type { MutationCtx } from "../../../_generated/server";

export interface TrackOrchestrationParams {
  orchestratorName: string;
  role: string;
  channel?: string;
  userId?: string;
  threadId?: string;
  agentsDispatched: string[];
  successfulAgents: string[];
  failedAgents: string[];
  totalInputTokens: number;
  totalOutputTokens: number;
  contextTokens?: number;
  memoryTokens?: number;
  ragTokens?: number;
  historyTokens?: number;
  cacheHit?: boolean;
}

/**
 * WHY:   Agent-level token rows do not show how an entire request was orchestrated.
 * WHAT:  Records one aggregate orchestration row per assistant request.
 * HOW:   Inserts a summary row with dispatched agents and aggregate token counts.
 */
export async function trackOrchestrationUsage(
  ctx: MutationCtx,
  params: TrackOrchestrationParams,
) {
  await ctx.db.insert("aiOrchestrationUsage", {
    orchestratorName: params.orchestratorName,
    role: params.role,
    channel: params.channel,
    userId: params.userId,
    threadId: params.threadId,
    agentsDispatched: params.agentsDispatched,
    successfulAgents: params.successfulAgents,
    failedAgents: params.failedAgents,
    totalInputTokens: params.totalInputTokens,
    totalOutputTokens: params.totalOutputTokens,
    totalTokens: params.totalInputTokens + params.totalOutputTokens,
    contextTokens: params.contextTokens,
    memoryTokens: params.memoryTokens,
    ragTokens: params.ragTokens,
    historyTokens: params.historyTokens,
    cacheHit: params.cacheHit,
    createdAt: Date.now(),
  });
}
