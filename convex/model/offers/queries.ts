import type { QueryCtx } from "../../_generated/server";
import {
  getOfferLiveStateService,
  getWorkspaceOfferQueuesService,
  listConversationPrivateOfferDraftsService,
  listPublicOffersService,
  listReceivedOffersService,
  listSentOffersService,
} from "../../shared_logic/offers/index";
import type {
  ConversationPrivateOfferDraftsInput,
  OfferLiveStateInput,
} from "../../validations/offers";

export async function listSentOffers(ctx: QueryCtx) {
  return await listSentOffersService(ctx);
}

export async function listReceivedOffers(ctx: QueryCtx) {
  return await listReceivedOffersService(ctx);
}

export async function listPublicOffers(ctx: QueryCtx) {
  return await listPublicOffersService(ctx);
}

export async function listConversationPrivateOfferDrafts(
  ctx: QueryCtx,
  input: ConversationPrivateOfferDraftsInput,
) {
  return await listConversationPrivateOfferDraftsService(ctx, input);
}

export async function getOfferLiveState(ctx: QueryCtx, input: OfferLiveStateInput) {
  return await getOfferLiveStateService(ctx, input);
}

export async function getWorkspaceOfferQueues(ctx: QueryCtx) {
  return await getWorkspaceOfferQueuesService(ctx);
}
