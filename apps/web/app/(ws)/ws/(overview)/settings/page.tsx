import { getWorkspaceOrganizationTeam } from "../../_lib/organizationTeam";
import { listCurrentOrganizationApiKeysForCurrentUser } from "@/server/domains/auth/organizationApiKeys/service";
import { listAuthorizedAppsForCurrentOrganization } from "@/server/domains/auth/oauth/service";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import type { OrganizationApiKeySummary } from "@/server/contracts/organizationApiKeys";
import type { OAuthAuthorizedAppSummary } from "@/server/contracts/oauth";
import { getWebDictionary } from "@/lib/i18n";
import { isRtlLocale } from "@/lib/locale";
import { getWorkspaceLocale } from "../../_lib/workspaceLocale";
import SettingsHeader from "./_components/SettingsHeader";
import ApiKeysWorkspace from "./_components/ApiKeysWorkspace";
import OrganizationAppsWorkspace from "./_components/OrganizationAppsWorkspace";
import OrganizationSettingsWorkspace from "./_components/OrganizationSettingsWorkspace";
import SettingsTabs from "./_components/SettingsTabs";
import MembersWorkspace from "./_components/MembersWorkspace";
import OrganizationVerificationWorkspace from "./_components/OrganizationVerificationWorkspace";
import {
  cancelOrganizationInviteAction,
  createOrganizationApiKeyAction,
  createOrganizationInviteAction,
  revokeOrganizationConnectedAppAction,
  revokeOrganizationApiKeyAction,
  saveOrganizationSettingsAction,
  searchOrganizationDirectoryAction,
  updateOrganizationMemberRoleAction,
} from "./actions";

type SettingsTabKey = "org" | "verification" | "members" | "api-keys" | "apps";

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

function AppsTabSection(args: {
  initialApps: OAuthAuthorizedAppSummary[];
  canManage: boolean;
  hasOrganization: boolean;
  showLegacyNotice: boolean;
  summaryManage: string;
  summaryReadonly: string;
}) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {args.hasOrganization ? (
        <div className="text-sm text-slate-500">
          {args.initialApps.length}. {args.canManage ? args.summaryManage : args.summaryReadonly}
        </div>
      ) : null}
      <OrganizationAppsWorkspace
        initialApps={args.initialApps}
        canManage={args.canManage}
        hasOrganization={args.hasOrganization}
        showLegacyNotice={args.showLegacyNotice}
        onRevokeApp={revokeOrganizationConnectedAppAction}
      />
    </div>
  );
}

function VerificationTabSection(args: {
  organization: Awaited<ReturnType<typeof getWorkspaceOrganizationTeam>>["organization"];
  canManage: boolean;
  membersCount: number;
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
      />
    </div>
  );
}

/**
 * WHY:   Organization settings need a top-level summary page under the overview shell.
 * WHAT:  Renders a tabbed interface for organization profile, verification, team, connected apps, and API keys.
 * HOW:   Uses searchParams for tab state so each section can stay server-loaded without fetching unrelated data.
 */
export default async function WorkspaceSettingsPage(props: {
  searchParams: Promise<{ tab?: string; source?: string }>;
}) {
  const locale = await getWorkspaceLocale();
  const dictionary = getWebDictionary(locale);
  const searchParams = await props.searchParams;
  const currentTab: SettingsTabKey =
    searchParams.tab === "members" || searchParams.tab === "api-keys" || searchParams.tab === "verification" || searchParams.tab === "apps"
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
  const initialApps =
    currentTab === "apps" && hasOrganization
      ? await listAuthorizedAppsForCurrentOrganization()
      : [];
  const tabs = [
    { key: "org" as const, label: dictionary.settings.organization },
    { key: "verification" as const, label: dictionary.settings.verification },
    { key: "members" as const, label: dictionary.settings.membersAndInvites },
    { key: "apps" as const, label: dictionary.settings.apps },
    { key: "api-keys" as const, label: dictionary.settings.apiKeys },
  ];

  return (
    <div className="mx-auto min-h-max w-full max-w-4xl space-y-5 p-6 pb-20 lg:min-h-full lg:p-8 lg:pb-24" dir={isRtlLocale(locale) ? "rtl" : "ltr"}>
      <SettingsHeader
        title={dictionary.settings.title}
        description={dictionary.settings.description}
        workspaceLabel={dictionary.settings.workspaceLabel}
        dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      />

      <section className="space-y-5">
        <SettingsTabs tabs={tabs} defaultTab="org" />

        <div>
          {currentTab === "org" ? (
            <OrganizationTabSection organization={organization} canManage={canManage} />
          ) : currentTab === "verification" ? (
            <VerificationTabSection
              organization={organization}
              canManage={canManage}
              membersCount={members.length}
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
          ) : currentTab === "apps" ? (
            <AppsTabSection
              initialApps={initialApps}
              canManage={canManage}
              hasOrganization={hasOrganization}
              showLegacyNotice={searchParams.source === "legacy-account-apps"}
              summaryManage={dictionary.settings.connectedAppsSummaryManage}
              summaryReadonly={dictionary.settings.connectedAppsSummaryReadonly}
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
      </section>
    </div>
  );
}
