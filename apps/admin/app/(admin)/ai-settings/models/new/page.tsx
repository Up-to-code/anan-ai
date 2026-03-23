import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   AI operations need a route-backed create flow for adding new model records in mock mode.
 * WHAT:  Renders the create-model editor page.
 * HOW:   Uses the shared entity editor with model-related token and pricing fields.
 */
export default function NewModelPage() {
  return (
    <EntityEditorPage
      eyebrow="إعدادات الذكاء"
      title="إضافة نموذج"
      description="إضافة نموذج جديد مع المزوّد والفريق والتسعير التشغيلي."
      entityLabel="النموذج"
      mode="create"
      backHref="/ai-settings/models"
      tabs={aiSettingsTabs}
      fields={[
        { name: "name", label: "اسم النموذج", placeholder: "GPT-5" },
        { name: "provider", label: "المزوّد", placeholder: "OpenAI" },
        { name: "team", label: "الفريق", placeholder: "فريق المطابقة" },
        { name: "status", label: "الحالة", type: "select", defaultValue: "active", options: [{ label: "نشط", value: "active" }, { label: "غير نشط", value: "inactive" }] },
        { name: "monthlyTokens", label: "التوكنز الشهرية", type: "number", defaultValue: 0 },
        { name: "burnedTokens", label: "التوكنز المحروقة", type: "number", defaultValue: 0 },
        { name: "pricePerMillion", label: "السعر لكل مليون", type: "number", defaultValue: 0 },
      ]}
    />
  );
}
