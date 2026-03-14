import WorkspaceTopNavbar from "../../_components/WorkspaceTopNavbar";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { WORKSPACE_SIDEBAR_WIDTH_CLASS } from "../../_lib/shell";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import MarketRouteTabs from "./MarketRouteTabs";

/**
 * WHY:   Market pages should feel like focused reading surfaces instead of a full workspace control center.
 * WHAT:  Wraps the market route with the shared top navbar and market tabs, but without the workspace sidebar rail.
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
    <div
      data-slot="market-shell"
      className="min-h-svh bg-slate-50 lg:flex lg:h-svh lg:overflow-hidden"
    >
      <div
        data-slot="market-sidebar-placeholder"
        className={`hidden shrink-0 bg-slate-50 lg:flex lg:h-svh ${WORKSPACE_SIDEBAR_WIDTH_CLASS}`}
      />

      <div className="relative flex min-w-0 flex-1 flex-col bg-transparent lg:max-h-svh lg:overflow-hidden">
        <WorkspaceTopNavbar
          user={{ name: chrome.user.name, email: chrome.user.email }}
          organization={getWorkspaceOrganizationDisplay({
            name: primaryOrganization.name,
            type: primaryOrganization.type,
            status: primaryOrganization.status,
            zoneLabel: "ذكاء السوق",
          })}
          visibleZoneKeys={workspace.visibleZoneKeys}
          initialSignalCounts={chrome.signalCounts}
        />
        <div className="flex min-h-[calc(100svh-73px)] flex-col lg:min-h-0 lg:flex-1">
          <MarketRouteTabs />
          <main className="min-w-0 flex-1 overflow-visible lg:overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
