import { getWorkspaceOrganizationTeam } from "../../_lib/organizationTeam";
import SettingsHeader from "./_components/SettingsHeader";
import InviteMemberForm from "./_components/InviteMemberForm";
import OrganizationSettingsWorkspace from "./_components/OrganizationSettingsWorkspace";
import SettingsSummary from "./_components/SettingsSummary";
import SettingsTabs from "./_components/SettingsTabs";
import MembersWorkspace from "./_components/MembersWorkspace";

type SettingsTabKey = "org" | "members";

const settingsTabs = [
  { key: "org", label: "المنظمة" },
  { key: "members", label: "الأعضاء والدعوات" },
] as const;

function roleLabelForMembership(role: string | null) {
  if (role === "manager") return "مدير";
  if (role === "viewer") return "مشاهد";
  if (role === "member") return "عضو";
  return "غير متوفر";
}

function OrganizationTabSection({
  organization,
  canManage,
}: {
  organization: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["organization"];
  canManage: boolean;
}) {
  return (
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
  );
}

function MembersTabSection(args: {
  members: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["members"];
  invites: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["invites"];
  canManage: boolean;
  hasOrganization: boolean;
  roleLabel: string;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <SettingsSummary
        items={[
          { label: "الأعضاء", value: args.members.length },
          { label: "الدعوات", value: args.invites.length },
          { label: "صلاحيتك", value: args.roleLabel },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <MembersWorkspace initialMembers={args.members} invites={args.invites} canManage={args.canManage} />
        <InviteMemberForm canManage={args.canManage} hasOrganization={args.hasOrganization} />
      </div>
    </div>
  );
}

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
  const roleLabel = roleLabelForMembership(currentMembershipRole);
  const hasOrganization = Boolean(organization && currentMembershipRole);

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <SettingsHeader
        title="إعدادات المنظمة"
        description="إدارة الأعضاء، الدعوات، والأدوار من داخل مساحة العمل."
      />

      <SettingsTabs tabs={settingsTabs} defaultTab="org" />

      {currentTab === "org" ? (
        <OrganizationTabSection organization={organization} canManage={canManage} />
      ) : (
        <MembersTabSection
          members={members}
          invites={invites}
          canManage={canManage}
          hasOrganization={hasOrganization}
          roleLabel={roleLabel}
        />
      )}
    </div>
  );
}
