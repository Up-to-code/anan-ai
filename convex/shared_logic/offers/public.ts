import { zMutation, zQuery } from "../../validations/convex";
import {
  advanceOfferCaseStageInputSchema,
  applyToOfferInputSchema,
  conversationPrivateOfferDraftsInputSchema,
  createOfferInputSchema,
  offerIdInputSchema,
  offerLiveStateInputSchema,
  publishConversationOfferInputSchema,
  updateOfferDraftInputSchema,
  updateOfferStatusInputSchema,
} from "../../validations/offers";
import {
  advanceOfferCaseStage as advanceOfferCaseStageModel,
  applyToOffer as applyToOfferModel,
  archiveOffer as archiveOfferModel,
  createOffer as createOfferModel,
  createOfferDraft as createOfferDraftModel,
  getOfferLiveState as getOfferLiveStateModel,
  getWorkspaceOfferQueues as getWorkspaceOfferQueuesModel,
  listConversationPrivateOfferDrafts as listConversationPrivateOfferDraftsModel,
  listPublicOffers as listPublicOffersModel,
  listReceivedOffers as listReceivedOffersModel,
  listSentOffers as listSentOffersModel,
  publishConversationOffer as publishConversationOfferModel,
  publishOffer as publishOfferModel,
  updateOfferDraft as updateOfferDraftModel,
  updateOfferStatus as updateOfferStatusModel,
} from "../../model/offers/services";

// ─── Create Offer ─────────────────────────────────────────────────────────────

export const createOffer = zMutation({
  args: createOfferInputSchema,
  handler: async (ctx, args) => {
    return await createOfferModel(ctx, args);
  },
});

export const createOfferDraft = zMutation({
  args: createOfferInputSchema,
  handler: async (ctx, args) => {
    return await createOfferDraftModel(ctx, args);
  },
});

export const publishOffer = zMutation({
  args: offerIdInputSchema,
  handler: async (ctx, args) => {
    return await publishOfferModel(ctx, args);
  },
});

export const updateOfferDraft = zMutation({
  args: updateOfferDraftInputSchema,
  handler: async (ctx, args) => {
    return await updateOfferDraftModel(ctx, args);
  },
});

export const archiveOffer = zMutation({
  args: offerIdInputSchema,
  handler: async (ctx, args) => {
    return await archiveOfferModel(ctx, args);
  },
});

export const publishConversationOffer = zMutation({
  args: publishConversationOfferInputSchema,
  handler: async (ctx, args) => {
    return await publishConversationOfferModel(ctx, args);
  },
});

// ─── Accept / Reject ──────────────────────────────────────────────────────────

export const updateOfferStatus = zMutation({
  args: updateOfferStatusInputSchema,
  handler: async (ctx, args) => {
    return await updateOfferStatusModel(ctx, args);
  },
});

// ─── Apply to a Public Offer ──────────────────────────────────────────────────

export const applyToOffer = zMutation({
  args: applyToOfferInputSchema,
  handler: async (ctx, args) => {
    return await applyToOfferModel(ctx, args);
  },
});

export const advanceOfferCaseStage = zMutation({
  args: advanceOfferCaseStageInputSchema,
  handler: async (ctx, args) => {
    return await advanceOfferCaseStageModel(ctx, args);
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

/** List offers I sent */
export const listSentOffers = zQuery({
  args: {},
  handler: async (ctx) => {
    return await listSentOffersModel(ctx);
  },
});

/** List offers I received */
export const listReceivedOffers = zQuery({
  args: {},
  handler: async (ctx) => {
    return await listReceivedOffersModel(ctx);
  },
});

/** List all PUBLIC offers (for the marketplace view) */
export const listPublicOffers = zQuery({
  args: {},
  handler: async (ctx) => {
    return await listPublicOffersModel(ctx);
  },
});

export const listConversationPrivateOfferDrafts = zQuery({
  args: conversationPrivateOfferDraftsInputSchema,
  handler: async (ctx, args) => {
    return await listConversationPrivateOfferDraftsModel(ctx, args);
  },
});

export const getOfferLiveState = zQuery({
  args: offerLiveStateInputSchema,
  handler: async (ctx, args) => {
    return await getOfferLiveStateModel(ctx, args);
  },
});

export const getWorkspaceOfferQueues = zQuery({
  args: {},
  handler: async (ctx) => {
    return await getWorkspaceOfferQueuesModel(ctx);
  },
});
