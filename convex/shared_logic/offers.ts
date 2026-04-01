import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator } from "./files";
import {
  advanceOfferCaseStageService,
  archiveOfferService,
  applyToOfferService,
  createOfferDraftService,
  createOfferService,
  getOfferLiveStateService,
  getWorkspaceOfferQueuesService,
  listConversationPrivateOfferDraftsService,
  listPublicOffersService,
  listReceivedOffersService,
  listSentOffersService,
  publishConversationOfferService,
  publishOfferService,
  updateOfferDraftService,
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
    caseType: v.optional(
      v.union(
        v.literal("open_offer"),
        v.literal("private_offer"),
        v.literal("collaboration_case"),
      ),
    ),
    allowedAudience: v.optional(
      v.union(v.literal("brokers"), v.literal("developers"), v.literal("both")),
    ),
    commissionText: v.optional(v.string()),
    permitStatus: v.optional(v.string()),
    productStatus: v.optional(v.string()),
    toBrokerId: v.optional(v.id("brokers")),
    toREDId: v.optional(v.id("RED")),
    recipientAuthUserId: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    sourceConversationId: v.optional(v.id("inboxConversations")),
    attachments: v.optional(uploadedFileReferenceListValidator),
    clientContext: v.optional(
      v.object({
        crmClientId: v.optional(v.id("crmClients")),
        clientName: v.string(),
        clientPhone: v.optional(v.string()),
        clientBudget: v.optional(v.string()),
        clientNeed: v.string(),
        budgetMin: v.optional(v.number()),
        budgetMax: v.optional(v.number()),
        location: v.optional(v.string()),
        area: v.optional(v.string()),
        bedsMin: v.optional(v.number()),
        bathsMin: v.optional(v.number()),
        sqftMin: v.optional(v.number()),
        sqftMax: v.optional(v.number()),
      }),
    ),
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
    caseType: v.optional(
      v.union(
        v.literal("open_offer"),
        v.literal("private_offer"),
        v.literal("collaboration_case"),
      ),
    ),
    allowedAudience: v.optional(
      v.union(v.literal("brokers"), v.literal("developers"), v.literal("both")),
    ),
    commissionText: v.optional(v.string()),
    permitStatus: v.optional(v.string()),
    productStatus: v.optional(v.string()),
    toBrokerId: v.optional(v.id("brokers")),
    toREDId: v.optional(v.id("RED")),
    recipientAuthUserId: v.optional(v.string()),
    recipientEmail: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
    sourceConversationId: v.optional(v.id("inboxConversations")),
    attachments: v.optional(uploadedFileReferenceListValidator),
    clientContext: v.optional(
      v.object({
        crmClientId: v.optional(v.id("crmClients")),
        clientName: v.string(),
        clientPhone: v.optional(v.string()),
        clientBudget: v.optional(v.string()),
        clientNeed: v.string(),
        budgetMin: v.optional(v.number()),
        budgetMax: v.optional(v.number()),
        location: v.optional(v.string()),
        area: v.optional(v.string()),
        bedsMin: v.optional(v.number()),
        bathsMin: v.optional(v.number()),
        sqftMin: v.optional(v.number()),
        sqftMax: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await createOfferDraftService(ctx, args);
  },
});

export const publishOffer = mutation({
  args: {
    id: v.id("offerCases"),
  },
  handler: async (ctx, args) => {
    return await publishOfferService(ctx, args);
  },
});

export const updateOfferDraft = mutation({
  args: {
    id: v.id("offerCases"),
    conversationId: v.optional(v.id("inboxConversations")),
    propertyId: v.id("properties"),
    price: v.number(),
    message: v.optional(v.string()),
    description: v.optional(v.string()),
    attachments: v.optional(uploadedFileReferenceListValidator),
    commissionText: v.optional(v.string()),
    permitStatus: v.optional(v.string()),
    productStatus: v.optional(v.string()),
    allowedAudience: v.optional(
      v.union(v.literal("brokers"), v.literal("developers"), v.literal("both")),
    ),
    clientContext: v.optional(
      v.object({
        crmClientId: v.optional(v.id("crmClients")),
        clientName: v.string(),
        clientPhone: v.optional(v.string()),
        clientBudget: v.optional(v.string()),
        clientNeed: v.string(),
        budgetMin: v.optional(v.number()),
        budgetMax: v.optional(v.number()),
        location: v.optional(v.string()),
        area: v.optional(v.string()),
        bedsMin: v.optional(v.number()),
        bathsMin: v.optional(v.number()),
        sqftMin: v.optional(v.number()),
        sqftMax: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    return await updateOfferDraftService(ctx, args);
  },
});

export const archiveOffer = mutation({
  args: {
    id: v.id("offerCases"),
  },
  handler: async (ctx, args) => {
    return await archiveOfferService(ctx, args);
  },
});

export const publishConversationOffer = mutation({
  args: {
    id: v.id("offerCases"),
    conversationId: v.id("inboxConversations"),
  },
  handler: async (ctx, args) => {
    return await publishConversationOfferService(ctx, args);
  },
});

// ─── Accept / Reject ──────────────────────────────────────────────────────────

export const updateOfferStatus = mutation({
  args: {
    id: v.id("offerCases"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    return await updateOfferStatusService(ctx, args);
  },
});

// ─── Apply to a Public Offer ──────────────────────────────────────────────────

export const applyToOffer = mutation({
  args: {
    offerId: v.id("offerCases"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await applyToOfferService(ctx, args);
  },
});

export const advanceOfferCaseStage = mutation({
  args: {
    id: v.id("offerCases"),
    action: v.union(
      v.literal("mark_agreed"),
      v.literal("close_won"),
      v.literal("close_lost"),
    ),
  },
  handler: async (ctx, args) => {
    return await advanceOfferCaseStageService(ctx, args);
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

export const listConversationPrivateOfferDrafts = query({
  args: {
    conversationId: v.id("inboxConversations"),
  },
  handler: async (ctx, args) => {
    return await listConversationPrivateOfferDraftsService(ctx, args);
  },
});

export const getOfferLiveState = query({
  args: {
    offerId: v.union(v.id("offerCases"), v.string()),
  },
  handler: async (ctx, args) => {
    return await getOfferLiveStateService(ctx, args);
  },
});

export const getWorkspaceOfferQueues = query({
  args: {},
  handler: async (ctx) => {
    return await getWorkspaceOfferQueuesService(ctx);
  },
});
