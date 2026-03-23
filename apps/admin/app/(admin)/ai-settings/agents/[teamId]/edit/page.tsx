import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getAgentTeamById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

type EditAgentTeamPageProps = {
  params: Promise<{ teamId: string }>;
};

/**
 * WHY:   Agent teams need an edit route with their current configuration prefilled.
 * WHAT:  Renders the edit-agent-team page.
 * HOW:   Resolves the team by id and forwards its values into the shared editor.
 */
export default async function EditAgentTeamPage({ params }: EditAgentTeamPageProps) {
  const { teamId } = await params;
  const team = getAgentTeamById(teamId);

  return (
    <EntityEditorPage
      eyebrow="إعدادات الذكاء"
      title={`تعديل ${team?.name ?? "فريق الوكلاء"}`}
      description="تحديث النموذج الافتراضي وحدود الميزانية وقاعدة التوجيه."
      entityLabel="فريق الوكلاء"
      mode="edit"
      backHref={team ? `/ai-settings/agents/${team.id}` : "/ai-settings/agents"}
      tabs={aiSettingsTabs}
      fields={[
        { name: "name", label: "اسم الفريق", defaultValue: team?.name ?? "" },
        { name: "defaultModel", label: "النموذج الافتراضي", defaultValue: team?.defaultModel ?? "" },
        { name: "fallbackModel", label: "النموذج البديل", defaultValue: team?.fallbackModel ?? "" },
        { name: "enabled", label: "الحالة", type: "select", defaultValue: team?.enabled ? "true" : "false", options: [{ label: "مفعّل", value: "true" }, { label: "متوقف", value: "false" }] },
        { name: "budgetLimit", label: "حد الميزانية", type: "number", defaultValue: team?.budgetLimit ?? 0 },
        { name: "routingRule", label: "قاعدة التوجيه", type: "textarea", defaultValue: team?.routingRule ?? "" },
      ]}
    />
  );
}
