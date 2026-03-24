import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getAgentTeamById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";
import { formatNumber } from "@/lib/format";

type AgentTeamDetailPageProps = {
  teamId: string;
};

/**
 * WHY:   Agent-team configuration should have a dedicated route before editing limits, routing, or deleting a team entry.
 * WHAT:  Renders one agent team and its configuration snapshot.
 * HOW:   Resolves the team from the mock repository and displays it with shared detail components.
 */
export default function AgentTeamDetailPage({ teamId }: AgentTeamDetailPageProps) {
  const team = getAgentTeamById(teamId);

  if (!team) {
    return <EmptyState title="الفريق غير موجود" description="تعذر العثور على فريق الوكلاء المطلوب." />;
  }

  return (
    <SectionScaffold
      eyebrow="إعدادات الذكاء"
      title={team.name}
      description={team.routingRule}
      tabs={aiSettingsTabs}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/ai-settings/agents/${team.id}/edit` },
            { label: "حذف", href: `/ai-settings/agents/${team.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge value={team.enabled ? "active" : "inactive"} />
        </div>
        <KeyValueGrid
          items={[
            { label: "النموذج الافتراضي", value: team.defaultModel },
            { label: "النموذج البديل", value: team.fallbackModel },
            { label: "حد الميزانية", value: formatNumber(team.budgetLimit) },
            { label: "الحالة", value: team.enabled ? "مفعّل" : "متوقف" },
            { label: "المعرّف", value: team.id },
          ]}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}
