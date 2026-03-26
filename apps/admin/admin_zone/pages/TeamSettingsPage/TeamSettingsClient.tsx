"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import { AdminInput, AdminSelect } from "@/components/shared/AdminFieldControls";
import DataTable from "@/components/shared/DataTable";
import FormField from "@/components/shared/FormField";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { settingsTabs } from "@/lib/adminSectionTabs";
import type { TeamMemberRecord } from "@/admin_zone/mocks/types";

type TeamSettingsClientProps = {
  members: TeamMemberRecord[];
};

/**
 * WHY:   Team settings need a realistic UI for inviting users and reviewing role-based access without backend writes.
 * WHAT:  Renders a local-only invite form plus a members table.
 * HOW:   Appends invited members to local state and shows them immediately in the mocked list.
 */
export default function TeamSettingsClient({ members }: TeamSettingsClientProps) {
  const [teamMembers, setTeamMembers] = useState(members);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("المبيعات");
  const [permission, setPermission] = useState("sales");

  function inviteMember() {
    if (!name.trim() || !email.trim()) {
      return;
    }

    setTeamMembers((current) => [
      { id: `member-${current.length + 1}`, name: name.trim(), email: email.trim(), team, permission, status: "pending" },
      ...current,
    ]);
    setName("");
    setEmail("");
  }

  return (
    <SectionScaffold eyebrow="الإعدادات" title="الفريق والصلاحيات" description="إدارة الوصول ودعوة المشرفين الجدد للتحكم في المنصة." tabs={settingsTabs}>
      <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
        <WorkspacePanel className="rounded-3xl p-10 space-y-8 border-border/30 bg-card/40 shadow-sm self-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">دعوة عضو</h2>
            <p className="text-[13px] font-bold text-muted-foreground/50 uppercase tracking-widest">Add New Admin</p>
          </div>
          
          <div className="space-y-6">
            <FormField label="الاسم بالكامل" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/40">
              <AdminInput 
                value={name} 
                onChange={(event) => setName(event.target.value)} 
                className="rounded-xl border-border/40 bg-background font-black h-11 px-4"
                placeholder="أدخل اسم العضو..."
              />
            </FormField>
            <FormField label="البريد المؤسسي" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/40">
              <AdminInput 
                value={email} 
                onChange={(event) => setEmail(event.target.value)} 
                className="rounded-xl border-border/40 bg-background font-black h-11 px-4"
                placeholder="email@example.com"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="الفريق" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/40">
                <AdminSelect 
                  value={team} 
                  onChange={(event) => setTeam(event.target.value)}
                  className="rounded-xl border-border/40 bg-background font-black h-11 px-4"
                >
                  <option>المبيعات</option>
                  <option>التسويق</option>
                  <option>الإدارة</option>
                </AdminSelect>
              </FormField>
              <FormField label="الصلاحية" className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/40">
                <AdminSelect 
                  value={permission} 
                  onChange={(event) => setPermission(event.target.value)}
                  className="rounded-xl border-border/40 bg-background font-black h-11 px-4"
                >
                  <option value="sales">sales</option>
                  <option value="marketing">marketing</option>
                  <option value="admin">admin</option>
                </AdminSelect>
              </FormField>
            </div>
            <Button 
              onClick={inviteMember}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/10 mt-4"
            >
              إرسال دعوة الانضمام
            </Button>
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-3xl p-0 overflow-hidden border-border/30 bg-card/50 shadow-sm">
          <DataTable headers={["العضو", "البريد الإلكتروني", "الفريق", "الصلاحية", "الحالة"]}>
            {teamMembers.map((member) => (
              <tr key={member.id} className="group border-b border-border/10 last:border-b-0 hover:bg-muted/5 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-sm">
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <span className="font-black text-foreground tracking-tight">{member.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-[13px] font-bold text-muted-foreground/60">{member.email}</td>
                <td className="px-8 py-5">
                  <span className="px-2.5 py-1 rounded-lg bg-muted text-[11px] font-black text-muted-foreground/80 uppercase tracking-widest">
                    {member.team}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <code className="text-[11px] font-black tracking-widest text-primary/70 uppercase px-2 py-0.5 rounded bg-primary/5">
                    {member.permission}
                  </code>
                </td>
                <td className="px-8 py-5 text-left">
                  <StatusBadge value={member.status} />
                </td>
              </tr>
            ))}
          </DataTable>
        </WorkspacePanel>
      </div>
    </SectionScaffold>
  );
}

