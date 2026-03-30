import type { ActionCtx } from "../../../../../_generated/server";
import { filterBySearchTerm, listWorkspaceOffers } from "../data";
import { buildListTurn, formatMoney } from "../format";
import type { ParsedWorkspaceCommand, WorkspaceDirectCommandResult, OfferSummary, ListActionState, OperatorFilter } from "../types";

function buildOfferListActionState(params: {
  command: Extract<ParsedWorkspaceCommand, { kind: "list_offers" | "search_offers" }>;
  offers: Array<OfferSummary & { source: string }>;
}): ListActionState {
  const filters: OperatorFilter[] = [];
  if (params.command.searchTerm) filters.push({ label: "البحث", value: params.command.searchTerm });

  return {
    type: params.command.kind,
    zone: "offers",
    state: "completed",
    title: params.command.kind === "search_offers" ? "نتائج بحث العروض" : "قائمة العروض",
    description: params.offers.length
      ? `تم تجهيز ${params.offers.length} عرضاً من البيانات المتاحة للمستخدم الحالي.`
      : "لم يتم العثور على عروض مطابقة.",
    totalCount: params.offers.length,
    filters,
    items: params.offers.map((offer) => ({
      id: offer.id,
      title: offer.property?.title ?? "عرض بدون عقار واضح",
      subtitle: offer.property?.address ?? offer.source,
      meta: `${formatMoney(offer.price)} · ${offer.publicationState ?? offer.status}`,
    })),
  };
}

export async function handleListOffersCommand(
  ctx: ActionCtx,
  command: Extract<ParsedWorkspaceCommand, { kind: "list_offers" | "search_offers" }>,
): Promise<WorkspaceDirectCommandResult> {
  const { sent, received, marketplace } = await listWorkspaceOffers(ctx);
  const allOffers = [
    ...sent.map((offer) => ({ source: "مرسل", ...offer })),
    ...received.map((offer) => ({ source: "وارد", ...offer })),
    ...marketplace.map((offer) => ({ source: "السوق", ...offer })),
  ];

  const filteredOffers = filterBySearchTerm(
    allOffers,
    command.searchTerm,
    (offer) =>
      `${offer.property?.title ?? ""} ${offer.property?.address ?? ""} ${offer.description ?? ""} ${offer.message ?? ""} ${offer.source}`,
  ).slice(0, command.limit);

  const actionState = buildOfferListActionState({
    command,
    offers: filteredOffers,
  });

  const assistantText = filteredOffers.length
    ? [
        actionState.title,
        ...filteredOffers.map((offer, index) =>
          `${index + 1}. ${offer.property?.title ?? "عرض بدون عقار واضح"} · ${offer.source} · ${formatMoney(offer.price)} · الحالة: ${offer.publicationState ?? offer.status} · المعرف: ${offer.id}`,
        ),
      ].join("\n")
    : command.searchTerm
      ? `لم أجد عروضاً مطابقة لعبارة "${command.searchTerm}".`
      : "لا توجد عروض متاحة حالياً.";

  return {
    assistantText,
    meta: {
      command: actionState.type,
      count: filteredOffers.length,
      searchTerm: command.searchTerm ?? null,
    },
    uiTurn: buildListTurn(actionState, assistantText),
    actionState,
  };
}
