import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import {
  addDealDocumentForCurrentProfile,
  createDealForCurrentProfile,
  listDealsByProperty,
  listDealsForCurrentProfile,
  listDealsForBootstrapSafe,
  updateDealNotesForCurrentProfile,
  updateDealStageForCurrentProfile,
} from "./services/dealsService";

const stageValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("negotiation"),
  v.literal("won"),
  v.literal("lost"),
);

export const getDeals = query({
  args: {},
  handler: async (ctx) => {
    return await listDealsForCurrentProfile(ctx);
  },
});

/**
 * Safe bootstrap variant that returns [] instead of throwing when auth is not ready.
 */
export const getDealsSafe = query({
  args: {},
  handler: async (ctx) => {
    return await listDealsForBootstrapSafe(ctx);
  },
});

export const getDealsByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await listDealsByProperty(ctx, args.propertyId);
  },
});

export const createDeal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    stage: stageValidator,
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    propertyId: v.optional(v.id("properties")),
  },
  handler: async (ctx, args) => {
    return await createDealForCurrentProfile(ctx, args);
  },
});

export const updateDealStage = mutation({
  args: {
    dealId: v.id("deals"),
    stage: stageValidator,
  },
  handler: async (ctx, args) => {
    return await updateDealStageForCurrentProfile(ctx, args);
  },
});

export const updateDealNotes = mutation({
  args: {
    dealId: v.id("deals"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    return await updateDealNotesForCurrentProfile(ctx, args);
  },
});

export const addDealDocument = mutation({
  args: {
    dealId: v.id("deals"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await addDealDocumentForCurrentProfile(ctx, args);
  },
});
