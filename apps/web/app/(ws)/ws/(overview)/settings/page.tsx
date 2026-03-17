import { getWorkspaceOrganizationTeam } from "../../_lib/organizationTeam";
import SettingsHeader from "./_components/SettingsHeader";
import InviteMemberForm from "./_components/InviteMemberForm";
import OrganizationSettingsWorkspace from "./_components/OrganizationSettingsWorkspace";
import SettingsSummary from "./_components/SettingsSummary";
import SettingsTabs from "./_components/SettingsTabs";
import MembersWorkspace from "./_components/MembersWorkspace";

type SettingsTabKey = "org" | "members";

/**
 * WHY:   Organization settings need a top-level summary page under the overview shell.
 * WHAT:  Renders a tabbed interface separating Organization and Member management.
 * HOW:   Uses searchParams for tab state, allowing server-side data loading to remain efficient.
 */
export default async function WorkspaceSettingsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const currentTab: SettingsTabKey = searchParams.tab === "members" ? "members" : "org";

  const { organization, members, invites, currentMembershipRole } = await getWorkspaceOrganizationTeam();
  const canManage = currentMembershipRole === "manager";
  const roleLabel
    = currentMembershipRole === "manager"
      ? "مدير"
      : currentMembershipRole === "viewer"
        ? "مشاهد"
        : currentMembershipRole === "member"
          ? "عضو"
          : "غير متوفر";

  const tabs = [
    { key: "org", label: "المنظمة" },
    { key: "members", label: "الأعضاء والدعوات" },
  ] as const;

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <SettingsHeader
        title="إعدادات المنظمة"
        description="إدارة الأعضاء، الدعوات، والأدوار من داخل مساحة العمل."
      />

      <SettingsTabs tabs={tabs} defaultTab="org" />

      {currentTab === "org" && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <SettingsSummary
            items={[
              { label: "المنظمة", value: organization?.name ?? "بدون منظمة" },
              { label: "المعرف", value: organization?.slug ?? "غير متوفر" },
              { label: "الحالة", value: organization?.status === "active" ? "نشط" : "غير متوفر" },
            ]}
          />
          <OrganizationSettingsWorkspace organization={organization} canManage={canManage} />
        </div>
      )}

      {currentTab === "members" && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <SettingsSummary
            items={[
              { label: "الأعضاء", value: members.length },
              { label: "الدعوات", value: invites.length },
              { label: "صلاحيتك", value: roleLabel },
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
            <MembersWorkspace initialMembers={members} invites={invites} canManage={canManage} />
            <InviteMemberForm canManage={canManage} hasOrganization={Boolean(organization && currentMembershipRole)} />
          </div>
        </div>
      )}
    </div>
  );
}
