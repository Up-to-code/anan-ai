/**
 * types.ts — Workspace Orchestrator Type Definitions
 *
 * WHY:   The workspace orchestrator, intent analyzer, and result merger
 *        share input/output types. Centralizing keeps imports clean.
 * WHAT:  Defines OrchestrateInput, OrchestrateOutput, and re-exports AnanAgentResult.
 */

import type { ActionCtx } from "../../../_generated/server";
import type { Id } from "../../../_generated/dataModel";
import type { AnanAgentResult } from "../AnanAgent";

export type { AnanAgentResult };

export type WorkspaceProjectFieldKey =
  | "name"
  | "city"
  | "district"
  | "price"
  | "rooms"
  | "bathrooms"
  | "description";

export type WorkspaceOperatorFilter = {
  label: string;
  value: string;
};

export type WorkspaceOperatorListItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
};

export type WorkspaceOperatorActionType =
  | "create_project"
  | "list_clients"
  | "list_projects"
  | "search_projects"
  | "list_offers"
  | "search_offers"
  | "delete_project_confirmation";

export type WorkspaceProjectActionCandidate = {
  type: "create_project";
  fields: Partial<Record<WorkspaceProjectFieldKey, string | number>>;
  missingFields: WorkspaceProjectFieldKey[];
  state: "collecting" | "ready" | "completed" | "failed";
};

export type WorkspaceListActionState = {
  type:
    | "list_clients"
    | "list_projects"
    | "search_projects"
    | "list_offers"
    | "search_offers";
  zone: "crm" | "projects" | "offers";
  state: "completed";
  title: string;
  description: string;
  totalCount: number;
  filters: WorkspaceOperatorFilter[];
  items: WorkspaceOperatorListItem[];
};

export type WorkspaceDeleteProjectConfirmationState = {
  type: "delete_project_confirmation";
  zone: "projects";
  state: "collecting" | "completed" | "failed";
  projectId: string;
  projectTitle: string;
  description: string;
  filters: WorkspaceOperatorFilter[];
  requiresConfirmation: boolean;
};

export type WorkspaceActionCandidate =
  | WorkspaceProjectActionCandidate
  | WorkspaceListActionState
  | WorkspaceDeleteProjectConfirmationState;

export type WorkspaceStreamPhase =
  | "intent_started"
  | "intent_done"
  | "team_started"
  | "team_done"
  | "merge_started"
  | "merge_done"
  | "action_started"
  | "action_done"
  | "persist_started"
  | "persist_done";

export type WorkspaceStreamStatus = "running" | "completed" | "failed";
export type WorkspaceStreamLifecycleStatus =
  | "started"
  | "completed"
  | "cancelled";

export interface WorkspaceStreamStageEvent {
  phase: WorkspaceStreamPhase;
  status?: WorkspaceStreamStatus;
  teamId?: string;
  agentName?: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface WorkspaceStructuredOutput {
  questions: string[];
  actionCandidate?: WorkspaceActionCandidate;
}

export interface OrchestrateInput {
  ctx: ActionCtx;
  prompt: string;
  role: "user" | "broker" | "RED" | "admin";
  userId: string;
  threadId?: Id<"assistantThreads">;
  channel?: "app" | "whatsapp" | "web";
  ragContext?: string;
  modelOverride?: string;
  streamSessionId?: string;
  onStageEvent?: (event: WorkspaceStreamStageEvent) => void | Promise<void>;
  onTextDelta?: (delta: string) => void | Promise<void>;
  onStreamCancelledCheck?: () => boolean | Promise<boolean>;
}

export interface OrchestrateOutput {
  ok: boolean;
  output: string;
  cancelled?: boolean;
  structured?: WorkspaceStructuredOutput;
  agentsDispatched: string[];
  agentResults: AnanAgentResult[];
  totalTokenUsage: { inputTokens: number; outputTokens: number };
}
