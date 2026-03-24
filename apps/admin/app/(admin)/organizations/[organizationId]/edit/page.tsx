import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getOrganizationById } from "@/admin_zone/mocks/data";
import { organizationDetailTabs, organizationsTabs } from "@/lib/adminSectionTabs";

type EditOrganizationPageProps = {
  params: Promise<{ organizationId: string }>;
};

/**
 * WHY:   Organization detail pages need an edit route with the current values prefilled.
 * WHAT:  Renders the organization editor page.
 * HOW:   Resolves the organization by id and passes its values into the shared entity editor.
 */
export default async function EditOrganizationPage({ params }: EditOrganizationPageProps) {
  const { organizationId } = await params;
  const organization = getOrganizationById(organizationId);

  return (
    <EntityEditorPage
      eyebrow="المنظمات"
      title={`تعديل ${organization?.name ?? "المنظمة"}`}
      description="تحديث بيانات المنظمة والتحقق والوثائق داخل الواجهة التجريبية."
      entityLabel="المنظمة"
      mode="edit"
      backHref={organization ? `/organizations/${organization.id}` : "/organizations"}
      tabs={organization ? organizationDetailTabs(organization.id) : organizationsTabs}
      fields={[
        { name: "name", label: "اسم المنظمة", defaultValue: organization?.name ?? "" },
        { name: "kind", label: "النوع", type: "select", defaultValue: organization?.kind ?? "developer", options: [{ label: "مطور", value: "developer" }, { label: "وسيط", value: "broker" }] },
        { name: "verificationStatus", label: "حالة التحقق", type: "select", defaultValue: organization?.verificationStatus ?? "pending", options: [{ label: "معلّق", value: "pending" }, { label: "قيد المراجعة", value: "in_review" }, { label: "معتمد", value: "approved" }] },
        { name: "documentationStatus", label: "حالة الوثائق", type: "select", defaultValue: organization?.documentationStatus ?? "pending_review", options: [{ label: "قيد المراجعة", value: "pending_review" }, { label: "مكتمل", value: "complete" }, { label: "مستند ناقص", value: "missing_document" }] },
        { name: "budgetBand", label: "النطاق المالي", defaultValue: organization?.budgetBand ?? "" },
      ]}
    />
  );
}
