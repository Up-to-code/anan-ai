import {
  applyToBrokerOffer,
  createBrokerOffer,
  getBrokerOffersSnapshot,
  publishBrokerOffer,
  respondToBrokerOffer,
} from "@/server/broker_zone/offers";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexOffersRepository } from "@/server/infrastructure/convex/offersRepository";
import {
  applyToRedOffer,
  createRedOffer,
  getRedOffersSnapshot,
  publishRedOffer,
  respondToRedOffer,
} from "@/server/red_zone/offers";
import { createUnavailableZoneError } from "./errors";
import { buildWorkspaceScopedSessionResolver } from "./session";

/**
 * WHY:   Offer pages need one audience-aware gateway that hides broker/developer branching from workspace consumers.
 * WHAT:  Returns the current audience's offer snapshot and lifecycle handlers.
 * HOW:   Restores owner context into the session path, then selects the broker or developer offer service bindings.
 */
export function getWorkspaceOffersZone(
  audience: WorkspaceAudience,
  ownerContext?: WorkspaceOwnerContext | null,
) {
  const requireSession = buildWorkspaceScopedSessionResolver(audience, ownerContext);

  if (audience === "broker") {
    return {
      getSnapshot: () => getBrokerOffersSnapshot({ requireBroker: requireSession, repository: convexOffersRepository }),
      createOffer: (input: Parameters<typeof createBrokerOffer>[0]) =>
        createBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      publishOffer: (input: Parameters<typeof publishBrokerOffer>[0]) =>
        publishBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      respondToOffer: (input: Parameters<typeof respondToBrokerOffer>[0]) =>
        respondToBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      applyToOffer: (input: Parameters<typeof applyToBrokerOffer>[0]) =>
        applyToBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
    };
  }

  if (audience === "developer") {
    return {
      getSnapshot: () => getRedOffersSnapshot({ requireDeveloper: requireSession, repository: convexOffersRepository }),
      createOffer: (input: Parameters<typeof createRedOffer>[0]) =>
        createRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      publishOffer: (input: Parameters<typeof publishRedOffer>[0]) =>
        publishRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      respondToOffer: (input: Parameters<typeof respondToRedOffer>[0]) =>
        respondToRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      applyToOffer: (input: Parameters<typeof applyToRedOffer>[0]) =>
        applyToRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
    };
  }

  throw createUnavailableZoneError("Offers");
}
