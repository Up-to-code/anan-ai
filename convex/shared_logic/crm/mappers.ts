import type { ClientRecord, DealRecord } from "./types";

function formatPriceLabel(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "غير محدد";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ر.س`;
}

function resolvePropertySummary(property: any) {
  const presentation = property?.body?.presentation;
  if (
    presentation &&
    typeof presentation === "object" &&
    typeof presentation.descriptionShort === "string" &&
    presentation.descriptionShort.trim()
  ) {
    return presentation.descriptionShort.trim();
  }
  if (typeof property?.description === "string" && property.description.trim()) {
    return property.description.trim();
  }
  return "نبذة المشروع غير متاحة بعد.";
}

function mapPropertyPreview(property: any) {
  if (!property) return null;
  return {
    id: String(property._id),
    title: property.title,
    image:
      property.heroImage?.url ??
      property.media?.[0]?.url ??
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    location: property.location ?? property.address ?? "غير محدد",
    priceLabel: formatPriceLabel(property.price),
    summary: resolvePropertySummary(property),
  };
}

function mapClientPreview(client: ClientRecord | null) {
  if (!client) return null;
  return {
    id: String(client._id),
    name: client.name,
    phone: client.phone,
    notes: client.notes,
    sourceClientId: client.sourceClientId,
  };
}

export function buildAvatarLabel(name?: string | null) {
  return (name?.trim()?.[0] ?? "و").toUpperCase();
}

function mapBrokerPreview(broker: any, relationType?: DealRecord["relationType"]) {
  if (!broker) return null;
  return {
    id: String(broker._id),
    name: broker.name,
    description: broker.description,
    phone: broker.phone,
    avatarLabel: buildAvatarLabel(broker.name),
    stateLabel: relationType === "broker_managed" ? "يدار عبر وسيط" : undefined,
    isVerified: broker.isVerified === true,
  };
}

/**
 * WHY:   CRM query surfaces should return one normalized deal projection regardless of caller.
 * WHAT:  Maps a deal row plus optional related rows into the shared response shape.
 * HOW:   Converts ids to strings and delegates nested preview formatting to the local mappers.
 */
export function mapDeal(
  deal: DealRecord,
  args: {
    client?: ClientRecord | null;
    broker?: any;
    property?: any;
    brokerName?: string | null;
    redName?: string | null;
  } = {},
) {
  return {
    id: deal._id,
    createdAt: deal.createdAt ?? deal._creationTime,
    title: deal.title,
    description: deal.description,
    value: deal.value,
    nextFollowUpAt: deal.nextFollowUpAt,
    stage: deal.stage,
    relationType: deal.relationType,
    crmClientId: deal.crmClientId,
    relatedBrokerId: deal.relatedBrokerId,
    brokerId: deal.brokerId,
    REDId: deal.REDId,
    propertyId: deal.propertyId,
    offerId: deal.offerId,
    notes: deal.notes,
    contactName: deal.contactName,
    contactPhone: deal.contactPhone,
    lastUpdatedBy: deal.lastUpdatedBy,
    brokerName: args.brokerName,
    redName: args.redName,
    client: mapClientPreview(args.client ?? null),
    linkedBroker: mapBrokerPreview(args.broker ?? null, deal.relationType),
    project: mapPropertyPreview(args.property ?? null),
    documents: deal.documents,
  };
}

/**
 * WHY:   CRM client queries should not leak raw Convex rows to web and AI consumers.
 * WHAT:  Maps a CRM client row into the shared client summary shape.
 * HOW:   Normalizes ids to strings and RED naming to `redId` on the outward contract.
 */
export function mapClient(client: ClientRecord) {
  return {
    id: String(client._id),
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    brokerId: client.brokerId ? String(client.brokerId) : undefined,
    redId: client.REDId ? String(client.REDId) : undefined,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}
