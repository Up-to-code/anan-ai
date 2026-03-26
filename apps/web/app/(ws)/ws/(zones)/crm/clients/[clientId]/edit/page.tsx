import { notFound } from "next/navigation";
import DealFormScreen from "../../../DealFormScreen";
import { requireWorkspaceData } from "../../../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";

type WorkspaceCrmClientEditRouteProps = {
  params: Promise<{ clientId: string }>;
};

function toDateTimeLocalValue(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * WHY:   CRM users need a dedicated edit screen for mutable deal fields instead of piecemeal inline updates only.
 * WHAT:  Loads one active deal, exposes its editable fields, and wires save/archive actions through the workspace CRM zone.
 * HOW:   Resolves the current owner-scoped workspace, hides missing or archived deals with 404, and returns redirect targets for the client form shell.
 */
export default async function WorkspaceCrmClientEditRoute({
  params,
}: WorkspaceCrmClientEditRouteProps) {
  const { clientId } = await params;
  const workspace = await requireWorkspaceData(`/ws/crm/clients/${clientId}/edit`);
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const crmZone = getWorkspaceCrmZone(audience, ownerContext);
  const propertyZone = getWorkspacePropertyZone(audience, ownerContext);
  const [deals, properties] = await Promise.all([
    crmZone.listDeals(),
    propertyZone.listProperties({ paginationOpts: { cursor: null, numItems: 100 } }),
  ]);
  const deal = deals.find((entry) => entry.id === clientId) ?? null;

  if (!deal) {
    notFound();
  }

  async function updateDeal(data: {
    name: string;
    phone: string;
    budget: string;
    preference: string;
    propertyId: string;
    nextFollowUpAt: string;
    stage: "new" | "contacted" | "negotiation" | "won" | "lost";
    notes: string;
  }) {
    "use server";

    await getWorkspaceCrmZone(audience, ownerContext).updateDeal({
      dealId: clientId,
      title: data.name.trim(),
      contactName: data.name.trim(),
      contactPhone: data.phone.trim() || undefined,
      value: Number(data.budget.replace(/[^\d.]/g, "")) || undefined,
      description: data.preference.trim() || undefined,
      propertyId: data.propertyId.trim() || undefined,
      nextFollowUpAt: data.nextFollowUpAt ? Date.parse(data.nextFollowUpAt) : undefined,
      stage: data.stage,
      notes: data.notes.trim() || undefined,
    });

    return { redirectTo: `/ws/crm/clients/${clientId}` };
  }

  async function archiveDeal() {
    "use server";
    await getWorkspaceCrmZone(audience, ownerContext).archiveDeal({ dealId: clientId });
    return { redirectTo: "/ws/crm" };
  }

  return (
    <DealFormScreen
      pageTitle="تعديل الصفقة"
      pageDescription="حدّث بيانات العميل والصفقة أو قم بأرشفتها دون حذف السجل نهائياً."
      submitLabel="حفظ التعديلات"
      cancelHref={`/ws/crm/clients/${clientId}`}
      properties={properties.page.map((property) => ({
        id: property._id,
        title: property.title,
        location: property.location ?? property.address ?? "غير محدد",
      }))}
      initialData={{
        name: deal.contactName ?? deal.title,
        phone: deal.contactPhone ?? "",
        budget: deal.value ? String(deal.value) : "",
        preference: deal.description ?? "",
        propertyId: deal.propertyId ?? "",
        nextFollowUpAt: toDateTimeLocalValue(deal.nextFollowUpAt),
        stage: deal.stage,
        notes: deal.notes ?? "",
      }}
      onSubmit={updateDeal}
      onArchive={archiveDeal}
    />
  );
}
