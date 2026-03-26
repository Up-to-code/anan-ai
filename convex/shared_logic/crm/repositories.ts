import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { uploadedFileReferenceValidator } from "../files";

type DealRecord = Doc<"deals">;

function mapDeal(deal: DealRecord) {
  return {
    id: deal._id,
    title: deal.title,
    description: deal.description,
    value: deal.value,
    nextFollowUpAt: deal.nextFollowUpAt,
    stage: deal.stage,
    brokerId: deal.brokerId,
    REDId: deal.REDId,
    propertyId: deal.propertyId,
    offerId: deal.offerId,
    notes: deal.notes,
    contactName: deal.contactName,
    contactPhone: deal.contactPhone,
    lastUpdatedBy: deal.lastUpdatedBy,
    documents: deal.documents,
  };
}

function isActiveDeal(deal: DealRecord) {
  return !deal.archivedAt;
}

export const listDealsByBrokerId = query({
  args: {
    brokerId: v.id("brokers"),
  },
  handler: async (ctx, args) => {
    const deals = await ctx.db
      .query("deals")
      .withIndex("brokerId", (q) => q.eq("brokerId", args.brokerId))
      .collect();
    return deals.filter(isActiveDeal).map(mapDeal);
  },
});

export const listDealsByRedId = query({
  args: {
    REDId: v.id("RED"),
  },
  handler: async (ctx, args) => {
    const deals = await ctx.db
      .query("deals")
      .withIndex("REDId", (q) => q.eq("REDId", args.REDId))
      .collect();
    return deals.filter(isActiveDeal).map(mapDeal);
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

    return Promise.all(
      deals.filter(isActiveDeal).map(async (deal) => {
        const [broker, red] = await Promise.all([
          deal.brokerId ? ctx.db.get(deal.brokerId) : Promise.resolve(null),
          deal.REDId ? ctx.db.get(deal.REDId) : Promise.resolve(null),
        ]);

        return {
          ...mapDeal(deal),
          brokerName: broker?.name ?? null,
          redName: red?.name ?? null,
        };
      }),
    );
  },
});

export const getDealById = query({
  args: {
    dealId: v.id("deals"),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    return deal && isActiveDeal(deal) ? mapDeal(deal) : null;
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
    brokerId: v.optional(v.id("brokers")),
    REDId: v.optional(v.id("RED")),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("deals", {
      title: args.title,
      description: args.description,
      value: args.value,
      nextFollowUpAt: args.nextFollowUpAt,
      stage: args.stage,
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
    notes: v.optional(v.string()),
    lastUpdatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const deal = await ctx.db.get(args.dealId);
    if (!deal || !isActiveDeal(deal)) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
    }
    await ctx.db.patch(args.dealId, {
      title: args.title,
      description: args.description,
      value: args.value,
      nextFollowUpAt: args.nextFollowUpAt,
      stage: args.stage,
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
