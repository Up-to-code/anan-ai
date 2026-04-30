import { mutationRef, publicMutationRef, publicQueryRef, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { offersApi } from "./api";
import type { OffersRepository } from "./types";

export type { OffersRepository } from "./types";

function queryMaybeToken<TResult>(token: string | undefined, ref: unknown, args: unknown) {
  return token ? queryRef<TResult>(token, ref, args) : publicQueryRef<TResult>(ref, args);
}

function mutationMaybeToken<TResult>(token: string | undefined, ref: unknown, args: unknown) {
  return token ? mutationRef<TResult>(token, ref, args) : publicMutationRef<TResult>(ref, args);
}

/**
 * WHY:   Workspace offer pages should consume the new case-domain queries through one stable repository interface.
 * WHAT:  Adapts the shared Convex offers 2.0 capability into web-facing DTOs and mutations.
 * HOW:   Calls the auth-scoped Convex handlers through `apiUnsafe`, preserving transport isolation at the server layer.
 */
export const convexOffersRepository: OffersRepository = {
  async getQueues(token) {
    return queryMaybeToken<Awaited<ReturnType<OffersRepository["getQueues"]>>>(
      token,
      offersApi.getWorkspaceOfferQueues,
      {},
    );
  },

  async listSent(token) {
    return queryMaybeToken<Awaited<ReturnType<OffersRepository["listSent"]>>>(token, offersApi.listSentOffers, {});
  },

  async listReceived(token) {
    return queryMaybeToken<Awaited<ReturnType<OffersRepository["listReceived"]>>>(
      token,
      offersApi.listReceivedOffers,
      {},
    );
  },

  async listMarketplace(token) {
    return queryMaybeToken<Awaited<ReturnType<OffersRepository["listMarketplace"]>>>(
      token,
      offersApi.listPublicOffers,
      {},
    );
  },

  async create(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["create"]>>>(token, offersApi.createOffer, input);
  },

  async createDraft(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["createDraft"]>>>(
      token,
      offersApi.createOfferDraft,
      input,
    );
  },

  async publish(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["publish"]>>>(token, offersApi.publishOffer, input);
  },

  async publishConversation(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["publishConversation"]>>>(
      token,
      offersApi.publishConversationOffer,
      input,
    );
  },

  async updateDraft(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["updateDraft"]>>>(
      token,
      offersApi.updateOfferDraft,
      input,
    );
  },

  async archive(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["archive"]>>>(token, offersApi.archiveOffer, input);
  },

  async getOfferLiveState(input, token) {
    return queryMaybeToken<Awaited<ReturnType<OffersRepository["getOfferLiveState"]>>>(
      token,
      offersApi.getOfferLiveState,
      input,
    );
  },

  async respond(input, token) {
    if (token) {
      await voidMutationRef(token, offersApi.updateOfferStatus, input);
      return;
    }
    await publicMutationRef(offersApi.updateOfferStatus, input);
  },

  async apply(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["apply"]>>>(token, offersApi.applyToOffer, input);
  },

  async advanceStage(input, token) {
    return mutationMaybeToken<Awaited<ReturnType<OffersRepository["advanceStage"]>>>(
      token,
      offersApi.advanceOfferCaseStage,
      input,
    );
  },
};
