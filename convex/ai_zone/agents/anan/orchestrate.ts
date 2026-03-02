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
import type { OrchestrateInput, OrchestrateOutput } from "./types";
import { getAvailableTeams, getTeamAgents, ananTrainer } from "./teamRegistry";
import { analyzeIntent } from "./intentAnalyzer";
import { mergeResults, collectResults } from "./resultMerger";

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
    const { prompt, role, userId, ragContext, modelOverride } = input;

    // 1. Get available teams for this role
    const availableTeams = getAvailableTeams(role);

    // 2. Analyze intent to select teams
    const selectedTeams = await analyzeIntent(
        prompt,
        availableTeams,
        modelOverride,
    );

    // 3. Gather agents from selected teams
    const agents = getTeamAgents(selectedTeams);

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
        agents.map((agent) => agent.run(prompt, context)),
    );

    // 5. Collect and merge results
    const { agentResults, successOutputs, totalInput, totalOutput, hasFailures } =
        collectResults(settled);

    const merged = await mergeResults({
        prompt,
        successOutputs,
        hasFailures,
        modelOverride,
    });

    // 6. Fire trainer in background (non-blocking, errors silently caught)
    if (role !== "user") {
        ananTrainer
            .run(
                `Analyze this conversation for learnable facts:\nUser (${role}): ${prompt}\nResponse: ${merged.text}`,
            )
            .catch((err) =>
                console.warn("[anan] Trainer failed (non-critical):", err),
            );
    }

    // 7. Return final response
    return {
        ok: successOutputs.length > 0,
        output: merged.text,
        agentsDispatched: agents.map((a) => a.config.name),
        agentResults,
        totalTokenUsage: {
            inputTokens: totalInput + merged.mergeTokens.inputTokens,
            outputTokens: totalOutput + merged.mergeTokens.outputTokens,
        },
    };
}
