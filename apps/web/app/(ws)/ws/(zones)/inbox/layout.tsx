import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import { buildComplianceBanner } from "../../_lib/complianceBanner";

/**
 * WHY:   The inbox zone needs the shared workspace chrome (sidebar and top navbar).
 * WHAT:  Wraps the inbox pages with the WorkspaceShell layout.
 * HOW:   Retrieves workspace state and organization identity to populate the shell.
 */
export default async function InboxZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome, complianceRuleset] = await Promise.all([
    requireWorkspaceData("/ws/inbox"),
    getLayoutSidebarData("/ws/inbox"),
    getComplianceRulesetForCurrentOrg().catch(() => null),
  ]);
  const primaryOrganization = chrome.organizations?.[0];

  if (!primaryOrganization) {
    return <div className="min-h-svh bg-white">{children}</div>;
  }

  const complianceBanner = buildComplianceBanner(primaryOrganization, complianceRuleset);

  return (
    <WorkspaceShell
      user={chrome.user}
      visibleZoneKeys={workspace.visibleZoneKeys}
      recentAssistantThreads={chrome.recentAssistantThreads}
      allAssistantThreads={chrome.allAssistantThreads}
      signalCounts={chrome.signalCounts}
      complianceBanner={complianceBanner}
      organization={getWorkspaceOrganizationDisplay({
        name: primaryOrganization?.name,
        type: primaryOrganization?.type,
        status: primaryOrganization?.status,
        zoneLabel: "البريد الوارد",
      })}
    >
      {children}
    </WorkspaceShell>
  );
}
