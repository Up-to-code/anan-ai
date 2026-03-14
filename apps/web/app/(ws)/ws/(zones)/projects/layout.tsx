import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";

/**
 * WHY:   Projects now uses the unified workspace shell - no more separate zone.
 * WHAT:  Wraps the projects route with the main workspace layout.
 */
export default async function ProjectsZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome] = await Promise.all([
    requireWorkspaceData("/ws/projects"),
    getLayoutSidebarData("/ws/projects"),
  ]);
  const primaryOrganization = chrome.organizations?.[0];

  if (!primaryOrganization) {
    return <div className="min-h-svh bg-white">{children}</div>;
  }

  return (
    <WorkspaceShell
      user={chrome.user}
      visibleZoneKeys={workspace.visibleZoneKeys}
      recentAssistantThreads={chrome.recentAssistantThreads}
      allAssistantThreads={chrome.allAssistantThreads}
      signalCounts={chrome.signalCounts}
      organization={getWorkspaceOrganizationDisplay({
        name: primaryOrganization?.name,
        type: primaryOrganization?.type,
        status: primaryOrganization?.status,
        zoneLabel: "المشاريع",
      })}
    >
      {children}
    </WorkspaceShell>
  );
}
