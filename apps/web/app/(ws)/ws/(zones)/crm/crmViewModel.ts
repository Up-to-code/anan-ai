import type { DealSummary } from "@/server/contracts/deals";
import type { CrmClientRecord, CrmProjectReference, PipelineStage } from "./crmTypes";

function mapDealStage(stage: DealSummary["stage"]): PipelineStage {
  if (stage === "won") return "won";
  if (stage === "negotiation") return "proposal";
  if (stage === "contacted") return "qualified";
  return "new";
}

export function mapDealToCrmClientRecord(deal: DealSummary): CrmClientRecord {
  return {
    id: deal.id,
    personType: "client",
    avatarImage: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=320&q=80",
    avatarLabel: (deal.contactName ?? deal.title).slice(0, 1),
    name: deal.contactName ?? deal.title,
    stage: mapDealStage(deal.stage),
    budgetLabel: deal.value ? `${new Intl.NumberFormat("en-US").format(deal.value)} ر.س` : "غير محدد",
    preference: deal.description ?? "فرصة CRM مرتبطة بالعقار",
    project: deal.propertyId
      ? {
          id: deal.propertyId,
          title: deal.title,
          image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
          location: "العقار المرتبط",
        }
      : null,
    unit: null,
    broker: null,
    notes: deal.notes ?? "لا توجد ملاحظات بعد.",
  };
}

export function collectCrmProjects(deals: DealSummary[]): CrmProjectReference[] {
  const seen = new Map<string, CrmProjectReference>();

  deals.forEach((deal) => {
    if (!deal.propertyId || seen.has(deal.propertyId)) return;

    seen.set(deal.propertyId, {
      id: deal.propertyId,
      title: deal.title,
      image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      location: "العقار المرتبط",
    });
  });

  return [...seen.values()];
}
