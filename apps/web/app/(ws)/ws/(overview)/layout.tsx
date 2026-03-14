import WorkspaceShell from "../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../_lib/workspaceData";

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
  const [workspace, chrome] = await Promise.all([
    requireWorkspaceData("/ws"),
    getLayoutSidebarData("/ws"),
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

  return (
    <WorkspaceShell
      user={chrome.user}
      visibleZoneKeys={workspace.visibleZoneKeys}
      organization={organizationDisplay}
      recentAssistantThreads={chrome.recentAssistantThreads}
      allAssistantThreads={chrome.allAssistantThreads}
      signalCounts={chrome.signalCounts}
    >
      {children}
    </WorkspaceShell>
  );
}
