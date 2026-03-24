import { requireBrokerSession } from "@/server/auth/guards";
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
  await dependencies.requireBroker();

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

export async function createBrokerOffer(
  input: CreateOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  await dependencies.requireBroker();
  return dependencies.repository.create(parseOrThrow(createOfferInputSchema.safeParse(input)));
}

export async function publishBrokerOffer(
  input: PublishOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  await dependencies.requireBroker();
  return dependencies.repository.publish(parseOrThrow(publishOfferInputSchema.safeParse(input)));
}

export async function respondToBrokerOffer(
  input: RespondToOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<void> {
  await dependencies.requireBroker();
  await dependencies.repository.respond(parseOrThrow(respondToOfferInputSchema.safeParse(input)));
}

export async function applyToBrokerOffer(
  input: ApplyToOfferInput,
  dependencies: BrokerOffersDependencies = defaultDependencies,
): Promise<OfferActionResult> {
  await dependencies.requireBroker();
  return dependencies.repository.apply(parseOrThrow(applyToOfferInputSchema.safeParse(input)));
}
