import OfferDetailPage from "@/admin_zone/pages/OfferDetailPage";

type OfferDetailRouteProps = {
  params: Promise<{ offerId: string }>;
};

/**
 * WHY:   Offer review details should keep dynamic param handling separate from page composition.
 * WHAT:  Renders the mocked offer detail page for one offer id.
 * HOW:   Resolves the App Router param and passes it into the page module.
 */
export default async function OfferDetailRoute({ params }: OfferDetailRouteProps) {
  const { offerId } = await params;
  return <OfferDetailPage offerId={offerId} />;
}

