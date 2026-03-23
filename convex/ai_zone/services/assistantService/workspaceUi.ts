import { FIELD_QUESTION_MAP, type WorkspaceProjectActionState } from "./types";

function ensureUiTurn(turn: any, assistantText: string): any {
  if (turn) return turn;

  return {
    objective: "workspace_assistant",
    targetZone: "projects",
    action: {
      id: "latest_update",
      title: "تحديث المسار",
      zone: "projects",
      fields: [],
    },
    cards: [],
    assistantText,
  };
}

function appendUniqueCards(turn: any, cards: Array<Record<string, unknown>>) {
  const existing = new Set<string>(
    (turn.cards ?? []).map((card: any) => String(card.id))
  );
  const merged = [...(turn.cards ?? [])];
  for (const card of cards) {
    const id = String(card.id ?? "");
    if (!id || existing.has(id)) continue;
    existing.add(id);
    merged.push(card);
  }
  turn.cards = merged;
}

function collectingCards(actionState: WorkspaceProjectActionState) {
  return [
    {
      id: "workspace-missing-fields",
      componentId: "field_request_list",
      props: {
        fields: actionState.missingFields.map((field) => FIELD_QUESTION_MAP[field]),
      },
    },
    {
      id: "workspace-followup",
      componentId: "missing_data_prompt",
      props: {
        prompt:
          actionState.missingFields.length > 0
            ? FIELD_QUESTION_MAP[actionState.missingFields[0]]
            : "أرسل أي تفاصيل إضافية تريد إضافتها.",
      },
    },
  ];
}

function completedCards(actionState: WorkspaceProjectActionState) {
  return [
    {
      id: "workspace-project-created",
      componentId: "execution_result",
      props: {
        title: "تم إنشاء المشروع",
        description: actionState.projectId
          ? `تم إنشاء المشروع كمسودة بنجاح. رقم المشروع: ${actionState.projectId}`
          : "تم إنشاء المشروع كمسودة بنجاح.",
        status: "done",
      },
    },
  ];
}

function failedCards(actionState: WorkspaceProjectActionState) {
  return [
    {
      id: "workspace-project-failed",
      componentId: "execution_result",
      props: {
        title: "تعذر إنشاء المشروع",
        description:
          actionState.error ??
          "تعذر إنشاء المشروع حالياً. راجع البيانات وحاول مرة أخرى.",
        status: "blocked",
      },
    },
  ];
}

function appendCardsForActionState(
  uiTurn: any,
  actionState: WorkspaceProjectActionState
) {
  if (actionState.state === "collecting") {
    appendUniqueCards(uiTurn, collectingCards(actionState));
    return;
  }
  if (actionState.state === "completed") {
    appendUniqueCards(uiTurn, completedCards(actionState));
    return;
  }
  if (actionState.state === "failed") {
    appendUniqueCards(uiTurn, failedCards(actionState));
  }
}

export function enrichUiTurnWithWorkspaceState(
  turn: any,
  assistantText: string,
  actionState: WorkspaceProjectActionState | null
): any {
  const uiTurn = ensureUiTurn(turn, assistantText);
  uiTurn.assistantText = assistantText;

  if (!actionState) {
    return uiTurn;
  }
  appendCardsForActionState(uiTurn, actionState);

  return uiTurn;
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
