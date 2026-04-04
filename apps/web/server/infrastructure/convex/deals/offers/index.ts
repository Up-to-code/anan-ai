import { fetchMutation, fetchQuery } from "convex/nextjs";
import { offersApi } from "./api";
import type { OffersRepository } from "./types";

export type { OffersRepository } from "./types";

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
    ) as ReturnType<OffersRepository["getQueues"]>;
  },

  async listSent(token) {
    return fetchQuery(
      offersApi.listSentOffers as never,
      {} as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["listSent"]>;
  },

  async listReceived(token) {
    return fetchQuery(
      offersApi.listReceivedOffers as never,
      {} as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["listReceived"]>;
  },

  async listMarketplace(token) {
    return fetchQuery(
      offersApi.listPublicOffers as never,
      {} as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["listMarketplace"]>;
  },

  async create(input, token) {
    return fetchMutation(
      offersApi.createOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["create"]>;
  },

  async createDraft(input, token) {
    return fetchMutation(
      offersApi.createOfferDraft as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["createDraft"]>;
  },

  async publish(input, token) {
    return fetchMutation(
      offersApi.publishOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["publish"]>;
  },

  async publishConversation(input, token) {
    return fetchMutation(
      offersApi.publishConversationOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["publishConversation"]>;
  },

  async updateDraft(input, token) {
    return fetchMutation(
      offersApi.updateOfferDraft as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["updateDraft"]>;
  },

  async archive(input, token) {
    return fetchMutation(
      offersApi.archiveOffer as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["archive"]>;
  },

  async getOfferLiveState(input, token) {
    return fetchQuery(
      offersApi.getOfferLiveState as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["getOfferLiveState"]>;
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
    ) as ReturnType<OffersRepository["apply"]>;
  },

  async advanceStage(input, token) {
    return fetchMutation(
      offersApi.advanceOfferCaseStage as never,
      input as never,
      token ? { token } : undefined,
    ) as ReturnType<OffersRepository["advanceStage"]>;
  },
};
