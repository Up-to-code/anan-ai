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
