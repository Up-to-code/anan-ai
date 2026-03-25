import type { DealSummary } from "@/server/contracts/deals";
import type { PropertyDetail } from "@/server/contracts/properties";
import type { CrmClientRecord, CrmProjectReference, PipelineStage } from "./crmTypes";

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

/**
 * WHY:   CRM cards should reflect the real linked property when the deal already references one.
 * WHAT:  Converts a property DTO into the compact project reference used across the CRM UI.
 * HOW:   Pulls the best available image/location fields and formats the property price for direct display.
 */
export function mapPropertyToCrmProjectReference(property: PropertyDetail): CrmProjectReference {
  return {
    id: property._id,
    title: property.title,
    image:
      property.heroImage?.url ??
      property.media?.[0]?.url ??
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    location: property.location ?? property.address,
    priceLabel: `${formatCurrency(property.price)} ر.س`,
  };
}

/**
 * WHY:   CRM routes need one place to merge deal data with optional linked property details.
 * WHAT:  Maps a single deal into the card-ready CRM client record used by board, list, and detail views.
 * HOW:   Prefers the linked property snapshot when available and falls back to deal-native labels otherwise.
 */
export function mapDealToCrmClientRecord(
  deal: DealSummary,
  property?: PropertyDetail | null,
): CrmClientRecord {
  const project = property ? mapPropertyToCrmProjectReference(property) : null;
  return {
    id: deal.id,
    personType: "client",
    avatarImage: "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=320&q=80",
    avatarLabel: (deal.contactName ?? deal.title).slice(0, 1),
    name: deal.contactName ?? deal.title,
    stage: mapDealStage(deal.stage),
    budgetLabel: deal.value ? `${formatCurrency(deal.value)} ر.س` : project?.priceLabel ?? "غير محدد",
    preference: deal.description ?? "صفقة تحتاج متابعة",
    nextFollowUpAt: deal.nextFollowUpAt,
    project,
    unit: null,
    broker: null,
    notes: deal.notes ?? "لا توجد ملاحظات بعد.",
  };
}

/**
 * WHY:   CRM routes often need real property snapshots for several deal cards at once.
 * WHAT:  Loads a property map for every unique deal property id using the supplied resolver.
 * HOW:   De-duplicates ids first, then resolves them in parallel and returns a simple lookup map.
 */
export async function loadCrmPropertyMap(
  deals: DealSummary[],
  getProperty: (propertyId: string) => Promise<PropertyDetail | null>,
) {
  const propertyIds = [...new Set(deals.flatMap((deal) => (deal.propertyId ? [deal.propertyId] : [])))];
  const entries = await Promise.all(propertyIds.map(async (propertyId) => [propertyId, await getProperty(propertyId)] as const));
  return new Map(entries);
}

export function collectCrmProjects(deals: DealSummary[], propertyMap: Map<string, PropertyDetail | null>) {
  const seen = new Map<string, CrmProjectReference>();

  deals.forEach((deal) => {
    if (!deal.propertyId || seen.has(deal.propertyId)) return;
    const property = propertyMap.get(deal.propertyId);
    if (!property) return;

    seen.set(deal.propertyId, mapPropertyToCrmProjectReference(property));
  });

  return [...seen.values()];
}
