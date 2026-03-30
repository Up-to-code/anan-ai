import type { ActionCtx } from "../../../../_generated/server";
import { buildBlockedTurn } from "./format";
import { getCommandActionType, isConfirmationMessage, parseWorkspaceCommand } from "./parse";
import type { AssistantOwner, WorkspaceActionState } from "../types";
import type { WorkspaceDirectCommandResult } from "./types";
import { handleListClientsCommand } from "./handlers/clients";
import { handleDeleteProjectCommand, handleListProjectsCommand } from "./handlers/projects";
import { handleListOffersCommand } from "./handlers/offers";

/**
 * WHY:   Concrete workspace asks like "my clients today" or "delete project X" should execute directly instead of going through the generic orchestrator every time.
 * WHAT:  Detects a small set of operational workspace commands and returns real, auth-scoped data or confirmation-gated mutations.
 * HOW:   Uses deterministic intent parsing, current owner-scoped Convex queries/mutations, richer workspace action state, and data-first Arabic UI cards.
 */
export async function maybeHandleWorkspaceDirectCommand(params: {
  ctx: ActionCtx;
  message: string;
  owner: AssistantOwner;
  previousActionState?: WorkspaceActionState | null;
}): Promise<WorkspaceDirectCommandResult | null> {
  if (
    params.previousActionState?.type === "delete_project_confirmation" &&
    params.previousActionState.state === "collecting" &&
    isConfirmationMessage(params.message)
  ) {
    return handleDeleteProjectCommand(
      params.ctx,
      params.owner,
      { kind: "delete_project", projectId: params.previousActionState.projectId },
      params.previousActionState,
      params.message,
    );
  }

  const command = parseWorkspaceCommand(params.message);
  if (!command) {
    return null;
  }

  if (params.owner.ownerType === "user") {
    const assistantText =
      "هذا النوع من أوامر مساحة العمل متاح حالياً لحسابات الوسطاء والمطورين فقط.";
    return {
      assistantText,
      meta: { command: command.kind, blocked: true, reason: "owner_type_user" },
      uiTurn: buildBlockedTurn(getCommandActionType(command), assistantText),
      actionState: null,
    };
  }

  switch (command.kind) {
    case "list_clients":
      return handleListClientsCommand(params.ctx, params.owner, command);
    case "list_projects":
    case "search_projects":
      return handleListProjectsCommand(params.ctx, params.owner, command);
    case "delete_project":
      return handleDeleteProjectCommand(
        params.ctx,
        params.owner,
        command,
        params.previousActionState ?? null,
        params.message,
      );
    case "list_offers":
    case "search_offers":
      return handleListOffersCommand(params.ctx, command);
    default:
      return null;
  }
}
