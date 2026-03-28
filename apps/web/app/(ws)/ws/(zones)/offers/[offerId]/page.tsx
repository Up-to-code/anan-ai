import { notFound } from "next/navigation";
import OfferDetailPage from "../OfferDetailPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import { bootstrapInboxOfferConversation } from "@/server/domains/workspace/inbox/service";

/**
 * WHY:   Each offers 2.0 case needs a dedicated workspace surface with actions, participants, and activity.
 * WHAT:  Loads one case detail from the new offers zone and renders the case workspace.
 * HOW:   Resolves the workspace audience once, reads the case detail, and wires its stage actions to server mutations.
 */
export default async function WorkspaceOfferDetailRoute({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const workspace = await requireWorkspaceData(`/ws/offers/${offerId}`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const offersZone = getWorkspaceOffersZone(audience, ownerContext);
  const offer = await offersZone.getOfferLiveState(offerId);
  if (!offer) {
    notFound();
  }

  async function engageOffer() {
    "use server";
    return getWorkspaceOffersZone(audience, ownerContext).applyToOffer({ offerId });
  }

  async function respondToOffer(status: "accepted" | "rejected") {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).respondToOffer({ id: offerId, status });
  }

  async function publishOffer() {
    "use server";
    return getWorkspaceOffersZone(audience, ownerContext).publishOffer({ id: offerId });
  }

  async function advanceOfferCase(action: "mark_agreed" | "close_won" | "close_lost") {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).advanceCaseStage({ id: offerId, action });
  }

  async function messageAboutOffer() {
    "use server";
    return bootstrapInboxOfferConversation({ offerId });
  }
  async function archiveOffer() {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).archiveOffer({ id: offerId });
    return { redirectTo: "/ws/offers" };
  }

  return (
    <OfferDetailPage
      offer={offer}
      onMessage={messageAboutOffer}
      onArchive={archiveOffer}
      onPublish={offer.canPublish ? publishOffer : undefined}
      onEngage={offer.allowedActions?.canEngage ? engageOffer : undefined}
      onRespond={offer.canRespond ? respondToOffer : undefined}
      onAdvanceStage={advanceOfferCase}
      editHref={offer.canEditDraft ? `/ws/offers/${offerId}/edit` : null}
    />
  );
}
