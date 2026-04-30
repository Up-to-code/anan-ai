import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type OffersApiRefs = {
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

export const offersApi = createRepositoryRefs<OffersApiRefs>(apiUnsafe, "shared_logic/offers");
