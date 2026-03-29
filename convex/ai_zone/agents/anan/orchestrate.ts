/**
 * orchestrate.ts — Main Orchestration Logic
 *
 * WHY:   This is THE function that makes the entire multi-agent system work.
 *        It's the brain that decides, delegates, and merges.
 * WHAT:  Receives a user message → analyzes intent → dispatches agents →
 *        collects results → merges into a final response.
 * HOW:
 *   1. Determine available teams based on user role
 *   2. Analyze intent to select relevant teams
 *   3. Gather agents from selected teams
 *   4. Run all agents in parallel (Promise.allSettled)
 *   5. Merge successful outputs, note failures
 *   6. Fire anan_trainer in background (non-blocking)
 *   7. Return merged response with metadata
 *
 * LIFECYCLE:
 *   User message → assistant.ts → assistantService.ts → orchestrate()
 *   → intent analysis → team dispatch → parallel agents → merge → response
 *
 * TO EDIT:
 * - To change dispatch logic: Edit this file
 * - To change intent detection: Edit intentAnalyzer.ts
 * - To change result merging: Edit resultMerger.ts
 * - To add teams/agents: Edit teamRegistry.ts
 */

import { FALLBACK_MESSAGES } from "../shared/errorHandler";
import { internal } from "../../../_generated/api";
import type { OrchestrateInput, OrchestrateOutput } from "./types";
import { getAvailableTeams, getTeamAgents, getTeamDefinitions } from "./teamRegistry";
import { agentFactory } from "../core";
import { ananTrainerDefinition } from "../team_trainer/anan_trainer/config";
import { analyzeIntent } from "./intentAnalyzer";
import { mergeResults, collectResults } from "./resultMerger";
import { getAgentLLMConfigSafe } from "../config";

/**
 * orchestrate — The main entry point for the Anan multi-agent system.
 *
 * WHY:   This is the single function that turns a user message into a
 *        multi-agent response. Everything flows through here.
 * WHAT:  Intent → teams → agents → parallel execution → merge → response.
 * HOW:   See the 7-step lifecycle above.
 *
 * @param input - The orchestration input (prompt, role, userId, etc.)
 * @returns OrchestrateOutput with merged response and metadata
 *
 * @example
 * const result = await orchestrate({
 *   prompt: "ابحث عن شقة في الرياض بـ 800 ألف",
 *   role: "user",
 *   userId: "user_123",
 * });
 */
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
        promptBudgetMeta,
    } = input;

    if (!getAgentLLMConfigSafe("anan")) {
        return {
            ok: false,
            output:
                "تعذر تشغيل anan حالياً لأن مفتاح النموذج غير مضبوط في Convex. أضف `OPENROUTER_API_KEY` من Convex Dashboard ثم أعد المحاولة.",
            agentsDispatched: [],
            agentResults: [],
            totalTokenUsage: { inputTokens: 0, outputTokens: 0 },
        };
    }

    // 1. Get available teams for this role
    const availableTeams = getAvailableTeams(role);

    // 2. Analyze intent to select teams
    const selectedTeams = await analyzeIntent(
        ctx,
        prompt,
        availableTeams,
        modelOverride,
        "anan",
    );

    // 3. Gather agents from selected teams
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

    // 4. Run all agents in parallel
    const context = ragContext
        ? `[RAG Context]\n${ragContext}\n[User ID: ${userId}]`
        : `[User ID: ${userId}]`;

    const settled = await Promise.allSettled(
        agents.map((agent) =>
            agent.run(ctx, {
                prompt,
                context,
                userId,
                orchestratorId: "anan",
                threadId,
                channel,
                role,
            }),
        ),
    );

    // 5. Collect and merge results
    const { agentResults, successOutputs, totalInput, totalOutput, hasFailures } =
        collectResults(settled);

    const merged = await mergeResults({
        ctx,
        prompt,
        successOutputs,
        hasFailures,
        modelOverride,
        orchestratorId: "anan",
    });

    // 6. Fire trainer in background (non-blocking, errors silently caught)
    if (role !== "user") {
        agentFactory
            .create(ananTrainerDefinition)
            .run(ctx, {
                prompt: `Analyze this conversation for learnable facts:\nUser (${role}): ${prompt}\nResponse: ${merged.text}`,
                context: `Role: ${role}\nUser ID: ${userId}`,
                userId,
                orchestratorId: "anan",
                threadId,
                channel,
                role,
            })
            .catch((err) =>
                console.warn("[anan] Trainer failed (non-critical):", err),
            );
    }

    try {
        await ctx.runMutation(
            internal.ai_zone.agents.shared.orchestrationTrackerActions.trackOrchestrationUsageInternal as any,
            {
                orchestratorName: "anan_orchestrator",
                role,
                channel,
                userId,
                threadId,
                agentsDispatched: agents.map((a) => a.definition.name),
                successfulAgents: agentResults.filter((result) => result.ok).map((result) => result.agentName),
                failedAgents: agentResults.filter((result) => !result.ok).map((result) => result.agentName),
                totalInputTokens: totalInput + merged.mergeTokens.inputTokens,
                totalOutputTokens: totalOutput + merged.mergeTokens.outputTokens,
                contextTokens: promptBudgetMeta?.contextTokens,
                memoryTokens: promptBudgetMeta?.memoryTokens,
                ragTokens: promptBudgetMeta?.ragTokens,
                historyTokens: promptBudgetMeta?.historyTokens,
                cacheHit: promptBudgetMeta?.cacheHit,
            },
        );
    } catch (error) {
        console.warn("[anan] Orchestration analytics failed (non-critical):", error);
    }

    // 7. Return final response
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
