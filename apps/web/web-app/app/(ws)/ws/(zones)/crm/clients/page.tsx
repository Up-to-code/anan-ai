import ClientsPage from "../ClientsPage";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspaceCrmZone } from "@/server/ws/zones";
import { mapDealToCrmClientRecord } from "../crmViewModel";

/**
 * WHY:   The CRM zone needs a flat client index alongside the pipeline board.
 * WHAT:  Renders the real client list with broker and project relations.
 * HOW:   Loads deals through the workspace CRM dispatcher and maps them into the existing client-card props.
 */
export default async function WorkspaceCrmClientsRoute() {
  const workspace = await requireWorkspaceData("/ws/crm/clients");
  const deals = await getWorkspaceCrmZone(workspace.audience, workspace.ownerContext).listDeals();
  return <ClientsPage clients={deals.map(mapDealToCrmClientRecord)} />;
}
