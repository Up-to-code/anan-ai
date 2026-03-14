import WorkspaceTopNavbar from "../../_components/WorkspaceTopNavbar";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
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
      <div data-slot="market-shell" className="min-h-svh bg-slate-50">
        <WorkspaceTopNavbar
          organization={getWorkspaceOrganizationDisplay({
            name: primaryOrganization?.name,
            type: primaryOrganization?.type,
            status: primaryOrganization?.status,
            zoneLabel: "ذكاء السوق",
          })}
          visibleZoneKeys={workspace.visibleZoneKeys}
          initialSignalCounts={chrome.signalCounts}
        />
        <div className="flex min-h-[calc(100svh-73px)] flex-col">
          <MarketRouteTabs />
          <main className="min-w-0 flex-1 overflow-visible">
            {children}
          </main>
        </div>
      </div>
    );
}
