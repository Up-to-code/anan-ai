import type { ActionCtx } from "../../../../../_generated/server";
import type { AssistantOwner, WorkspaceActionState } from "../../types";
import { deleteWorkspaceProject, filterBySearchTerm, getWorkspaceProjectById, listWorkspaceProjects } from "../data";
import { buildDeleteConfirmationTurn, buildListTurn, formatMoney } from "../format";
import { isConfirmationMessage } from "../parse";
import type {
  DeleteConfirmationState,
  ParsedWorkspaceCommand,
  ProjectSummary,
  WorkspaceDirectCommandResult,
  ListActionState,
  OperatorFilter,
} from "../types";

function buildProjectListActionState(params: {
  command: Extract<ParsedWorkspaceCommand, { kind: "list_projects" | "search_projects" }>;
  projects: ProjectSummary[];
}): ListActionState {
  const filters: OperatorFilter[] = [];
  if (params.command.searchTerm) filters.push({ label: "البحث", value: params.command.searchTerm });

  return {
    type: params.command.kind,
    zone: "projects",
    state: "completed",
    title: params.command.kind === "search_projects" ? "نتائج بحث المشاريع" : "قائمة المشاريع",
    description: params.projects.length
      ? `تم تجهيز ${params.projects.length} مشروع/عقار من مساحة العمل الحالية.`
      : "لم يتم العثور على مشاريع مطابقة.",
    totalCount: params.projects.length,
    filters,
    items: params.projects.map((project) => ({
      id: project._id,
      title: project.title,
      subtitle: project.address,
      meta: `${formatMoney(project.price)} · ${project.publicationState ?? project.status ?? "غير محددة"}`,
    })),
  };
}

export async function handleListProjectsCommand(
  ctx: ActionCtx,
  owner: AssistantOwner,
  command: Extract<ParsedWorkspaceCommand, { kind: "list_projects" | "search_projects" }>,
): Promise<WorkspaceDirectCommandResult> {
  const projects = await listWorkspaceProjects(ctx, owner, command.limit);
  const filteredProjects = filterBySearchTerm(
    projects,
    command.searchTerm,
    (project) => `${project.title} ${project.address} ${project.publicationState ?? ""}`,
  ).slice(0, command.limit);

  const actionState = buildProjectListActionState({
    command,
    projects: filteredProjects,
  });

  const assistantText = filteredProjects.length
    ? [
        actionState.title,
        ...filteredProjects.map((project, index) =>
          `${index + 1}. ${project.title} · ${project.address} · ${formatMoney(project.price)} · الحالة: ${project.publicationState ?? project.status ?? "غير محددة"} · المعرف: ${project._id}`,
        ),
      ].join("\n")
    : command.searchTerm
      ? `لم أجد مشاريع مطابقة لعبارة "${command.searchTerm}".`
      : "لا توجد مشاريع متاحة حالياً في مساحة العمل.";

  return {
    assistantText,
    meta: {
      command: actionState.type,
      count: filteredProjects.length,
      searchTerm: command.searchTerm ?? null,
    },
    uiTurn: buildListTurn(actionState, assistantText),
    actionState,
  };
}

export async function handleDeleteProjectCommand(
  ctx: ActionCtx,
  owner: AssistantOwner,
  command: Extract<ParsedWorkspaceCommand, { kind: "delete_project" }>,
  previousActionState: WorkspaceActionState | null,
  message: string,
): Promise<WorkspaceDirectCommandResult> {
  const previousDeleteState =
    previousActionState?.type === "delete_project_confirmation"
      ? previousActionState
      : null;

  if (previousDeleteState && isConfirmationMessage(message)) {
    await deleteWorkspaceProject(ctx, owner, previousDeleteState.projectId);
    const actionState: DeleteConfirmationState = {
      ...previousDeleteState,
      state: "completed",
      requiresConfirmation: false,
    };
    const assistantText = `تم حذف المشروع ${previousDeleteState.projectTitle} بنجاح.`;
    return {
      assistantText,
      meta: {
        command: "delete_project_confirmation",
        projectId: previousDeleteState.projectId,
        deleted: true,
      },
      uiTurn: {
        objective: actionState.type,
        targetZone: "projects",
        action: { id: "delete_project_confirmation", title: "تأكيد حذف المشروع", zone: "projects", fields: [] },
        executionState: "completed",
        assistantText,
        cards: [
          {
            id: "workspace-delete-project-done",
            componentId: "execution_result",
            props: {
              title: "تم حذف المشروع",
              description: `تم تنفيذ حذف المشروع ${previousDeleteState.projectTitle} ضمن صلاحيات المستخدم الحالية.`,
              status: "done",
            },
          },
        ],
      },
      actionState,
    };
  }

  if (!command.projectId) {
    const assistantText =
      "أستطيع حذف المشروع من مساحة العمل، لكن أحتاج معرف المشروع أولاً. أرسل `project id` أو `رقم المشروع` كما ظهر في القائمة.";
    return {
      assistantText,
      meta: { command: command.kind, requiresProjectId: true },
      uiTurn: {
        objective: "delete_project_confirmation",
        targetZone: "projects",
        action: { id: "delete_project_confirmation", title: "تأكيد حذف المشروع", zone: "projects", fields: [] },
        executionState: "failed",
        assistantText,
        cards: [
          {
            id: "workspace-delete-project-missing-id",
            componentId: "execution_result",
            props: {
              title: "حذف مشروع",
              description: "يلزم إرسال معرف المشروع قبل تنفيذ الحذف.",
              status: "blocked",
            },
          },
        ],
      },
      actionState: null,
    };
  }

  const project = await getWorkspaceProjectById(ctx, owner, command.projectId);
  if (!project) {
    const assistantText = "لم أتمكن من العثور على هذا المشروع داخل نطاق صلاحياتك الحالية.";
    return {
      assistantText,
      meta: { command: command.kind, projectId: command.projectId, blocked: true },
      uiTurn: {
        objective: "delete_project_confirmation",
        targetZone: "projects",
        action: { id: "delete_project_confirmation", title: "تأكيد حذف المشروع", zone: "projects", fields: [] },
        executionState: "failed",
        assistantText,
        cards: [
          {
            id: "workspace-delete-project-not-found",
            componentId: "execution_result",
            props: {
              title: "تعذر تحديد المشروع",
              description: "المشروع غير موجود أو لا يدخل ضمن صلاحيات المستخدم الحالية.",
              status: "blocked",
            },
          },
        ],
      },
      actionState: null,
    };
  }

  const actionState: DeleteConfirmationState = {
    type: "delete_project_confirmation",
    zone: "projects",
    state: "collecting",
    projectId: project._id,
    projectTitle: project.title,
    description: `${project.address} · ${formatMoney(project.price)}`,
    filters: [
      { label: "المعرف", value: project._id },
      { label: "الحالة", value: project.publicationState ?? project.status ?? "غير محددة" },
    ],
    requiresConfirmation: true,
  };

  const assistantText =
    `حددت المشروع المطلوب للحذف: ${project.title}. إذا كنت متأكداً، أرسل: نعم، أكد الحذف.`;

  return {
    assistantText,
    meta: {
      command: actionState.type,
      projectId: project._id,
      requiresConfirmation: true,
    },
    uiTurn: buildDeleteConfirmationTurn(actionState, assistantText),
    actionState,
  };
}
