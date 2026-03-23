import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getAgentTeamById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

type DeleteAgentTeamPageProps = {
  params: Promise<{ teamId: string }>;
};

/**
 * WHY:   Agent team management needs a delete confirmation route in the same CRUD language as other sections.
 * WHAT:  Renders the delete-agent-team page.
 * HOW:   Resolves the team title and delegates to the shared delete page.
 */
export default async function DeleteAgentTeamPage({ params }: DeleteAgentTeamPageProps) {
  const { teamId } = await params;
  const team = getAgentTeamById(teamId);

  return (
    <DeleteEntityPage
      eyebrow="إعدادات الذكاء"
      title="حذف فريق وكلاء"
      description="تأكيد حذف فريق الوكلاء من إعدادات الذكاء التجريبية."
      entityLabel="فريق الوكلاء"
      entityName={team?.name ?? "فريق الوكلاء"}
      backHref={team ? `/ai-settings/agents/${team.id}` : "/ai-settings/agents"}
      tabs={aiSettingsTabs}
    />
  );
}
