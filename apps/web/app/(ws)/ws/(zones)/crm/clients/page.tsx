import ClientsPage from "../ClientsPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { loadCrmPropertyMap, mapDealToCrmClientRecord } from "../crmViewModel";

/**
 * WHY:   The CRM zone needs a flat client index alongside the pipeline board.
 * WHAT:  Renders the real client list with broker and project relations.
 * HOW:   Loads deals through the workspace CRM dispatcher and maps them into the existing client-card props.
 */
export default async function WorkspaceCrmClientsRoute() {
  const workspace = await requireWorkspaceData("/ws/crm/clients");
  const deals = await getWorkspaceCrmZone(workspace.audience, workspace.ownerContext).listDeals();
  const propertyMap = await loadCrmPropertyMap(
    deals,
    (input) => getWorkspacePropertyZone(workspace.audience, workspace.ownerContext).getProperty(input),
  );
  return <ClientsPage clients={deals.map((deal) => mapDealToCrmClientRecord(deal, propertyMap.get(deal.propertyId ?? "") ?? null))} />;
}
