import DealFormScreen from "../../DealFormScreen";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";

/**
 * WHY:   CRM add-client should create a persisted deal/contact record instead of logging mock form data.
 * WHAT:  Renders a simple server-backed client/deal creation form.
 * HOW:   Submits directly to the audience-specific CRM server action and redirects to the CRM board on success.
 */
export default async function AddClientPage() {
  const workspace = await requireWorkspaceData("/ws/crm/clients/add");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const properties = await getWorkspacePropertyZone(audience, ownerContext).listProperties({
    paginationOpts: { cursor: null, numItems: 100 },
  });

  async function createClient(data: {
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
    await getWorkspaceCrmZone(audience, ownerContext).createDeal({
      title: data.name.trim(),
      contactName: data.name.trim(),
      contactPhone: data.phone.trim() || undefined,
      value: Number(data.budget.replace(/[^\d.]/g, "")) || undefined,
      description: data.preference.trim() || undefined,
      propertyId: data.propertyId.trim() || undefined,
      nextFollowUpAt: data.nextFollowUpAt ? Date.parse(data.nextFollowUpAt) : undefined,
      stage: data.stage,
    });
    return { redirectTo: "/ws/crm" };
  }

  return (
    <DealFormScreen
      pageTitle="إضافة عميل جديد"
      pageDescription="أنشئ صفقة CRM جديدة مرتبطة بعميل وعقار اختياري."
      submitLabel="حفظ العميل"
      cancelHref="/ws/crm"
      properties={properties.page.map((property) => ({
        id: property._id,
        title: property.title,
        location: property.location ?? property.address ?? "غير محدد",
      }))}
      initialData={{
        name: "",
        phone: "",
        budget: "",
        preference: "",
        propertyId: "",
        nextFollowUpAt: "",
        stage: "new",
        notes: "",
      }}
      onSubmit={createClient}
    />
  );
}
