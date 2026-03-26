"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/shared/Button";
import { AdminInput } from "@/components/shared/AdminFieldControls";
import FormField from "@/components/shared/FormField";
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
      title="فرق وكلاء عنان"
      description="إدارة الفرق، القواعد التوجيهية، وميزانيات التشغيل لكل وحدة ذكاء."
      tabs={aiSettingsTabs}
      actions={<PageActions actions={[{ label: "إضافة فريق", href: "/ai-settings/agents/new" }]} />}
    >
      <div className="grid gap-8 xl:grid-cols-3">
        {agentTeams.map((team) => (
          <WorkspacePanel key={team.id} className="rounded-3xl p-8 flex flex-col gap-6 border-border/30 bg-card/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <Link href={`/ai-settings/agents/${team.id}`} className="block text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                  {team.name}
                </Link>
                <div className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/40">{team.routingRule}</div>
              </div>
              <StatusBadge value={team.enabled ? "active" : "inactive"} />
            </div>

            <div className="p-6 rounded-[24px] bg-muted/5 border border-border/10 space-y-6">
              <KeyValueGrid
                items={[
                  { label: "النموذج الافتراضي", value: <span className="font-black text-primary tracking-tight">{team.defaultModel}</span> },
                  { label: "النموذج البديل", value: <span className="font-bold text-muted-foreground/70">{team.fallbackModel}</span> },
                ]}
              />
              
              <FormField 
                label="حد الميزانية الشهرية" 
                labelClassName="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground/30">$</span>
                  <AdminInput 
                    type="number" 
                    value={team.budgetLimit} 
                    onChange={(event) => updateBudget(team.id, Number(event.target.value) || 0)}
                    className="rounded-xl border-border/40 bg-background font-black h-11 pl-8 pr-4"
                  />
                </div>
              </FormField>
            </div>

            <Button 
              variant={team.enabled ? "outline" : "primary"} 
              onClick={() => toggleTeam(team.id)}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/5 transition-all"
            >
              {team.enabled ? "إيقاف التشغيل مؤقتًا" : "تفعيل الفريق الآن"}
            </Button>

            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 border-t border-border/10 pt-6 mt-auto">
              <Link href={`/ai-settings/agents/${team.id}/edit`} className="hover:text-primary transition-colors">إعدادات الفريق</Link>
              <Link href={`/ai-settings/agents/${team.id}/delete`} className="hover:text-rose-500 transition-colors">حذف</Link>
            </div>
          </WorkspacePanel>
        ))}
      </div>
    </SectionScaffold>
  );
}
