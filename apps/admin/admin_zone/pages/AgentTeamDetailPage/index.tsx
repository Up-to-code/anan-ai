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
      eyebrow="فرق وكلاء الذكاء الاصطناعي"
      title={team.name}
      description={team.routingRule}
      tabs={aiSettingsTabs}
      actions={
        <PageActions
          actions={[
            { label: "تعديل الفريق", href: `/ai-settings/agents/${team.id}/edit` },
            { label: "حذف", href: `/ai-settings/agents/${team.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
        <div className="flex items-center justify-between pb-8 border-b border-border/10">
          <div className="space-y-3">
            <h3 className="text-4xl font-black tracking-tighter text-foreground decoration-primary/20 underline decoration-8 underline-offset-8 decoration-skip-ink-none">{team.name}</h3>
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">Team Identifier: {team.id}</p>
          </div>
          <StatusBadge value={team.enabled ? "active" : "inactive"} />
        </div>

        <div className="grid gap-8">
          <KeyValueGrid
            items={[
              { label: "النموذج الافتراضي", value: <span className="font-black text-foreground">{team.defaultModel}</span> },
              { label: "النموذج البديل", value: <span className="font-black text-foreground">{team.fallbackModel}</span> },
              { label: "حد الميزانية", value: <span className="font-black text-foreground">{formatNumber(team.budgetLimit ?? 0)}</span> },
              { label: "حالة التفعيل", value: <span className="font-bold text-primary">{team.enabled ? "متصل ومفعّل" : "متوقف حاليًا"}</span> },
            ]}
            columns={2}
          />
        </div>
      </WorkspacePanel>
    </SectionScaffold>
  );
}
