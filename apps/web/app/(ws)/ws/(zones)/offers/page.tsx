import OfferOverviewPage from "./pages/OfferOverviewPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import {
  buildOfferFilterOptions,
  buildOffersRouteBase,
  filterOffers,
  flattenOffers,
  OFFERS_PAGE_SIZE,
  paginateItems,
  resolvePage,
  resolveFilters,
  resolveSort,
  sortOffers,
  type OffersPageSearchParams,
} from "./shared/lib/offersPageData";

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
  const sort = resolveSort(resolvedSearchParams);
  const filters = resolveFilters(resolvedSearchParams);
  const allOffers = flattenOffers(snapshot.queues);
  const filterOptions = buildOfferFilterOptions(allOffers);
  const items = paginateItems(
    sortOffers(
      filterOffers(allOffers, { searchQuery: "", filters }),
      sort,
    ),
    page,
    OFFERS_PAGE_SIZE,
  );

  return (
    <OfferOverviewPage
      items={items.items}
      pagination={items}
      routeBase={buildOffersRouteBase({ searchQuery: "", sort, filters })}
      filterOptions={filterOptions}
      sort={sort}
      filters={filters}
    />
  );
}
