import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  AdvanceOfferCaseStageInput,
  ApplyToOfferInput,
  ArchiveOfferInput,
  CreateOfferInput,
  OfferActionResult,
  OfferLiveState,
  OffersSnapshot,
  PublishConversationOfferInput,
  PublishOfferInput,
  RespondToOfferInput,
  UpdateOfferDraftInput,
} from "@/server/contracts/offers";

type OffersApiRefs = {
  getWorkspaceOfferQueues: unknown;
  listSentOffers: unknown;
  listReceivedOffers: unknown;
  listPublicOffers: unknown;
  createOffer: unknown;
  createOfferDraft: unknown;
  publishOffer: unknown;
  publishConversationOffer: unknown;
  updateOfferDraft: unknown;
  archiveOffer: unknown;
  getOfferLiveState: unknown;
  updateOfferStatus: unknown;
  applyToOffer: unknown;
  advanceOfferCaseStage: unknown;
};

const offersApi = apiUnsafe["shared_logic/offers"] as OffersApiRefs;

export type OffersRepository = {
  getQueues(token?: string): Promise<OffersSnapshot>;
  listSent(token?: string): Promise<OffersSnapshot["sent"]>;
  listReceived(token?: string): Promise<OffersSnapshot["received"]>;
  listMarketplace(token?: string): Promise<OffersSnapshot["marketplace"]>;
  create(input: CreateOfferInput, token?: string): Promise<OfferActionResult>;
  createDraft(input: CreateOfferInput, token?: string): Promise<OfferActionResult>;
  publish(input: PublishOfferInput, token?: string): Promise<{ ok: true }>;
  publishConversation(input: PublishConversationOfferInput, token?: string): Promise<OfferActionResult>;
  updateDraft(input: UpdateOfferDraftInput, token?: string): Promise<{ ok: true }>;
  archive(input: ArchiveOfferInput, token?: string): Promise<{ ok: true }>;
  getOfferLiveState(input: { offerId: string }, token?: string): Promise<OfferLiveState | null>;
  respond(input: RespondToOfferInput, token?: string): Promise<void>;
  apply(input: ApplyToOfferInput, token?: string): Promise<OfferActionResult>;
  advanceStage(input: AdvanceOfferCaseStageInput, token?: string): Promise<{ ok: true }>;
};

/**
 * WHY:   Workspace offer pages should consume the new case-domain queries through one stable repository interface.
 * WHAT:  Adapts the shared Convex offers 2.0 capability into web-facing DTOs and mutations.
 * HOW:   Calls the auth-scoped Convex handlers through `apiUnsafe`, preserving transport isolation at the server layer.
 */
export const convexOffersRepository: OffersRepository = {
  async getQueues(token) {
    return fetchQuery(
      offersApi.getWorkspaceOfferQueues as never,
      {} as never,
      token ? { token } : undefined,
    ) as Promise<OffersSnapshot>;
  },

  async listSent(token) {
    return fetchQuery(
      offersApi.listSentOffers as never,
      {} as never,
      token ? { token } : undefined,
    ) as Promise<OffersSnapshot["sent"]>;
  },

  async listReceived(token) {
    return fetchQuery(
      offersApi.listReceivedOffers as never,
      {} as never,
      token ? { token } : undefined,
    ) as Promise<OffersSnapshot["received"]>;
  },

  async listMarketplace(token) {
    return fetchQuery(
      offersApi.listPublicOffers as never,
      {} as never,
      token ? { token } : undefined,
    ) as Promise<OffersSnapshot["marketplace"]>;
  },

  async create(input, token) {
    return fetchMutation(
      offersApi.createOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<OfferActionResult>;
  },

  async createDraft(input, token) {
    return fetchMutation(
      offersApi.createOfferDraft as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<OfferActionResult>;
  },

  async publish(input, token) {
    return fetchMutation(
      offersApi.publishOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<{ ok: true }>;
  },

  async publishConversation(input, token) {
    return fetchMutation(
      offersApi.publishConversationOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<OfferActionResult>;
  },

  async updateDraft(input, token) {
    return fetchMutation(
      offersApi.updateOfferDraft as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<{ ok: true }>;
  },

  async archive(input, token) {
    return fetchMutation(
      offersApi.archiveOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<{ ok: true }>;
  },

  async getOfferLiveState(input, token) {
    return fetchQuery(
      offersApi.getOfferLiveState as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<OfferLiveState | null>;
  },

  async respond(input, token) {
    await fetchMutation(
      offersApi.updateOfferStatus as never,
      input as never,
      token ? { token } : undefined,
    );
  },

  async apply(input, token) {
    return fetchMutation(
      offersApi.applyToOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<OfferActionResult>;
  },

  async advanceStage(input, token) {
    return fetchMutation(
      offersApi.advanceOfferCaseStage as never,
      input as never,
      token ? { token } : undefined,
    ) as Promise<{ ok: true }>;
  },
};
