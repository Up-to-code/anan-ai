"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/shared/Button";
import { AdminInput } from "@/components/shared/AdminFieldControls";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";
import type { AgentTeamRecord } from "@/admin_zone/mocks/types";

type AgentsSettingsClientProps = {
  teams: AgentTeamRecord[];
};

/**
 * WHY:   Agent-team settings need a UI surface to test team-level toggles and budget edits before backend wiring.
 * WHAT:  Renders team cards with local-only enable and budget adjustments.
 * HOW:   Stores the agent team array in local component state and updates it in memory on interaction.
 */
export default function AgentsSettingsClient({ teams }: AgentsSettingsClientProps) {
  const [agentTeams, setAgentTeams] = useState(teams);

  function toggleTeam(id: string) {
    setAgentTeams((current) => current.map((team) => (team.id === id ? { ...team, enabled: !team.enabled } : team)));
  }

  function updateBudget(id: string, budgetLimit: number) {
    setAgentTeams((current) => current.map((team) => (team.id === id ? { ...team, budgetLimit } : team)));
  }

  return (
    <SectionScaffold
      eyebrow="إعدادات الذكاء"
      title="فرق الوكلاء"
      description="إدارة الفرق، النموذج الافتراضي، وحدود الميزانية لكل فريق."
      tabs={aiSettingsTabs}
      actions={<PageActions actions={[{ label: "إضافة فريق", href: "/ai-settings/agents/new" }]} />}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {agentTeams.map((team) => (
          <WorkspacePanel key={team.id} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Link href={`/ai-settings/agents/${team.id}`} className="text-lg font-semibold text-slate-900 hover:underline">
                  {team.name}
                </Link>
                <div className="text-sm text-slate-500">{team.routingRule}</div>
              </div>
              <StatusBadge value={team.enabled ? "active" : "inactive"} />
            </div>
            <KeyValueGrid
              items={[
                { label: "النموذج الافتراضي", value: team.defaultModel },
                { label: "النموذج البديل", value: team.fallbackModel },
              ]}
            />
            <div className="space-y-2">
              <div className="text-sm text-slate-700">حد الميزانية</div>
              <AdminInput type="number" value={team.budgetLimit} onChange={(event) => updateBudget(team.id, Number(event.target.value) || 0)} />
            </div>
            <Button variant={team.enabled ? "outline" : "primary"} onClick={() => toggleTeam(team.id)}>
              {team.enabled ? "إيقاف مؤقت" : "تفعيل الفريق"}
            </Button>
            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
              <Link href={`/ai-settings/agents/${team.id}/edit`} className="underline-offset-2 hover:underline">تعديل</Link>
              <Link href={`/ai-settings/agents/${team.id}/delete`} className="underline-offset-2 hover:underline">حذف</Link>
            </div>
          </WorkspacePanel>
        ))}
      </div>
    </SectionScaffold>
  );
}
