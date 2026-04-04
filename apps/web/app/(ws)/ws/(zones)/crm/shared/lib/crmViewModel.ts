import type { CrmClientRecord, CrmProjectReference, PipelineStage } from "../../types/crmTypes";
import type { BrokerPresence } from "../../../../_components/Visuals/BrokerPresenceChip";
import type { PersonBadge } from "../../../../_lib/entities";
import type { DealSummary } from "@/server/contracts/deals";

function mapDealStage(stage: DealSummary["stage"]): PipelineStage {
  if (stage === "lost") return "lost";
  if (stage === "won") return "won";
  if (stage === "negotiation") return "proposal";
  if (stage === "contacted") return "qualified";
  return "new";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function mapProjectPreviewToCrmProjectReference(project: NonNullable<DealSummary["project"]>): CrmProjectReference {
  return {
    id: project.id,
    title: project.title,
    image: project.image,
    location: project.location,
    priceLabel: project.priceLabel,
    summary: project.summary,
  };
}

/**
 * WHY:   CRM routes need one place to merge deal data with optional linked property details.
 * WHAT:  Maps a single deal into the card-ready CRM client record used by board, list, and detail views.
 * HOW:   Prefers the linked property snapshot when available and falls back to deal-native labels otherwise.
 */
export function mapDealToCrmClientRecord(
  deal: DealSummary,
): CrmClientRecord {
  const project = deal.project ? mapProjectPreviewToCrmProjectReference(deal.project) : null;
  const linkedBrokerBadges: PersonBadge[] | undefined = deal.linkedBroker?.isVerified ? ["verified"] : undefined;
  const linkedBrokerState: BrokerPresence["state"] = deal.relationType === "broker_managed" ? "client-linked" : "idle";
  const linkedBroker = deal.linkedBroker
    ? {
        id: deal.linkedBroker.id,
        name: deal.linkedBroker.name,
        avatarLabel: deal.linkedBroker.avatarLabel,
        avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
        state: linkedBrokerState,
        title: "وسيط مرتبط",
        city: project?.location,
        projectTitle: project?.title ?? null,
        clientName: deal.contactName ?? deal.client?.name ?? null,
        summary: deal.linkedBroker.description ?? "يتابع هذا العميل ضمن شبكة الوسطاء.",
        badges: linkedBrokerBadges,
        relation: project
          ? {
              project: { id: project.id, title: project.title, location: project.location, image: project.image, summary: project.summary },
              unit: null,
              stageLabel: deal.linkedBroker.stateLabel,
              summary: deal.notes ?? deal.description ?? undefined,
            }
          : null,
      }
    : null;

  return {
    id: deal.id,
    personType: "client",
    relationType: deal.relationType ?? "internal_client",
    avatarImage: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=320&q=80",
    avatarLabel: (deal.client?.name ?? deal.contactName ?? deal.title).slice(0, 1),
    name: deal.client?.name ?? deal.contactName ?? deal.title,
    stage: mapDealStage(deal.stage),
    budgetLabel: deal.value ? `${formatCurrency(deal.value)} ر.س` : project?.priceLabel ?? "غير محدد",
    preference: deal.description ?? project?.summary ?? "صفقة تحتاج متابعة",
    nextFollowUpAt: deal.nextFollowUpAt,
    project,
    linkedClient: deal.client
      ? {
          id: deal.client.id,
          name: deal.client.name,
          phone: deal.client.phone,
          notes: deal.client.notes,
          sourceClientId: deal.client.sourceClientId,
        }
      : null,
    unit: null,
    broker: linkedBroker,
    relationLabel: deal.relationType === "broker_managed" ? "عميل عبر وسيط" : "عميل داخلي",
    notes: deal.notes ?? "لا توجد ملاحظات بعد.",
  };
}

export function collectCrmProjects(deals: DealSummary[]) {
  const seen = new Map<string, CrmProjectReference>();

  deals.forEach((deal) => {
    if (!deal.project || seen.has(deal.project.id)) return;
    seen.set(deal.project.id, mapProjectPreviewToCrmProjectReference(deal.project));
  });

  return [...seen.values()];
}
