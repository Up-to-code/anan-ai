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
    <SectionScaffold eyebrow="الإعدادات" title="الفريق والصلاحيات" description="دعوة المستخدمين وتوزيع الصلاحيات على فرق المبيعات، التسويق، والإدارة." tabs={settingsTabs}>
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <WorkspacePanel className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">دعوة عضو جديد</h2>
          <FormField label="الاسم">
            <AdminInput value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="البريد الإلكتروني">
            <AdminInput value={email} onChange={(event) => setEmail(event.target.value)} />
          </FormField>
          <FormField label="الفريق">
            <AdminSelect value={team} onChange={(event) => setTeam(event.target.value)}>
              <option>المبيعات</option>
              <option>التسويق</option>
              <option>الإدارة</option>
            </AdminSelect>
          </FormField>
          <FormField label="الصلاحية">
            <AdminSelect value={permission} onChange={(event) => setPermission(event.target.value)}>
              <option value="sales">sales</option>
              <option value="marketing">marketing</option>
              <option value="admin">admin</option>
            </AdminSelect>
          </FormField>
          <Button onClick={inviteMember}>إرسال الدعوة</Button>
        </WorkspacePanel>

        <DataTable headers={["الاسم", "البريد", "الفريق", "الصلاحية", "الحالة"]}>
          {teamMembers.map((member) => (
            <tr key={member.id} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-3 font-medium text-slate-900">{member.name}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{member.email}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{member.team}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{member.permission}</td>
              <td className="px-4 py-3"><StatusBadge value={member.status} /></td>
            </tr>
          ))}
        </DataTable>
      </div>
    </SectionScaffold>
  );
}

