import OfferOverviewPage from "./OfferOverviewPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceOffersZone } from "@/server/ws/zones";
import { OFFERS_PAGE_SIZE, paginateQueues, resolvePage, resolveQueue, type OffersPageSearchParams } from "./offersPageData";

/**
 * WHY:   The offers root route should now present role-based collaboration queues instead of the legacy marketplace buckets.
 * WHAT:  Loads the offers 2.0 queue snapshot and renders queue sections for the active workspace audience.
 * HOW:   Resolves the workspace once, reads the queue snapshot from the offers zone, and paginates each queue locally for the route.
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
  const selectedQueue = resolveQueue(
    resolvedSearchParams,
    snapshot.queues.map((queue) => queue.key),
  );
  const queues = paginateQueues(snapshot.queues, page, OFFERS_PAGE_SIZE);

  return <OfferOverviewPage queues={queues} selectedQueue={selectedQueue} />;
}
