import {
  applyToBrokerOffer,
  advanceBrokerOfferCase,
  archiveBrokerOffer,
  createBrokerOfferDraft,
  createBrokerOffer,
  getBrokerOfferLiveState,
  getBrokerOffersSnapshot,
  publishBrokerConversationOffer,
  publishBrokerOffer,
  respondToBrokerOffer,
  updateBrokerOfferDraft,
} from "@/server/domains/workspace/offers/broker";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexOffersRepository } from "@/server/infrastructure/convex/deals/offers";
import {
  applyToRedOffer,
  advanceRedOfferCase,
  archiveRedOffer,
  createRedOfferDraft,
  createRedOffer,
  getRedOfferLiveState,
  getRedOffersSnapshot,
  publishRedConversationOffer,
  publishRedOffer,
  respondToRedOffer,
  updateRedOfferDraft,
} from "@/server/domains/workspace/offers/developer";
import { createUnavailableZoneError } from "../shared/errors";
import { buildWorkspaceScopedSessionResolver } from "../session";

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
      createOfferDraft: (input: Parameters<typeof createBrokerOfferDraft>[0]) =>
        createBrokerOfferDraft(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      publishOffer: (input: Parameters<typeof publishBrokerOffer>[0]) =>
        publishBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      publishConversationOffer: (input: Parameters<typeof publishBrokerConversationOffer>[0]) =>
        publishBrokerConversationOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      updateOfferDraft: (input: Parameters<typeof updateBrokerOfferDraft>[0]) =>
        updateBrokerOfferDraft(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      archiveOffer: (input: Parameters<typeof archiveBrokerOffer>[0]) =>
        archiveBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      getOfferLiveState: (offerId: string) =>
        getBrokerOfferLiveState(offerId, { requireBroker: requireSession, repository: convexOffersRepository }),
      respondToOffer: (input: Parameters<typeof respondToBrokerOffer>[0]) =>
        respondToBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      applyToOffer: (input: Parameters<typeof applyToBrokerOffer>[0]) =>
        applyToBrokerOffer(input, { requireBroker: requireSession, repository: convexOffersRepository }),
      advanceCaseStage: (input: Parameters<typeof advanceBrokerOfferCase>[0]) =>
        advanceBrokerOfferCase(input, { requireBroker: requireSession, repository: convexOffersRepository }),
    };
  }

  if (audience === "developer") {
    return {
      getSnapshot: () => getRedOffersSnapshot({ requireDeveloper: requireSession, repository: convexOffersRepository }),
      createOffer: (input: Parameters<typeof createRedOffer>[0]) =>
        createRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      createOfferDraft: (input: Parameters<typeof createRedOfferDraft>[0]) =>
        createRedOfferDraft(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      publishOffer: (input: Parameters<typeof publishRedOffer>[0]) =>
        publishRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      publishConversationOffer: (input: Parameters<typeof publishRedConversationOffer>[0]) =>
        publishRedConversationOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      updateOfferDraft: (input: Parameters<typeof updateRedOfferDraft>[0]) =>
        updateRedOfferDraft(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      archiveOffer: (input: Parameters<typeof archiveRedOffer>[0]) =>
        archiveRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      getOfferLiveState: (offerId: string) =>
        getRedOfferLiveState(offerId, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      respondToOffer: (input: Parameters<typeof respondToRedOffer>[0]) =>
        respondToRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      applyToOffer: (input: Parameters<typeof applyToRedOffer>[0]) =>
        applyToRedOffer(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
      advanceCaseStage: (input: Parameters<typeof advanceRedOfferCase>[0]) =>
        advanceRedOfferCase(input, { requireDeveloper: requireSession, repository: convexOffersRepository }),
    };
  }

  throw createUnavailableZoneError("Offers");
}
