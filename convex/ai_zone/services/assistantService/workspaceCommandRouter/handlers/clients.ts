import type { ActionCtx } from "../../../../../_generated/server";
import type { AssistantOwner } from "../../types";
import { formatDate } from "../format";
import { enrichClientsWithDeals, filterBySearchTerm, listWorkspaceClients, listWorkspaceDeals, sameCairoDay } from "../data";
import { buildListTurn } from "../format";
import type { ParsedWorkspaceCommand, WorkspaceDirectCommandResult, EnrichedClientSummary, ListActionState, OperatorFilter, OperatorListItem } from "../types";

function buildClientActionState(params: {
  command: Extract<ParsedWorkspaceCommand, { kind: "list_clients" }>;
  clients: EnrichedClientSummary[];
}): ListActionState {
  const filters: OperatorFilter[] = [];
  if (params.command.todayOnly) filters.push({ label: "الوقت", value: "اليوم" });
  if (params.command.stage) filters.push({ label: "المرحلة", value: params.command.stage });
  if (params.command.searchTerm) filters.push({ label: "البحث", value: params.command.searchTerm });

  const items: OperatorListItem[] = params.clients.map((client) => ({
    id: client.id,
    title: client.name,
    subtitle: [client.phone, client.email].filter(Boolean).join(" · ") || "بدون وسيلة تواصل مكتملة",
    meta: client.matchedDeal
      ? `المرحلة: ${client.matchedDeal.stage} · المتابعة: ${formatDate(client.matchedDeal.nextFollowUpAt)}`
      : `آخر تحديث: ${formatDate(client.updatedAt)}`,
  }));

  return {
    type: "list_clients",
    zone: "crm",
    state: "completed",
    title: params.command.todayOnly ? "عملاء اليوم" : "قائمة العملاء",
    description: params.clients.length
      ? `تم تجهيز ${params.clients.length} سجل عميل من مساحة العمل الحالية.`
      : "لم يتم العثور على سجلات عملاء مطابقة.",
    totalCount: params.clients.length,
    filters,
    items,
  };
}

export async function handleListClientsCommand(
  ctx: ActionCtx,
  owner: AssistantOwner,
  command: Extract<ParsedWorkspaceCommand, { kind: "list_clients" }>,
): Promise<WorkspaceDirectCommandResult> {
  const [clients, deals] = await Promise.all([
    listWorkspaceClients(ctx, owner),
    listWorkspaceDeals(ctx, owner),
  ]);

  let enriched = enrichClientsWithDeals(clients, deals);

  if (command.searchTerm) {
    enriched = filterBySearchTerm(
      enriched,
      command.searchTerm,
      (client) => `${client.name} ${client.phone ?? ""} ${client.email ?? ""} ${client.notes ?? ""}`,
    );
  }

  if (command.stage) {
    enriched = enriched.filter((client) => client.matchedDeal?.stage === command.stage);
  }

  if (command.todayOnly) {
    enriched = enriched.filter((client) =>
      Boolean(
        (client.matchedDeal?.nextFollowUpAt && sameCairoDay(client.matchedDeal.nextFollowUpAt)) ||
        sameCairoDay(client.updatedAt) ||
        sameCairoDay(client.createdAt),
      ),
    );
  }

  const selectedClients = enriched.slice(0, command.limit);
  const actionState = buildClientActionState({
    command,
    clients: selectedClients,
  });

  const assistantText = selectedClients.length
    ? [
        actionState.title,
        ...selectedClients.map((client, index) => {
          const contact = [client.phone, client.email].filter(Boolean).join(" · ");
          const dealLine = client.matchedDeal
            ? ` · المرحلة: ${client.matchedDeal.stage} · المتابعة: ${formatDate(client.matchedDeal.nextFollowUpAt)}`
            : "";
          return `${index + 1}. ${client.name}${contact ? ` · ${contact}` : ""}${dealLine}`;
        }),
      ].join("\n")
    : command.todayOnly
      ? "لا توجد سجلات عملاء مطابقة لليوم."
      : "لا توجد سجلات عملاء مطابقة حالياً.";

  return {
    assistantText,
    meta: {
      command: actionState.type,
      count: selectedClients.length,
      todayOnly: command.todayOnly,
      stage: command.stage ?? null,
      searchTerm: command.searchTerm ?? null,
    },
    uiTurn: buildListTurn(actionState, assistantText),
    actionState,
  };
}
