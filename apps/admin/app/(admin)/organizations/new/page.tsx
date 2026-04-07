import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { newOrganizationTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   Admin operators need a route-backed create form for onboarding organizations in the mocked console.
 * WHAT:  Renders the create-organization editor page.
 * HOW:   Uses the shared entity editor with organization-specific fields and options.
 */
export default function NewOrganizationPage() {
  return (
    <EntityEditorPage
      eyebrow="المنظمات"
      title="إضافة منظمة"
      description="إضافة وسيط أو مطور جديد مع نطاق مالي وحالة تحقق ابتدائية."
      entityLabel="المنظمة"
      mode="create"
      backHref="/organizations"
      tabs={newOrganizationTabs}
      fields={[
        { name: "name", label: "اسم المنظمة", placeholder: "اسم المنظمة" },
        { name: "kind", label: "النوع", type: "select", defaultValue: "developer", options: [{ label: "مطور", value: "developer" }, { label: "وسيط", value: "broker" }] },
        { name: "verificationStatus", label: "حالة التحقق", type: "select", defaultValue: "pending", options: [{ label: "معلّق", value: "pending" }, { label: "قيد المراجعة", value: "in_review" }, { label: "معتمد", value: "approved" }] },
        { name: "documentationStatus", label: "حالة الوثائق", type: "select", defaultValue: "pending_review", options: [{ label: "قيد المراجعة", value: "pending_review" }, { label: "مكتمل", value: "complete" }, { label: "مستند ناقص", value: "missing_document" }] },
        { name: "budgetBand", label: "النطاق المالي", placeholder: "1M - 3M" },
      ]}
    />
  );
}
