import CrmPage from "./CrmPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceCrmZone } from "@/server/ws/zones";
import { mapDealToCrmClientRecord } from "./crmViewModel";

export default async function WorkspaceCrmRoute() {
  const workspace = await requireWorkspaceData("/ws/crm");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const crmZone = getWorkspaceCrmZone(audience, ownerContext);
  const deals = await crmZone.listDeals();

  async function updateStage(input: { dealId: string; stage: "new" | "contacted" | "negotiation" | "won" | "lost" }) {
    "use server";
    await getWorkspaceCrmZone(audience, ownerContext).updateDealStage(input);
  }

  async function updateFollowUp(input: { dealId: string; nextFollowUpAt: number }) {
    "use server";
    await getWorkspaceCrmZone(audience, ownerContext).updateDealFollowUp(input);
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
      onFollowUpChange={updateFollowUp}
      onCreateClient={createQuickClient}
    />
  );
}
