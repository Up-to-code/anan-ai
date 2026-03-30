import type { AgUiCardDefinition, AgUiConversationTurn } from "../../agUi/types";
import type { WorkspaceActionState } from "../types";
import type { DeleteConfirmationState, ListActionState, OperatorFilter, OperatorListItem } from "./types";
import { normalizeCommandText } from "./parse";

export function formatMoney(value: number | undefined) {
  if (!Number.isFinite(value)) return "غير محدد";
  return `${new Intl.NumberFormat("ar-EG").format(value as number)} ر.س`;
}

export function formatDate(value: number | undefined) {
  if (!value) return "بدون موعد";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  }).format(new Date(value));
}

function buildActionDefinition(type: WorkspaceActionState["type"]) {
  switch (type) {
    case "create_project":
      return { id: "create_project", title: "إنشاء مشروع", zone: "projects" as const };
    case "list_clients":
      return { id: "list_clients", title: "قائمة العملاء", zone: "crm" as const };
    case "list_projects":
      return { id: "list_projects", title: "قائمة المشاريع", zone: "projects" as const };
    case "search_projects":
      return { id: "search_projects", title: "بحث المشاريع", zone: "projects" as const };
    case "list_offers":
      return { id: "list_offers", title: "قائمة العروض", zone: "offers" as const };
    case "search_offers":
      return { id: "search_offers", title: "بحث العروض", zone: "offers" as const };
    case "delete_project_confirmation":
      return { id: "delete_project_confirmation", title: "تأكيد حذف المشروع", zone: "projects" as const };
  }
}

function buildFilterSummaryCard(filters: OperatorFilter[]) {
  if (filters.length === 0) return null;
  return {
    id: "workspace-filter-summary",
    componentId: "filter_summary" as const,
    props: {
      title: "الفلاتر المطبقة",
      filters: filters.map((filter) => `${filter.label}: ${filter.value}`),
    },
  };
}

function buildListCard(title: string, items: OperatorListItem[]) {
  return {
    id: `${normalizeCommandText(title).replace(/\s+/g, "-") || "workspace-list"}-card`,
    componentId: "data_list" as const,
    props: {
      title,
      items,
      emptyLabel: "لا توجد نتائج مطابقة.",
    },
  };
}

function buildTargetSummaryCard(params: {
  title: string;
  description: string;
  lines: string[];
}) {
  return {
    id: "workspace-target-summary",
    componentId: "target_summary" as const,
    props: {
      title: params.title,
      description: params.description,
      lines: params.lines,
    },
  };
}

export function buildListTurn(actionState: ListActionState, assistantText: string): AgUiConversationTurn {
  const action = buildActionDefinition(actionState.type);
  const cards: AgUiCardDefinition[] = [];
  const filterCard = buildFilterSummaryCard(actionState.filters);
  if (filterCard) cards.push(filterCard);
  cards.push(buildListCard(actionState.title, actionState.items));
  cards.push({
    id: `${actionState.type}-result`,
    componentId: "execution_result" as const,
    props: {
      title: actionState.title,
      description: actionState.description,
      status: "done",
    },
  });

  return {
    objective: actionState.type,
    targetZone: action.zone,
    action: { ...action, fields: [] },
    executionState: "completed",
    assistantText,
    cards,
  };
}

export function buildDeleteConfirmationTurn(
  actionState: DeleteConfirmationState,
  assistantText: string,
): AgUiConversationTurn {
  const action = buildActionDefinition(actionState.type);
  const cards: AgUiCardDefinition[] = [];
  const filterCard = buildFilterSummaryCard(actionState.filters);
  if (filterCard) cards.push(filterCard);
  cards.push(
    buildTargetSummaryCard({
      title: "المشروع المحدد للحذف",
      description: actionState.description,
      lines: [
        `اسم المشروع: ${actionState.projectTitle}`,
        `المعرف: ${actionState.projectId}`,
      ],
    }),
  );
  cards.push({
    id: "workspace-delete-confirmation-result",
    componentId: "execution_result" as const,
    props: {
      title: "بانتظار التأكيد",
      description: "لن يتم تنفيذ الحذف حتى ترسل تأكيداً صريحاً مثل: نعم، أكد الحذف.",
      status: "blocked",
    },
  });

  return {
    objective: actionState.type,
    targetZone: action.zone,
    action: { ...action, fields: [] },
    executionState: "collecting",
    assistantText,
    followupQuestion: "أرسل: نعم، أكد الحذف.",
    cards,
  };
}

export function buildBlockedTurn(command: WorkspaceActionState["type"], assistantText: string): AgUiConversationTurn {
  const action = buildActionDefinition(command);
  return {
    objective: command,
    targetZone: action.zone,
    action: { ...action, fields: [] },
    executionState: "failed",
    assistantText,
    cards: [
      {
        id: `${command}-blocked`,
        componentId: "execution_result",
        props: {
          title: "الصلاحية غير متاحة",
          description: "الأمر يتطلب مساحة عمل شريك بصلاحيات وسيط أو مطور.",
          status: "blocked",
        },
      },
    ],
  };
}
