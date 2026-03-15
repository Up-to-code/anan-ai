// @ts-nocheck
/**
 * types.ts — Workspace Orchestrator Type Definitions
 *
 * WHY:   The workspace orchestrator, intent analyzer, and result merger
 *        share input/output types. Centralizing keeps imports clean.
 * WHAT:  Defines OrchestrateInput, OrchestrateOutput, and re-exports AnanAgentResult.
 */

import type { ActionCtx } from "../../_generated/server";
import type { AnanAgentResult } from "../AnanAgent";

export type { AnanAgentResult };

export interface OrchestrateInput {
  ctx: ActionCtx;
  prompt: string;
  role: "user" | "broker" | "RED" | "admin";
  userId: string;
  threadId?: string;
  channel?: "app" | "whatsapp" | "web";
  ragContext?: string;
  modelOverride?: string;
}

export interface OrchestrateOutput {
  ok: boolean;
  output: string;
  agentsDispatched: string[];
  agentResults: AnanAgentResult[];
  totalTokenUsage: { inputTokens: number; outputTokens: number };
}
// @ts-nocheck
