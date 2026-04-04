import { requireDeveloperSession } from "@/server/auth/guards";
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

type RedOffersDependencies = {
  requireDeveloper: () => Promise<ResolvedSession>;
  repository: OffersRepository;
};

const defaultDependencies: RedOffersDependencies = {
  requireDeveloper: requireDeveloperSession,
  repository: convexOffersRepository,
};

/**
 * WHY:   Developer workspace offer pages need one RED-owned server entrypoint instead of direct Convex queries.
 * WHAT:  Returns the sent, received, and marketplace offer lists visible to the current developer.
 * HOW:   First enforces a valid developer session, then loads the shared offer projections in parallel.
 */
export async function getRedOffersSnapshot(
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<OffersSnapshot> {
  const session = await dependencies.requireDeveloper();
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

export async function createRedOffer(
  input: CreateOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireDeveloper();
  return dependencies.repository.create(parseOrThrow(createOfferInputSchema.safeParse(input)), session.token);
}

export async function publishRedOffer(
  input: PublishOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireDeveloper();
  return dependencies.repository.publish(parseOrThrow(publishOfferInputSchema.safeParse(input)), session.token);
}

export async function publishRedConversationOffer(
  input: PublishConversationOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireDeveloper();
  return dependencies.repository.publishConversation(parseOrThrow(publishConversationOfferInputSchema.safeParse(input)), session.token);
}

export async function createRedOfferDraft(
  input: CreateOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireDeveloper();
  return dependencies.repository.createDraft(parseOrThrow(createOfferInputSchema.safeParse(input)), session.token);
}

export async function updateRedOfferDraft(
  input: UpdateOfferDraftInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireDeveloper();
  const liveState = await dependencies.repository.getOfferLiveState({ offerId: input.id }, session.token);
  if (!liveState) {
    throw new DomainError({ code: "NOT_FOUND", message: "Offer not found", status: 404 });
  }
  if (!liveState.isOwner || !liveState.canEditDraft) {
    throw new DomainError({ code: "FORBIDDEN", message: "Only owner-editable drafts can be updated", status: 403 });
  }
  return dependencies.repository.updateDraft(parseOrThrow(updateOfferDraftInputSchema.safeParse(input)), session.token);
}

export async function getRedOfferLiveState(
  offerId: string,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<OfferLiveState | null> {
  const session = await dependencies.requireDeveloper();
  return dependencies.repository.getOfferLiveState({ offerId }, session.token);
}

export async function respondToRedOffer(
  input: RespondToOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<void> {
  const session = await dependencies.requireDeveloper();
  await dependencies.repository.respond(parseOrThrow(respondToOfferInputSchema.safeParse(input)), session.token);
}

export async function applyToRedOffer(
  input: ApplyToOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  const session = await dependencies.requireDeveloper();
  return dependencies.repository.apply(parseOrThrow(applyToOfferInputSchema.safeParse(input)), session.token);
}

export async function advanceRedOfferCase(
  input: AdvanceOfferCaseStageInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireDeveloper();
  return dependencies.repository.advanceStage(input, session.token);
}

/**
 * WHY:   Developer workspaces need a soft archive path for owned pending offers without exposing hard deletes.
 * WHAT:  Archives one developer-owned pending offer.
 * HOW:   Validates the payload, confirms the current caller owns an archivable live offer, then delegates the state change to the repository.
 */
export async function archiveRedOffer(
  input: ArchiveOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const session = await dependencies.requireDeveloper();
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
