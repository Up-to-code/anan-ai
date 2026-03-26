import { notFound, redirect } from "next/navigation";
import ClientDetailPage from "../../ClientDetailPage";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapDealToCrmClientRecord } from "../../crmViewModel";

type WorkspaceCrmClientDetailRouteProps = {
  params: Promise<{ clientId: string }>;
};

function getCurrentTimestamp() {
  return Number(new Date());
}

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
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const crmZone = getWorkspaceCrmZone(audience, ownerContext);
  const propertyZone = getWorkspacePropertyZone(audience, ownerContext);
  const deals = await crmZone.listDeals();
  const deal = deals.find((entry) => entry.id === clientId) ?? null;
  const property = deal?.propertyId ? await propertyZone.getProperty({ id: deal.propertyId }) : null;
  const client = deal ? mapDealToCrmClientRecord(deal, property) : null;

  if (!client) {
    notFound();
  }

  async function updateFollowUp(formData: FormData) {
    "use server";

    const nextFollowUpRaw = String(formData.get("nextFollowUpAt") ?? "").trim();
    const nextFollowUpAt = Date.parse(nextFollowUpRaw);
    if (!nextFollowUpRaw || Number.isNaN(nextFollowUpAt)) return;

    await getWorkspaceCrmZone(audience, ownerContext).updateDealFollowUp({
      dealId: clientId,
      nextFollowUpAt,
    });

    redirect(`/ws/crm/clients/${clientId}`);
  }

  return (
    <ClientDetailPage
      client={client}
      nowTimestamp={getCurrentTimestamp()}
      onFollowUpSubmit={updateFollowUp}
      editHref={`/ws/crm/clients/${clientId}/edit`}
    />
  );
}
