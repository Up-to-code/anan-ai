import OfferOverviewPage from "./OfferOverviewPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import { mapOfferToMarketplaceItem } from "./offerViewModel";
import { OFFERS_PAGE_SIZE, paginateItems, resolvePage, type OffersPageSearchParams } from "./offersPageData";


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
  const items = [...snapshot.marketplace, ...snapshot.received, ...snapshot.sent].map(mapOfferToMarketplaceItem);
  const page = resolvePage(await searchParams);
  const paginatedItems = paginateItems(items, page, OFFERS_PAGE_SIZE);

  return (
    <OfferOverviewPage
      items={paginatedItems.items}
      totalItems={paginatedItems.totalItems}
      page={paginatedItems.page}
      pageCount={paginatedItems.pageCount}
      hasPreviousPage={paginatedItems.hasPreviousPage}
      hasNextPage={paginatedItems.hasNextPage}
      routeBase="/ws/offers"
    />
  );
}
