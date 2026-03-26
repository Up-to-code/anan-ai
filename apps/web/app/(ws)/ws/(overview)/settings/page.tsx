import { getWorkspaceOrganizationTeam } from "../../_lib/organizationTeam";
import { listCurrentOrganizationApiKeysForCurrentUser } from "@/server/domains/auth/organizationApiKeys/service";
import type { OrganizationApiKeySummary } from "@/server/contracts/organizationApiKeys";
import SettingsHeader from "./_components/SettingsHeader";
import ApiKeysWorkspace from "./_components/ApiKeysWorkspace";
import InviteMemberForm from "./_components/InviteMemberForm";
import OrganizationSettingsWorkspace from "./_components/OrganizationSettingsWorkspace";
import SettingsTabs from "./_components/SettingsTabs";
import MembersWorkspace from "./_components/MembersWorkspace";

type SettingsTabKey = "org" | "members" | "api-keys";

const settingsTabs = [
  { key: "org", label: "المنظمة" },
  { key: "members", label: "الأعضاء والدعوات" },
  { key: "api-keys", label: "مفاتيح API" },
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
    <div className="animate-in fade-in-50 duration-300">
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
      <div className="text-sm text-slate-500">
        {args.members.length} أعضاء، {args.invites.length} دعوات، وصلاحيتك الحالية: {args.roleLabel}
      </div>
      <div>
        <MembersWorkspace
          initialMembers={args.members}
          invites={args.invites}
          canManage={args.canManage}
          hasOrganization={args.hasOrganization}
        />
      </div>
    </div>
  );
}

function ApiKeysTabSection(args: {
  initialKeys: OrganizationApiKeySummary[];
  canManage: boolean;
  hasOrganization: boolean;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="text-sm text-slate-500">
        {args.initialKeys.length} مفاتيح محفوظة. {args.canManage ? "يمكنك إدارة المفاتيح من هنا." : "تحتاج صلاحية إدارة للوصول الكامل."}
      </div>
      <ApiKeysWorkspace
        initialKeys={args.initialKeys}
        canManage={args.canManage}
        hasOrganization={args.hasOrganization}
      />
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
  const currentTab: SettingsTabKey =
    searchParams.tab === "members" || searchParams.tab === "api-keys"
      ? searchParams.tab
      : "org";

  const { organization, members, invites, currentMembershipRole } = await getWorkspaceOrganizationTeam();
  const canManage = currentMembershipRole === "manager";
  const roleLabel = roleLabelForMembership(currentMembershipRole);
  const hasOrganization = Boolean(organization && currentMembershipRole);
  const initialApiKeys =
    canManage && hasOrganization
      ? await listCurrentOrganizationApiKeysForCurrentUser()
      : [];

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <SettingsHeader
        title="الإعدادات"
        description="بيانات المنظمة والأعضاء ومفاتيح الربط."
      />

      <SettingsTabs tabs={settingsTabs} defaultTab="org" />

      {currentTab === "org" ? (
        <OrganizationTabSection organization={organization} canManage={canManage} />
      ) : currentTab === "api-keys" ? (
        <ApiKeysTabSection
          initialKeys={initialApiKeys}
          canManage={canManage}
          hasOrganization={hasOrganization}
        />
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
