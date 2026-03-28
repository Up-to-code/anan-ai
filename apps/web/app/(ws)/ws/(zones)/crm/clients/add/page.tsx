import DealFormScreen from "../../DealFormScreen";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import { parsePropertyBody } from "@/server/contracts/properties";

/**
 * WHY:   CRM add-client should create a persisted deal/contact record instead of logging mock form data.
 * WHAT:  Renders a simple server-backed client/deal creation form.
 * HOW:   Submits directly to the audience-specific CRM server action and redirects to the CRM board on success.
 */
export default async function AddClientPage() {
  const workspace = await requireWorkspaceData("/ws/crm/clients/add");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const crmZone = getWorkspaceCrmZone(audience, ownerContext);
  const [properties, clients, brokers] = await Promise.all([
    getWorkspacePropertyZone(audience, ownerContext).listProperties({
      paginationOpts: { cursor: null, numItems: 100 },
    }),
    crmZone.listClients(),
    crmZone.listBrokers(),
  ]);

  async function createClient(data: {
    name: string;
    phone: string;
    budget: string;
    preference: string;
    propertyId: string;
    relationType: string;
    crmClientId: string;
    relatedBrokerId: string;
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
      relationType: data.relationType,
      crmClientId: data.crmClientId.trim() || undefined,
      relatedBrokerId: data.relatedBrokerId.trim() || undefined,
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
      projects={properties.page.map((property) => ({
        id: property._id,
        title: property.title,
        image:
          property.heroImage?.url ??
          property.media?.[0]?.url ??
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
        location: property.location ?? property.address ?? "غير محدد",
        priceLabel: `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(property.price)} ر.س`,
        summary:
          parsePropertyBody(property.body)?.presentation?.descriptionShort ??
          property.description ??
          "نبذة المشروع غير متاحة بعد.",
      }))}
      clients={clients}
      brokers={brokers}
      initialData={{
        name: "",
        phone: "",
        budget: "",
        preference: "",
        propertyId: "",
        relationType: "internal_client",
        crmClientId: "",
        relatedBrokerId: "",
        nextFollowUpAt: "",
        stage: "new",
        notes: "",
      }}
      onSubmit={createClient}
    />
  );
}
