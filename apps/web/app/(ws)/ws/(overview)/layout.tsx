import WorkspaceShell from "../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../_lib/workspaceData";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import { buildComplianceBanner } from "../_lib/complianceBanner";

/**
 * WHY:   The overview dashboard and account pages still share the original workspace chrome.
 * WHAT:  Renders the role-aware sidebar and top navbar shell for non-business-zone routes under `/ws`.
 * HOW:   Resolves the current workspace snapshot once and feeds the serializable organization/user data into `WorkspaceShell`.
 */
export default async function WorkspaceOverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome, complianceRuleset] = await Promise.all([
    requireWorkspaceData("/ws"),
    getLayoutSidebarData("/ws"),
    getComplianceRulesetForCurrentOrg().catch(() => null),
  ]);
  const primaryOrganization = chrome.organizations[0];

  if (!primaryOrganization) {
    return <div className="min-h-svh bg-white">{children}</div>;
  }

  const organizationDisplay = getWorkspaceOrganizationDisplay({
    name: primaryOrganization.name,
    type: primaryOrganization.type,
    status: primaryOrganization.status,
    zoneLabel: "لوحة العمل",
  });
  const complianceBanner = buildComplianceBanner(primaryOrganization, complianceRuleset);

  return (
    <WorkspaceShell
      user={chrome.user}
      visibleZoneKeys={workspace.visibleZoneKeys}
      organization={organizationDisplay}
      complianceBanner={complianceBanner}
      recentAssistantThreads={chrome.recentAssistantThreads}
      allAssistantThreads={chrome.allAssistantThreads}
      signalCounts={chrome.signalCounts}
    >
      {children}
    </WorkspaceShell>
  );
}
