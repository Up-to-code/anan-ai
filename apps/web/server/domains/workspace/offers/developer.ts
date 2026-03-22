import { requireDeveloperSession } from "@/server/auth/guards";
import type { ResolvedSession } from "@/server/auth/session";
import {
  applyToOfferInputSchema,
  createOfferInputSchema,
  type OfferActionResult,
  publishOfferInputSchema,
  respondToOfferInputSchema,
  type ApplyToOfferInput,
  type CreateOfferInput,
  type OffersSnapshot,
  type PublishOfferInput,
  type RespondToOfferInput,
} from "@/server/contracts/offers";
import { DomainError } from "@/server/contracts/errors";
import { convexOffersRepository, type OffersRepository } from "@/server/infrastructure/convex/offersRepository";

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
  await dependencies.requireDeveloper();

  const [sent, received, marketplace] = await Promise.all([
    dependencies.repository.listSent(),
    dependencies.repository.listReceived(),
    dependencies.repository.listMarketplace(),
  ]);

  return { sent, received, marketplace };
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
  await dependencies.requireDeveloper();
  return dependencies.repository.create(parseOrThrow(createOfferInputSchema.safeParse(input)));
}

export async function publishRedOffer(
  input: PublishOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  await dependencies.requireDeveloper();
  return dependencies.repository.publish(parseOrThrow(publishOfferInputSchema.safeParse(input)));
}

export async function respondToRedOffer(
  input: RespondToOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<void> {
  await dependencies.requireDeveloper();
  await dependencies.repository.respond(parseOrThrow(respondToOfferInputSchema.safeParse(input)));
}

export async function applyToRedOffer(
  input: ApplyToOfferInput,
  dependencies: RedOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  await dependencies.requireDeveloper();
  return dependencies.repository.apply(parseOrThrow(applyToOfferInputSchema.safeParse(input)));
}
