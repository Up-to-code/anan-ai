/**
 * types.ts — Shared agent runtime and tool types
 *
 * WHY:   Agents need a standard runtime context for tool execution.
 * WHAT:  Defines runtime context and tool factory types.
 * HOW:   Used by AnanAgent and tool modules.
 */

import type { ActionCtx } from "../../_generated/server";
import type { Tool } from "ai";

export type OrchestratorId = "anan_workspace";

export type AgentRuntimeContext = {
  /** User message */
  prompt: string;
  /** Optional extra context (RAG, memory) */
  context?: string;
  /** User ID for caching/memory */
  userId: string;
  /** Which orchestrator is running this agent */
  orchestratorId: OrchestratorId;
  /** Optional thread ID for per-thread caching */
  threadId?: string;
  /** Channel for analytics/caching */
  channel?: "workspace" | "web" | "admin";
  /** Role for access control */
  role?: "user" | "broker" | "RED" | "admin";
};

export type ToolFactory = (ctx: ActionCtx, runtime: AgentRuntimeContext) => Tool;

export type ToolFactoryMap = Record<string, Tool | ToolFactory>;

export type ResolvedToolSet = Record<string, Tool>;
