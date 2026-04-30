import type { MutationCtx } from "../../_generated/server";
import {
  advanceOfferCaseStageService,
  archiveOfferService,
  applyToOfferService,
  createOfferDraftService,
  createOfferService,
  publishConversationOfferService,
  publishOfferService,
  updateOfferDraftService,
  updateOfferStatusService,
} from "../../shared_logic/offers/index";
import type {
  AdvanceOfferCaseStageInput,
  ApplyToOfferInput,
  CreateOfferInput,
  OfferIdInput,
  PublishConversationOfferInput,
  UpdateOfferDraftInput,
  UpdateOfferStatusInput,
} from "../../validations/offers";

export async function createOffer(ctx: MutationCtx, input: CreateOfferInput) {
  return await createOfferService(ctx, input);
}

export async function createOfferDraft(ctx: MutationCtx, input: CreateOfferInput) {
  return await createOfferDraftService(ctx, input);
}

export async function updateOfferDraft(ctx: MutationCtx, input: UpdateOfferDraftInput) {
  return await updateOfferDraftService(ctx, input);
}

export async function publishOffer(ctx: MutationCtx, input: OfferIdInput) {
  return await publishOfferService(ctx, input);
}

export async function publishConversationOffer(
  ctx: MutationCtx,
  input: PublishConversationOfferInput,
) {
  return await publishConversationOfferService(ctx, input);
}

export async function archiveOffer(ctx: MutationCtx, input: OfferIdInput) {
  return await archiveOfferService(ctx, input);
}

export async function updateOfferStatus(ctx: MutationCtx, input: UpdateOfferStatusInput) {
  return await updateOfferStatusService(ctx, input);
}

export async function applyToOffer(ctx: MutationCtx, input: ApplyToOfferInput) {
  return await applyToOfferService(ctx, input);
}

export async function advanceOfferCaseStage(
  ctx: MutationCtx,
  input: AdvanceOfferCaseStageInput,
) {
  return await advanceOfferCaseStageService(ctx, input);
}
