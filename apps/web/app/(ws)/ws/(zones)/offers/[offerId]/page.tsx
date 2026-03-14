import { notFound } from "next/navigation";
import OfferDetailPage from "../OfferDetailPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import { mapOfferToMarketplaceItem } from "../offerViewModel";
import { bootstrapInboxOfferConversation } from "@/server/domains/inbox/service";

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
  const workspace = await requireWorkspaceData(`/ws/offers/${offerId}`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const offersZone = getWorkspaceOffersZone(audience, ownerContext);
  const snapshot = await offersZone.getSnapshot();
  const sentOffer = snapshot.sent.find((item) => item.id === offerId) ?? null;
  const receivedOffer = snapshot.received.find((item) => item.id === offerId) ?? null;
  const marketplaceOffer = snapshot.marketplace.find((item) => item.id === offerId) ?? null;
  const offerDto = sentOffer ?? receivedOffer ?? marketplaceOffer;
  const offer = offerDto ? mapOfferToMarketplaceItem(offerDto) : null;

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

  const deliveryTarget = pickString(resolvedSearchParams.deliveryTarget);
  const deliveryOrganization = pickString(resolvedSearchParams.deliveryOrganization);
  const deliveryPushStatus = pickString(resolvedSearchParams.deliveryPushStatus);
  const deliveryConversationId = pickString(resolvedSearchParams.deliveryConversationId);
  const isDeliveryPushStatus = (
    value: string | undefined,
  ): value is "pending" | "sent" | "failed" | "skipped" =>
    value === "pending" || value === "sent" || value === "failed" || value === "skipped";
  const initialDeliveryFeedback =
    deliveryTarget && deliveryOrganization && isDeliveryPushStatus(deliveryPushStatus)
      ? {
          targetName: deliveryTarget,
          organizationName: deliveryOrganization,
          pushStatus: deliveryPushStatus,
          conversationId: deliveryConversationId ?? null,
        }
      : null;

  return (
    <OfferDetailPage
      offer={offer}
      onApply={applyToOffer}
      onMessage={messageAboutOffer}
      canApply={Boolean(marketplaceOffer && !sentOffer && !receivedOffer)}
      initialDeliveryFeedback={initialDeliveryFeedback}
    />
  );
}
