import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   AI operations need a route-backed create flow for adding agent teams into the mocked console.
 * WHAT:  Renders the create-agent-team page.
 * HOW:   Uses the shared editor with team configuration fields and model names.
 */
export default function NewAgentTeamPage() {
  return (
    <EntityEditorPage
      eyebrow="إعدادات الذكاء"
      title="إضافة فريق وكلاء"
      description="إضافة فريق جديد مع النموذج الافتراضي وحد الميزانية."
      entityLabel="فريق الوكلاء"
      mode="create"
      backHref="/ai-settings/agents"
      tabs={aiSettingsTabs}
      fields={[
        { name: "name", label: "اسم الفريق", placeholder: "فريق المطابقة" },
        { name: "defaultModel", label: "النموذج الافتراضي", placeholder: "GPT-5" },
        { name: "fallbackModel", label: "النموذج البديل", placeholder: "Claude Sonnet" },
        { name: "enabled", label: "الحالة", type: "select", defaultValue: "true", options: [{ label: "مفعّل", value: "true" }, { label: "متوقف", value: "false" }] },
        { name: "budgetLimit", label: "حد الميزانية", type: "number", defaultValue: 0 },
        { name: "routingRule", label: "قاعدة التوجيه", type: "textarea", placeholder: "قاعدة التشغيل الأساسية لهذا الفريق." },
      ]}
    />
  );
}
