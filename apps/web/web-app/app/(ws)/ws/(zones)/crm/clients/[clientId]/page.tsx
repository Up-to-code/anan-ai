import { notFound } from "next/navigation";
import ClientDetailPage from "../../ClientDetailPage";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceCrmZone } from "@/server/ws/zones";
import { mapDealToCrmClientRecord } from "../../crmViewModel";

type WorkspaceCrmClientDetailRouteProps = {
  params: Promise<{ clientId: string }>;
};

/**
 * WHY:   CRM client rows should open into a dedicated client detail page inside the same zone shell.
 * WHAT:  Resolves one real deal-backed client view and renders its detail screen.
 * HOW:   Reads the current CRM zone list and returns 404 when the deal id is unknown.
 */
export default async function WorkspaceCrmClientDetailRoute({
  params,
}: WorkspaceCrmClientDetailRouteProps) {
  const { clientId } = await params;
  const workspace = await requireWorkspaceData(`/ws/crm/clients/${clientId}`);
  const deals = await getWorkspaceCrmZone(workspace.audience, workspace.ownerContext).listDeals();
  const deal = deals.find((entry) => entry.id === clientId) ?? null;
  const client = deal ? mapDealToCrmClientRecord(deal) : null;

  if (!client) {
    notFound();
  }

  return <ClientDetailPage client={client} />;
}
