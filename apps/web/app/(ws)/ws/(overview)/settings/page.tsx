import { cookies } from "next/headers";
import { getWorkspaceOrganizationTeam } from "../../_lib/organizationTeam";
import { listCurrentOrganizationApiKeysForCurrentUser } from "@/server/domains/auth/organizationApiKeys/service";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import type { OrganizationApiKeySummary } from "@/server/contracts/organizationApiKeys";
import { getWebDictionary } from "@/lib/i18n";
import { isRtlLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";
import SettingsHeader from "./_components/SettingsHeader";
import ApiKeysWorkspace from "./_components/ApiKeysWorkspace";
import OrganizationSettingsWorkspace from "./_components/OrganizationSettingsWorkspace";
import SettingsTabs from "./_components/SettingsTabs";
import MembersWorkspace from "./_components/MembersWorkspace";
import OrganizationVerificationWorkspace from "./_components/OrganizationVerificationWorkspace";
import {
  cancelOrganizationInviteAction,
  createOrganizationApiKeyAction,
  createOrganizationInviteAction,
  revokeOrganizationApiKeyAction,
  saveOrganizationSettingsAction,
  searchOrganizationDirectoryAction,
  updateOrganizationMemberRoleAction,
} from "./actions";

type SettingsTabKey = "org" | "verification" | "members" | "api-keys";

function roleLabelForMembership(role: string | null, locale: ReturnType<typeof getWebDictionary>) {
  if (role === "manager") return locale.settings.manager;
  if (role === "viewer") return locale.settings.viewer;
  if (role === "member") return locale.settings.member;
  return locale.settings.unavailable;
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
      <OrganizationSettingsWorkspace organization={organization} canManage={canManage} onSave={saveOrganizationSettingsAction} />
    </div>
  );
}

function MembersTabSection(args: {
  organization: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["organization"];
  members: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["members"];
  invites: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["invites"];
  canManage: boolean;
  hasOrganization: boolean;
  roleLabel: string;
  summaryLabel: string;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="text-sm text-slate-500">
        {args.summaryLabel
          .replace("{members}", String(args.members.length))
          .replace("{invites}", String(args.invites.length))
          .replace("{roleLabel}", args.roleLabel)}
      </div>
      <div>
        <MembersWorkspace
          initialMembers={args.members}
          invites={args.invites}
          canManage={args.canManage}
          hasOrganization={args.hasOrganization}
          organizationType={args.organization?.type}
          onCreateInvite={createOrganizationInviteAction}
          onCancelInvite={cancelOrganizationInviteAction}
          onSearchDirectory={searchOrganizationDirectoryAction}
          onUpdateRole={updateOrganizationMemberRoleAction}
        />
      </div>
    </div>
  );
}

function ApiKeysTabSection(args: {
  initialKeys: OrganizationApiKeySummary[];
  canCreate: boolean;
  canRevoke: boolean;
  canView: boolean;
  hasOrganization: boolean;
  summaryCreate: string;
  summaryRevoke: string;
  summaryNoAccess: string;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="text-sm text-slate-500">
        {args.initialKeys.length}. {args.canCreate ? args.summaryCreate : args.canRevoke ? args.summaryRevoke : args.summaryNoAccess}
      </div>
      <ApiKeysWorkspace
        initialKeys={args.initialKeys}
        canCreate={args.canCreate}
        canRevoke={args.canRevoke}
        canView={args.canView}
        hasOrganization={args.hasOrganization}
        onCreateKey={createOrganizationApiKeyAction}
        onRevokeKey={revokeOrganizationApiKeyAction}
      />
    </div>
  );
}

function VerificationTabSection(args: {
  organization: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["organization"];
  membersCount: number;
  invitesCount: number;
  canManage: boolean;
  roleLabel: string;
  ruleset: Awaited<ReturnType<typeof getComplianceRulesetForCurrentOrg>>;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <OrganizationVerificationWorkspace
        organization={args.organization}
        verificationSummary={args.organization?.verificationSummary}
        ruleset={args.ruleset}
        canManage={args.canManage}
        membersCount={args.membersCount}
        invitesCount={args.invitesCount}
        roleLabel={args.roleLabel}
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
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  const dictionary = getWebDictionary(locale);
  const searchParams = await props.searchParams;
  const currentTab: SettingsTabKey =
    searchParams.tab === "members" || searchParams.tab === "api-keys" || searchParams.tab === "verification"
      ? searchParams.tab
      : "org";

  const { organization, members, invites, currentMembershipRole, currentTenantRole } = await getWorkspaceOrganizationTeam();
  const canManage = currentMembershipRole === "manager";
  const canViewApiKeys = currentMembershipRole === "manager";
  const canCreateApiKeys = currentTenantRole === "owner";
  const canRevokeApiKeys = currentMembershipRole === "manager";
  const roleLabel = roleLabelForMembership(currentMembershipRole, dictionary);
  const hasOrganization = Boolean(organization && currentMembershipRole);
  const complianceRuleset = hasOrganization ? await getComplianceRulesetForCurrentOrg() : null;
  const initialApiKeys =
    canViewApiKeys && hasOrganization
      ? await listCurrentOrganizationApiKeysForCurrentUser()
      : [];

  return (
    <div className="mx-auto min-h-max w-full max-w-7xl space-y-8 p-6 pb-24 lg:min-h-full lg:p-10 lg:pb-28" dir={isRtlLocale(locale) ? "rtl" : "ltr"}>
      <SettingsHeader
        title={dictionary.settings.title}
        description={dictionary.settings.description}
      />

      <SettingsTabs
        tabs={[
          { key: "org", label: dictionary.settings.organization },
          { key: "verification", label: dictionary.settings.verification },
          { key: "members", label: dictionary.settings.membersAndInvites },
          { key: "api-keys", label: dictionary.settings.apiKeys },
        ]}
        defaultTab="org"
      />

      {currentTab === "org" ? (
        <OrganizationTabSection organization={organization} canManage={canManage} />
      ) : currentTab === "verification" ? (
        <VerificationTabSection
          organization={organization}
          membersCount={members.length}
          invitesCount={invites.length}
          canManage={canManage}
          roleLabel={roleLabel}
          ruleset={complianceRuleset}
        />
      ) : currentTab === "api-keys" ? (
        <ApiKeysTabSection
          initialKeys={initialApiKeys}
          canCreate={canCreateApiKeys}
          canRevoke={canRevokeApiKeys}
          canView={canViewApiKeys}
          hasOrganization={hasOrganization}
          summaryCreate={dictionary.settings.apiKeysSummaryCreate}
          summaryRevoke={dictionary.settings.apiKeysSummaryRevoke}
          summaryNoAccess={dictionary.settings.apiKeysSummaryNoAccess}
        />
      ) : (
        <MembersTabSection
          organization={organization}
          members={members}
          invites={invites}
          canManage={canManage}
          hasOrganization={hasOrganization}
          roleLabel={roleLabel}
          summaryLabel={dictionary.settings.membersSummary}
        />
      )}
    </div>
  );
}
