import type { WorkspaceActionState } from "./types";

function ensureUiTurn(turn: any, assistantText: string, actionState: WorkspaceActionState | null): any {
  if (turn) {
    turn.assistantText = assistantText;
    if (actionState && !turn.executionState) {
      turn.executionState = actionState.state;
    }
    return turn;
  }

  if (!actionState) {
    return null;
  }

  const actionMap = {
    create_project: {
      id: "create_project",
      title: "إنشاء مشروع",
      zone: "projects",
    },
    list_clients: {
      id: "list_clients",
      title: "قائمة العملاء",
      zone: "crm",
    },
    list_projects: {
      id: "list_projects",
      title: "قائمة المشاريع",
      zone: "projects",
    },
    search_projects: {
      id: "search_projects",
      title: "بحث المشاريع",
      zone: "projects",
    },
    list_offers: {
      id: "list_offers",
      title: "قائمة العروض",
      zone: "offers",
    },
    search_offers: {
      id: "search_offers",
      title: "بحث العروض",
      zone: "offers",
    },
    delete_project_confirmation: {
      id: "delete_project_confirmation",
      title: "تأكيد حذف المشروع",
      zone: "projects",
    },
  } as const;

  const action = actionMap[actionState.type];

  return {
    objective: actionState.type,
    targetZone: action.zone,
    action: {
      id: action.id,
      title: action.title,
      zone: action.zone,
      fields: [],
    },
    cards: [],
    assistantText,
    executionState: actionState.state,
  };
}

/**
 * WHY:   The workspace assistant still needs one post-processing step that keeps assistant text and action state aligned.
 * WHAT:  Normalizes the final AG UI turn after the real card builder runs.
 * HOW:   Preserves existing cards, updates assistant text, and creates a minimal shell only when action state exists.
 */
export function enrichUiTurnWithWorkspaceState(
  turn: any,
  assistantText: string,
  actionState: WorkspaceActionState | null
): any {
  return ensureUiTurn(turn, assistantText, actionState);
}

export function appendQuestionsToAssistantText(
  text: string,
  questions: string[]
): string {
  if (questions.length === 0) return text;

  const firstQuestion = questions[0];
  if (firstQuestion && text.includes(firstQuestion)) {
    return text;
  }

  const numbered = questions
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");
  return `${text}\n\n${numbered}`;
}
