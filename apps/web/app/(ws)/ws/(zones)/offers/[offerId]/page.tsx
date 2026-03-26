import { notFound } from "next/navigation";
import OfferDetailPage from "../OfferDetailPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import { mapOfferToMarketplaceItem } from "../offerViewModel";
import { bootstrapInboxOfferConversation } from "@/server/domains/workspace/inbox/service";

type WorkspaceOfferDetailRouteProps = {
  params: Promise<{ offerId: string }>;
  searchParams: Promise<{
    deliveryTarget?: string | string[];
    deliveryOrganization?: string | string[];
    deliveryPushStatus?: string | string[];
    deliveryConversationId?: string | string[];
  }>;
};

function pickString(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildDeliveryFeedback(searchParams: {
  deliveryTarget?: string | string[];
  deliveryOrganization?: string | string[];
  deliveryPushStatus?: string | string[];
  deliveryConversationId?: string | string[];
}) {
  const deliveryTarget = pickString(searchParams.deliveryTarget);
  const deliveryOrganization = pickString(searchParams.deliveryOrganization);
  const deliveryPushStatus = pickString(searchParams.deliveryPushStatus);
  const deliveryConversationId = pickString(searchParams.deliveryConversationId);
  const isDeliveryPushStatus = (
    value: string | undefined,
  ): value is "pending" | "sent" | "failed" | "skipped" =>
    value === "pending" || value === "sent" || value === "failed" || value === "skipped";
  return deliveryTarget && deliveryOrganization && isDeliveryPushStatus(deliveryPushStatus)
    ? {
        targetName: deliveryTarget,
        organizationName: deliveryOrganization,
        pushStatus: deliveryPushStatus,
        conversationId: deliveryConversationId ?? null,
      }
      : null;
}

function resolveOfferSnapshot(args: {
  snapshot: Awaited<ReturnType<ReturnType<typeof getWorkspaceOffersZone>["getSnapshot"]>>;
  offerId: string;
}) {
  const sentOffer = args.snapshot.sent.find((item) => item.id === args.offerId) ?? null;
  const receivedOffer = args.snapshot.received.find((item) => item.id === args.offerId) ?? null;
  const marketplaceOffer = args.snapshot.marketplace.find((item) => item.id === args.offerId) ?? null;
  const offerDto = sentOffer ?? receivedOffer ?? marketplaceOffer;
  return {
    sentOffer,
    receivedOffer,
    marketplaceOffer,
    offer: offerDto ? mapOfferToMarketplaceItem(offerDto) : null,
  };
}

async function loadOfferDetailRouteData(offerId: string) {
  const workspace = await requireWorkspaceData(`/ws/offers/${offerId}`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const offersZone = getWorkspaceOffersZone(audience, ownerContext);
  const snapshot = await offersZone.getSnapshot();
  const liveState = await offersZone.getOfferLiveState(offerId);
  return { audience, ownerContext, liveState, ...resolveOfferSnapshot({ snapshot, offerId }) };
}

/**
 * WHY:   Marketplace cards in the offers zone should open a dedicated item detail surface.
 * WHAT:  Resolves one real offer snapshot item and renders its detail page.
 * HOW:   Searches the current user's marketplace, received, and sent collections and returns 404 when missing.
 */
export default async function WorkspaceOfferDetailRoute({
  params,
  searchParams,
}: WorkspaceOfferDetailRouteProps) {
  const { offerId } = await params;
  const resolvedSearchParams = await searchParams;
  const { audience, ownerContext, sentOffer, receivedOffer, marketplaceOffer, liveState, offer } = await loadOfferDetailRouteData(offerId);
  if (!offer) {
    notFound();
  }
  async function applyToOffer() {
    "use server";
    return getWorkspaceOffersZone(audience, ownerContext).applyToOffer({ offerId });
  }
  async function messageAboutOffer() {
    "use server";
    return bootstrapInboxOfferConversation({ offerId });
  }
  async function archiveOffer() {
    "use server";
    await getWorkspaceOffersZone(audience, ownerContext).archiveOffer({ id: offerId });
    return { redirectTo: "/ws/offers?tab=sent" };
  }
  const initialDeliveryFeedback = buildDeliveryFeedback(resolvedSearchParams);

  return (
    <OfferDetailPage
      offer={offer}
      onApply={applyToOffer}
      onMessage={messageAboutOffer}
      onArchive={archiveOffer}
      canApply={Boolean(marketplaceOffer && !sentOffer && !receivedOffer)}
      canEdit={Boolean(liveState?.canEditDraft)}
      canArchive={Boolean(liveState?.canArchive)}
      editHref={liveState?.canEditDraft ? `/ws/offers/${offerId}/edit` : null}
      initialDeliveryFeedback={initialDeliveryFeedback}
    />
  );
}
