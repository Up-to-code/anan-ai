/**
 * WHY:   Offer case services need a stable import path while the implementation is split by read/write responsibility.
 * WHAT:  Re-exports the folder-backed offer case query and mutation services.
 * HOW:   Keeps existing imports intact and delegates the actual implementation to `offers/cases/`.
 */
export {
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
} from "./cases/index";
