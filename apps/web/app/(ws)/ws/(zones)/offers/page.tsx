import OfferOverviewPage from "./OfferOverviewPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import {
  buildOffersRouteBase,
  filterOffersByQuery,
  flattenOffers,
  OFFERS_PAGE_SIZE,
  paginateItems,
  resolvePage,
  resolveSearchQuery,
  resolveSort,
  sortOffers,
  type OffersPageSearchParams,
} from "./offersPageData";

/**
 * WHY:   The offers root route should read like one simple searchable timeline rather than multiple queue sections.
 * WHAT:  Loads the visible offers snapshot, flattens and deduplicates it, then applies search/sort/pagination.
 * HOW:   Uses queue snapshots as the source of truth but projects them into one flat list ordered by update time.
 */
export default async function WorkspaceOffersRoute({
  searchParams,
}: {
  searchParams: Promise<OffersPageSearchParams>;
}) {
  const workspace = await requireWorkspaceData("/ws/offers");
  const snapshot = await getWorkspaceOffersZone(workspace.audience, workspace.ownerContext).getSnapshot();
  const resolvedSearchParams = await searchParams;
  const page = resolvePage(resolvedSearchParams);
  const searchQuery = resolveSearchQuery(resolvedSearchParams);
  const sort = resolveSort(resolvedSearchParams);
  const items = paginateItems(
    sortOffers(
      filterOffersByQuery(flattenOffers(snapshot.queues), searchQuery),
      sort,
    ),
    page,
    OFFERS_PAGE_SIZE,
  );

  return (
    <OfferOverviewPage
      items={items.items}
      pagination={items}
      routeBase={buildOffersRouteBase({ searchQuery, sort })}
      searchQuery={searchQuery}
      sort={sort}
    />
  );
}
