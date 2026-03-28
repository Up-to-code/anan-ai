import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { uploadedFileReferenceValidator } from "../files";

type DealRecord = Doc<"deals">;
type ClientRecord = Doc<"crmClients">;

function formatPriceLabel(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "غير محدد";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ر.س`;
}

function resolvePropertySummary(property: any) {
  const presentation = property?.body?.presentation;
  if (presentation && typeof presentation === "object" && typeof presentation.descriptionShort === "string" && presentation.descriptionShort.trim()) {
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

function buildAvatarLabel(name?: string | null) {
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

function mapDeal(
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

function mapClient(client: ClientRecord) {
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

function isActiveDeal(deal: DealRecord) {
  return !deal.archivedAt;
}

function paginateRows<T>(rows: T[], paginationOpts: { cursor: string | null; numItems: number }) {
  const offset = paginationOpts.cursor ? Number(paginationOpts.cursor) : 0;
  const page = rows.slice(offset, offset + paginationOpts.numItems);
  const nextOffset = offset + paginationOpts.numItems;
  return {
    page,
    isDone: nextOffset >= rows.length,
    continueCursor: nextOffset >= rows.length ? null : String(nextOffset),
  };
}

async function enrichDeal(ctx: any, deal: DealRecord) {
  const [broker, red, client, relatedBroker, property] = await Promise.all([
    deal.brokerId ? ctx.db.get(deal.brokerId) : Promise.resolve(null),
    deal.REDId ? ctx.db.get(deal.REDId) : Promise.resolve(null),
    deal.crmClientId ? ctx.db.get(deal.crmClientId) : Promise.resolve(null),
    deal.relatedBrokerId ? ctx.db.get(deal.relatedBrokerId) : Promise.resolve(null),
    deal.propertyId ? ctx.db.get(deal.propertyId) : Promise.resolve(null),
  ]);

  return mapDeal(deal, {
    brokerName: broker?.name ?? null,
    redName: red?.name ?? null,
    client,
    broker: relatedBroker,
    property,
  });
}

async function listEnrichedDealsByIndex(ctx: any, args: { index: "brokerId" | "REDId"; field: any }) {
  const deals = await ctx.db
    .query("deals")
    .withIndex(args.index, (q: any) => q.eq(args.index, args.field))
    .collect();

  const activeDeals = deals
    .filter(isActiveDeal)
    .sort((a: DealRecord, b: DealRecord) => (b.createdAt ?? b._creationTime) - (a.createdAt ?? a._creationTime));

  return Promise.all(activeDeals.map((deal: DealRecord) => enrichDeal(ctx, deal)));
}

export const listDealsByBrokerId = query({
  args: {
    brokerId: v.id("brokers"),
  },
  handler: async (ctx, args) => {
    return listEnrichedDealsByIndex(ctx, { index: "brokerId", field: args.brokerId });
  },
});

export const listDealsPageByBrokerId = query({
  args: {
    brokerId: v.id("brokers"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const deals = await listEnrichedDealsByIndex(ctx, { index: "brokerId", field: args.brokerId });
    return paginateRows(deals, args.paginationOpts);
  },
});

export const listClientsByBrokerId = query({
  args: {
    brokerId: v.id("brokers"),
  },
  handler: async (ctx, args) => {
    const clients = await ctx.db
      .query("crmClients")
      .withIndex("brokerId", (q) => q.eq("brokerId", args.brokerId))
      .collect();
    return clients
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(mapClient);
  },
});

export const listDealsByRedId = query({
  args: {
    REDId: v.id("RED"),
  },
  handler: async (ctx, args) => {
    return listEnrichedDealsByIndex(ctx, { index: "REDId", field: args.REDId });
  },
});

export const listDealsPageByRedId = query({
  args: {
    REDId: v.id("RED"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const deals = await listEnrichedDealsByIndex(ctx, { index: "REDId", field: args.REDId });
    return paginateRows(deals, args.paginationOpts);
  },
});

export const listClientsByRedId = query({
  args: {
    REDId: v.id("RED"),
  },
  handler: async (ctx, args) => {
    const clients = await ctx.db
      .query("crmClients")
      .withIndex("REDId", (q) => q.eq("REDId", args.REDId))
      .collect();
    return clients
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(mapClient);
  },
});

export const listDealsByPropertyId = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const deals = await ctx.db
      .query("deals")
      .withIndex("propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect();

    return Promise.all(deals.filter(isActiveDeal).map((deal) => enrichDeal(ctx, deal)));
  },
});

export const getDealById = query({
  args: {
    dealId: v.id("deals"),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    return deal && isActiveDeal(deal) ? enrichDeal(ctx, deal) : null;
  },
});

export const getClientById = query({
  args: {
    clientId: v.id("crmClients"),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId);
    return client ? mapClient(client) : null;
  },
});

export const listBrokerSelectorOptions = query({
  args: {},
  handler: async (ctx) => {
    const brokers = await ctx.db.query("brokers").collect();
    return brokers
      .filter((broker) => (broker.status ?? "active") !== "pending")
      .sort((a, b) => a.name.localeCompare(b.name, "ar"))
      .map((broker) => ({
        id: String(broker._id),
        name: broker.name,
        description: broker.description,
        phone: broker.phone,
        avatarLabel: buildAvatarLabel(broker.name),
        stateLabel: "حالة الوسيط تُعرض عند الربط",
        isVerified: broker.isVerified === true,
      }));
  },
});

export const createDeal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    nextFollowUpAt: v.optional(v.number()),
    stage: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost"),
    ),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    propertyId: v.optional(v.id("properties")),
    relationType: v.union(v.literal("internal_client"), v.literal("broker_managed")),
    crmClientId: v.optional(v.id("crmClients")),
    relatedBrokerId: v.optional(v.id("brokers")),
    brokerId: v.optional(v.id("brokers")),
    REDId: v.optional(v.id("RED")),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    let crmClientId = args.crmClientId;
    if (!crmClientId && args.relationType === "internal_client" && args.contactName) {
      crmClientId = await ctx.db.insert("crmClients", {
        ownerAuthUserId: args.lastUpdatedBy,
        brokerId: args.brokerId,
        REDId: args.REDId,
        name: args.contactName,
        phone: args.contactPhone,
        notes: args.description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return ctx.db.insert("deals", {
      createdAt: Date.now(),
      title: args.title,
      description: args.description,
      value: args.value,
      nextFollowUpAt: args.nextFollowUpAt,
      stage: args.stage,
      relationType: args.relationType,
      crmClientId,
      relatedBrokerId: args.relatedBrokerId,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      propertyId: args.propertyId,
      REDId: args.REDId,
      brokerId: args.brokerId,
      lastUpdatedBy: args.lastUpdatedBy,
    });
  },
});

export const updateDeal = mutation({
  args: {
    dealId: v.id("deals"),
    title: v.string(),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    nextFollowUpAt: v.optional(v.number()),
    stage: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost"),
    ),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    propertyId: v.optional(v.id("properties")),
    relationType: v.union(v.literal("internal_client"), v.literal("broker_managed")),
    crmClientId: v.optional(v.id("crmClients")),
    relatedBrokerId: v.optional(v.id("brokers")),
    notes: v.optional(v.string()),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal || !isActiveDeal(deal)) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }
    let crmClientId = args.crmClientId;
    if (!crmClientId && args.relationType === "internal_client" && args.contactName) {
      crmClientId = await ctx.db.insert("crmClients", {
        ownerAuthUserId: args.lastUpdatedBy,
        brokerId: deal.brokerId,
        REDId: deal.REDId,
        name: args.contactName,
        phone: args.contactPhone,
        notes: args.description,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    await ctx.db.patch(args.dealId, {
      title: args.title,
      description: args.description,
      value: args.value,
      nextFollowUpAt: args.nextFollowUpAt,
      stage: args.stage,
      relationType: args.relationType,
      crmClientId,
      relatedBrokerId: args.relatedBrokerId,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      propertyId: args.propertyId,
      notes: args.notes,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const updateDealStage = mutation({
  args: {
    dealId: v.id("deals"),
    stage: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("negotiation"),
      v.literal("won"),
      v.literal("lost"),
    ),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }
    await ctx.db.patch(args.dealId, {
      stage: args.stage,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const updateDealFollowUp = mutation({
  args: {
    dealId: v.id("deals"),
    nextFollowUpAt: v.number(),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }
    await ctx.db.patch(args.dealId, {
      nextFollowUpAt: args.nextFollowUpAt,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const updateDealNotes = mutation({
  args: {
    dealId: v.id("deals"),
    notes: v.string(),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }
    await ctx.db.patch(args.dealId, {
      notes: args.notes,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const archiveDeal = mutation({
  args: {
    dealId: v.id("deals"),
    archivedAt: v.number(),
    archivedBy: v.string(),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal || !isActiveDeal(deal)) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }
    await ctx.db.patch(args.dealId, {
      archivedAt: args.archivedAt,
      archivedBy: args.archivedBy,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const addDealDocument = mutation({
  args: {
    dealId: v.id("deals"),
    document: uploadedFileReferenceValidator,
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }
    const existing = deal?.documents ?? [];
    await ctx.db.patch(args.dealId, {
      documents: [...existing, args.document],
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});
