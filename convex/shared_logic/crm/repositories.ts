import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import {
  enrichDeal,
  isActiveDeal,
  listBrokerSelectorOptionRows,
  listClientsByOwnerIndex,
  listEnrichedDealsByIndex,
  maybeCreateInlineClient,
  paginateRows,
  requireExistingDeal,
} from "./shared";
import { mapClient } from "./mappers";
import {
  addDealDocumentArgs,
  archiveDealArgs,
  createDealArgs,
  updateDealArgs,
  updateDealFollowUpArgs,
  updateDealNotesArgs,
  updateDealStageArgs,
} from "./validation";

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
    return listClientsByOwnerIndex(ctx, {
      index: "brokerId",
      ownerId: args.brokerId,
    });
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
    return listClientsByOwnerIndex(ctx, {
      index: "REDId",
      ownerId: args.REDId,
    });
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
    return listBrokerSelectorOptionRows(ctx);
  },
});

export const createDeal = mutation({
  args: createDealArgs,
  handler: async (ctx, args) => {
    const crmClientId = await maybeCreateInlineClient(ctx, {
      crmClientId: args.crmClientId,
      relationType: args.relationType,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      description: args.description,
      ownerAuthUserId: args.lastUpdatedBy,
      brokerId: args.brokerId,
      REDId: args.REDId,
    });
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
  args: updateDealArgs,
  handler: async (ctx, args) => {
    const deal = await requireExistingDeal(ctx, args.dealId, { mustBeActive: true });
    const crmClientId = await maybeCreateInlineClient(ctx, {
      crmClientId: args.crmClientId,
      relationType: args.relationType,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      description: args.description,
      ownerAuthUserId: args.lastUpdatedBy,
      brokerId: deal.brokerId,
      REDId: deal.REDId,
    });
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
  args: updateDealStageArgs,
  handler: async (ctx, args) => {
    await requireExistingDeal(ctx, args.dealId);
    await ctx.db.patch(args.dealId, {
      stage: args.stage,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const updateDealFollowUp = mutation({
  args: updateDealFollowUpArgs,
  handler: async (ctx, args) => {
    await requireExistingDeal(ctx, args.dealId);
    await ctx.db.patch(args.dealId, {
      nextFollowUpAt: args.nextFollowUpAt,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const updateDealNotes = mutation({
  args: updateDealNotesArgs,
  handler: async (ctx, args) => {
    await requireExistingDeal(ctx, args.dealId);
    await ctx.db.patch(args.dealId, {
      notes: args.notes,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const archiveDeal = mutation({
  args: archiveDealArgs,
  handler: async (ctx, args) => {
    await requireExistingDeal(ctx, args.dealId, { mustBeActive: true });
    await ctx.db.patch(args.dealId, {
      archivedAt: args.archivedAt,
      archivedBy: args.archivedBy,
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});

export const addDealDocument = mutation({
  args: addDealDocumentArgs,
  handler: async (ctx, args) => {
    const deal = await requireExistingDeal(ctx, args.dealId);
    const existing = deal?.documents ?? [];
    await ctx.db.patch(args.dealId, {
      documents: [...existing, args.document],
      lastUpdatedBy: args.lastUpdatedBy,
    });
    return { ok: true } as const;
  },
});
