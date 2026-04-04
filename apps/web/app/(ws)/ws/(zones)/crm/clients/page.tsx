import ClientsPage from "../pages/ClientsPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceCrmZone } from "@/server/ws/zones";
import { mapDealToCrmClientRecord } from "../shared/lib/crmViewModel";

function paginateDeals<T>(rows: T[], cursor: string | null, numItems: number) {
  const offset = cursor ? Number(cursor) : 0;
  const page = rows.slice(offset, offset + numItems);
  const nextOffset = offset + numItems;
  return {
    page,
    isDone: nextOffset >= rows.length,
    continueCursor: nextOffset >= rows.length ? null : String(nextOffset),
  };
}

/**
 * WHY:   The CRM zone needs a flat client index alongside the pipeline board.
 * WHAT:  Renders the real client list with broker and project relations.
 * HOW:   Loads deals through the workspace CRM dispatcher and maps them into the existing client-card props.
 */
export default async function WorkspaceCrmClientsRoute({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; filter?: string }>;
}) {
  const workspace = await requireWorkspaceData("/ws/crm/clients");
  const params = await searchParams;
  const deals = await getWorkspaceCrmZone(workspace.audience, workspace.ownerContext).listDeals();
  const sortedDeals = [...deals].sort((a, b) => b.createdAt - a.createdAt);
  const page = paginateDeals(sortedDeals, params.cursor ?? null, 12);
  return (
    <ClientsPage
      clients={page.page.map((deal) => mapDealToCrmClientRecord(deal))}
      initialFilter={params.filter ?? "all"}
      pagination={{
        cursor: params.cursor ?? null,
        continueCursor: page.continueCursor,
        isDone: page.isDone,
      }}
    />
  );
}
