import CrmPage from "./CrmPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceCrmZone } from "@/server/ws/zones";
import { mapDealToCrmClientRecord } from "./crmViewModel";

/**
 * WHY:   The CRM root route should stay server-first and audience-aware.
 * WHAT:  Loads the real deal pipeline and renders the interactive CRM workspace.
 * HOW:   Resolves the CRM zone once, then passes real stage-change and quick-create actions to the client board.
 */
export default async function WorkspaceCrmRoute() {
  const workspace = await requireWorkspaceData("/ws/crm");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const crmZone = getWorkspaceCrmZone(audience, ownerContext);
  const deals = await crmZone.listDeals();

  async function updateStage(input: { dealId: string; stage: "new" | "contacted" | "negotiation" | "won" }) {
    "use server";

    await getWorkspaceCrmZone(audience, ownerContext).updateDealStage(input);
  }

  async function createQuickClient(input: { name: string }) {
    "use server";

    await getWorkspaceCrmZone(audience, ownerContext).createDeal({
      title: input.name,
      stage: "new",
      contactName: input.name,
    });
  }

  return (
    <CrmPage
      clients={deals.map(mapDealToCrmClientRecord)}
      onStageChange={updateStage}
      onCreateClient={createQuickClient}
    />
  );
}
