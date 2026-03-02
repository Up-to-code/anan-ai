/**
 * types.ts — Orchestrator Type Definitions
 *
 * WHY:   The orchestrator, intent analyzer, and result merger all share
 *        the same input/output types. Centralizing them here avoids duplication
 *        and makes imports clean.
 * WHAT:  Defines OrchestrateInput, OrchestrateOutput, and re-exports AnanAgentResult.
 */

import type { AnanAgentResult } from "../AnanAgent";

// Re-export for convenience
export type { AnanAgentResult };

/**
 * OrchestrateInput — Input to the main orchestrator.
 *
 * WHY:   The orchestrator needs to know: what the user said, who they are,
 *        what role they have, and any pre-fetched context.
 */
export interface OrchestrateInput {
    /** The user's message */
    prompt: string;
    /** User's role for tool access filtering */
    role: "user" | "broker" | "RED" | "admin";
    /** User ID for memory/knowledge lookup */
    userId: string;
    /** Channel (app, whatsapp, web) */
    channel?: "app" | "whatsapp" | "web";
    /** Optional RAG context already retrieved */
    ragContext?: string;
    /** Override LLM model for intent analysis */
    modelOverride?: string;
}

/**
 * OrchestrateOutput — Output from the main orchestrator.
 *
 * WHY:   The caller (assistantService) needs the response text, plus metadata
 *        for token tracking and debugging.
 */
export interface OrchestrateOutput {
    /** Whether the overall orchestration succeeded */
    ok: boolean;
    /** The merged response text */
    output: string;
    /** Which agents were dispatched */
    agentsDispatched: string[];
    /** Results from each agent (for debugging/logging) */
    agentResults: AnanAgentResult[];
    /** Total token usage across all agents */
    totalTokenUsage: { inputTokens: number; outputTokens: number };
}
