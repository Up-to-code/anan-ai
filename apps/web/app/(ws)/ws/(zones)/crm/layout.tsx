import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import CrmRouteTabs from "./CrmRouteTabs";

/**
 * WHY:   CRM now uses the unified workspace shell - no more separate zone.
 * WHAT:  Wraps the CRM route with the main workspace layout.
 */
export default async function CrmZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome] = await Promise.all([
    requireWorkspaceData("/ws/crm"),
    getLayoutSidebarData("/ws/crm"),
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
        zoneLabel: "إدارة العملاء",
      })}
    >
      <div className="flex min-h-full flex-col">
        <CrmRouteTabs />
        <div className="flex-1">{children}</div>
      </div>
    </WorkspaceShell>
  );
}
