import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import MarketRouteTabs from "./MarketRouteTabs";

/**
 * WHY:   Market pages should feel like focused reading surfaces instead of a full workspace control center.
 * WHAT:  Wraps the market route with the main workspace shell, keeping sidebar + header consistent.
 */
export default async function MarketZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome] = await Promise.all([
    requireWorkspaceData("/ws/market"),
    getLayoutSidebarData("/ws/market"),
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
        name: primaryOrganization.name,
        type: primaryOrganization.type,
        status: primaryOrganization.status,
        zoneLabel: "ذكاء السوق",
      })}
    >
      <div data-slot="market-shell" className="flex min-h-full flex-col">
        <MarketRouteTabs />
        <div className="flex-1">{children}</div>
      </div>
    </WorkspaceShell>
  );
}
