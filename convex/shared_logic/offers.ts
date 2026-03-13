import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "./files";
import {
  applyToOfferService,
  createOfferService,
  listPublicOffersService,
  listReceivedOffersService,
  listSentOffersService,
  publishOfferService,
  updateOfferStatusService,
} from "./offers/index";

// ─── Create Offer ─────────────────────────────────────────────────────────────

export const createOffer = mutation({
  args: {
    propertyId: v.id("properties"),
    price: v.number(),
    message: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    toBrokerId: v.optional(v.id("brokers")),
    toREDId: v.optional(v.id("RED")),
    recipientAuthUserId: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    attachments: v.optional(uploadedFileReferenceListValidator),
  },
  handler: async (ctx, args) => {
    return await createOfferService(ctx, args);
  },
});

export const createOfferDraft = mutation({
  args: {
    propertyId: v.id("properties"),
    price: v.number(),
    message: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    toBrokerId: v.optional(v.id("brokers")),
    toREDId: v.optional(v.id("RED")),
    recipientAuthUserId: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    attachments: v.optional(uploadedFileReferenceListValidator),
  },
  handler: async (ctx, args) => {
    return await createOfferService(ctx, args);
  },
});

export const publishOffer = mutation({
  args: {
    id: v.id("offers"),
  },
  handler: async (ctx, args) => {
    return await publishOfferService(ctx, args);
  },
});

// ─── Accept / Reject ──────────────────────────────────────────────────────────

export const updateOfferStatus = mutation({
  args: {
    id: v.id("offers"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    return await updateOfferStatusService(ctx, args);
  },
});

// ─── Apply to a Public Offer ──────────────────────────────────────────────────

export const applyToOffer = mutation({
  args: {
    offerId: v.id("offers"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await applyToOfferService(ctx, args);
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

/** List offers I sent */
export const listSentOffers = query({
  args: {},
  handler: async (ctx) => {
    return await listSentOffersService(ctx);
  },
});

/** List offers I received */
export const listReceivedOffers = query({
  args: {},
  handler: async (ctx) => {
    return await listReceivedOffersService(ctx);
  },
});

/** List all PUBLIC offers (for the marketplace view) */
export const listPublicOffers = query({
  args: {},
  handler: async (ctx) => {
    return await listPublicOffersService(ctx);
  },
});
