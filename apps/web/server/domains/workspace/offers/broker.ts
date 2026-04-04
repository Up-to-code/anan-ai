import { requireBrokerSession } from "@/server/auth/guards";
import type { ResolvedSession } from "@/server/auth/session";
import {
  applyToOfferInputSchema,
  archiveOfferInputSchema,
  createOfferInputSchema,
  type OfferActionResult,
  type AdvanceOfferCaseStageInput,
  type OfferLiveState,
  publishConversationOfferInputSchema,
  publishOfferInputSchema,
  respondToOfferInputSchema,
  type ApplyToOfferInput,
  type ArchiveOfferInput,
  type CreateOfferInput,
  type OffersSnapshot,
  type PublishConversationOfferInput,
  type PublishOfferInput,
  type RespondToOfferInput,
  type UpdateOfferDraftInput,
  updateOfferDraftInputSchema,
} from "@/server/contracts/offers";
import { DomainError } from "@/server/contracts/errors";
import { convexOffersRepository, type OffersRepository } from "@/server/infrastructure/convex/deals/offers";

type BrokerOffersDependencies = {
  requireBroker: () => Promise<ResolvedSession>;
  repository: OffersRepository;
};

const defaultDependencies: BrokerOffersDependencies = {
  requireBroker: requireBrokerSession,
  repository: convexOffersRepository,
};

/**
 * WHY:   Broker workspace offer pages need one broker-owned entrypoint for all visible offer lists.
 * WHAT:  Returns the sent, received, and marketplace offer projections for the current broker.
 * HOW:   Enforces the broker session first, then reads the auth-scoped shared offer lists in parallel.
 */
export async function getBrokerOffersSnapshot(
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OffersSnapshot> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.getQueues(session.token);
}

function parseOrThrow<T>(result: { success: true; data: T } | { success: false; error: { issues?: { message?: string }[] } }) {
  if (result.success) {
    return result.data;
  }

  throw new DomainError({
    code: "INVALID_ARGUMENT",
    message: result.error.issues?.[0]?.message ?? "Invalid offer payload",
    status: 400,
  });
}

export async function createBrokerOffer(
  input: CreateOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.create(parseOrThrow(createOfferInputSchema.safeParse(input)), session.token);
}

export async function publishBrokerOffer(
  input: PublishOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.publish(parseOrThrow(publishOfferInputSchema.safeParse(input)), session.token);
}

export async function publishBrokerConversationOffer(
  input: PublishConversationOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.publishConversation(parseOrThrow(publishConversationOfferInputSchema.safeParse(input)), session.token);
}

export async function createBrokerOfferDraft(
  input: CreateOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.createDraft(parseOrThrow(createOfferInputSchema.safeParse(input)), session.token);
}

export async function updateBrokerOfferDraft(
  input: UpdateOfferDraftInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireBroker();
  const liveState = await dependencies.repository.getOfferLiveState({ offerId: input.id }, session.token);
  if (!liveState) {
    throw new DomainError({ code: "NOT_FOUND", message: "Offer not found", status: 404 });
  }
  if (!liveState.isOwner || !liveState.canEditDraft) {
    throw new DomainError({ code: "FORBIDDEN", message: "Only owner-editable drafts can be updated", status: 403 });
  }
  return dependencies.repository.updateDraft(parseOrThrow(updateOfferDraftInputSchema.safeParse(input)), session.token);
}

export async function getBrokerOfferLiveState(
  offerId: string,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OfferLiveState | null> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.getOfferLiveState({ offerId }, session.token);
}

export async function respondToBrokerOffer(
  input: RespondToOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireBroker();
  await dependencies.repository.respond(parseOrThrow(respondToOfferInputSchema.safeParse(input)), session.token);
}

export async function applyToBrokerOffer(
  input: ApplyToOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.apply(parseOrThrow(applyToOfferInputSchema.safeParse(input)), session.token);
}

export async function advanceBrokerOfferCase(
  input: AdvanceOfferCaseStageInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireBroker();
  return dependencies.repository.advanceStage(input, session.token);
}

/**
 * WHY:   Broker workspaces need a soft archive path for owned pending offers without exposing hard deletes.
 * WHAT:  Archives one broker-owned pending offer.
 * HOW:   Validates the payload, confirms the current caller owns an archivable live offer, then delegates the state change to the repository.
 */
export async function archiveBrokerOffer(
  input: ArchiveOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireBroker();
  const parsed = parseOrThrow(archiveOfferInputSchema.safeParse(input));
  const liveState = await dependencies.repository.getOfferLiveState({ offerId: parsed.id }, session.token);
  if (!liveState) {
    throw new DomainError({ code: "NOT_FOUND", message: "Offer not found", status: 404 });
  }
  if (!liveState.isOwner || !liveState.canArchive) {
    throw new DomainError({ code: "FORBIDDEN", message: "Only owner-controlled pending offers can be archived", status: 403 });
  }
  return dependencies.repository.archive(parsed, session.token);
}
