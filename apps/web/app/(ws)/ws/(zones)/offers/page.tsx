import OfferOverviewPage from "./OfferOverviewPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import { mapOfferToMarketplaceItem } from "./offerViewModel";
import {
  OFFERS_PAGE_SIZE,
  paginateItems,
  resolveOffersTab,
  resolvePage,
  type OffersPageSearchParams,
  withOfferFallbackContext,
} from "./offersPageData";


/**
 * WHY:   The offers root route should stay server-first while keeping role dispatch out of the UI.
 * WHAT:  Loads the real offer snapshot and renders the overview page.
 * HOW:   Resolves the workspace audience once and maps marketplace, received, and sent offers into one UI list.
 */
export default async function WorkspaceOffersRoute({
  searchParams,
}: {
  searchParams: Promise<OffersPageSearchParams>;
}) {
  const workspace = await requireWorkspaceData("/ws/offers");
  const snapshot = await getWorkspaceOffersZone(workspace.audience, workspace.ownerContext).getSnapshot();
  const resolvedSearchParams = await searchParams;
  const selectedTab = resolveOffersTab(resolvedSearchParams);
  const items = withOfferFallbackContext([
    ...snapshot.marketplace.map((offer) => mapOfferToMarketplaceItem(offer, "marketplace")),
    ...snapshot.received.map((offer) => mapOfferToMarketplaceItem(offer, "received")),
    ...snapshot.sent.map((offer) => mapOfferToMarketplaceItem(offer, "sent")),
  ]);
  const filteredItems =
    selectedTab === "all" ? items : items.filter((item) => item.source === selectedTab);
  const page = resolvePage(resolvedSearchParams);
  const paginatedItems = paginateItems(filteredItems, page, OFFERS_PAGE_SIZE);

  return (
    <OfferOverviewPage
      items={paginatedItems.items}
      totalItems={paginatedItems.totalItems}
      page={paginatedItems.page}
      pageCount={paginatedItems.pageCount}
      hasPreviousPage={paginatedItems.hasPreviousPage}
      hasNextPage={paginatedItems.hasNextPage}
      routeBase={selectedTab === "all" ? "/ws/offers" : `/ws/offers?tab=${selectedTab}`}
      selectedTab={selectedTab}
    />
  );
}
