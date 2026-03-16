import { getWorkspaceOrganizationTeam } from "../../_lib/organizationTeam";
import SettingsHeader from "./_components/SettingsHeader";
import InviteMemberForm from "./_components/InviteMemberForm";
import OrganizationSettingsWorkspace from "./_components/OrganizationSettingsWorkspace";
import SettingsSummary from "./_components/SettingsSummary";

/**
 * WHY:   Organization settings need a top-level summary page under the overview shell.
 * WHAT:  Renders the primary organization summary plus counts for members and pending invites.
 * HOW:   Loads the current organization team data from the shared settings helper.
 */
export default async function WorkspaceSettingsPage() {
  const { organization, members, invites, currentMembershipRole } = await getWorkspaceOrganizationTeam();
  const canManage = currentMembershipRole === "manager";

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <SettingsHeader
        title="إعدادات المنظمة"
        description="إدارة الأعضاء، الدعوات، والأدوار من داخل مساحة العمل."
      />
      <SettingsSummary
        items={[
          { label: "المنظمة", value: organization?.name ?? "بدون منظمة" },
          { label: "الأعضاء", value: members.length },
          { label: "الدعوات", value: invites.length },
          { label: "الحالة", value: organization?.status ?? "غير متوفر" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <OrganizationSettingsWorkspace organization={organization} canManage={canManage} />
        <InviteMemberForm canManage={canManage} hasOrganization={Boolean(organization)} />
      </div>
    </div>
  );
}
