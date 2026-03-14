import Sidebar from "@/components/shared/Sidebar";
import type { SidebarUser } from "@/components/shared/Sidebar/types";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { WORKSPACE_SIDEBAR_WIDTH_CLASS } from "../_lib/shell";
import WorkspaceSidebarDrawer from "./WorkspaceSidebarDrawer";
import WorkspaceTopNavbar from "./WorkspaceTopNavbar";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";

/**
 * WHY:   The workspace route group needs one responsive shell that behaves consistently across desktop and Safari-class mobile browsers.
 * WHAT:  Renders the desktop sidebar rail, mobile drawer trigger, top navbar, and main content column for `/ws`.
 * HOW:   Uses `svh`-based sizing on the desktop shell and leaves mobile content flow un-clipped so the sidebar stays reachable.
 */
export default function WorkspaceShell({
  user,
  visibleZoneKeys,
  organization,
  recentAssistantThreads = [],
  allAssistantThreads = [],
  signalCounts = { notificationCount: 0, inboxCount: 0 },
  children,
}: {
  user: SidebarUser;
  visibleZoneKeys?: WorkspaceZoneKey[];
  organization: WorkspaceOrganizationDisplay;
  recentAssistantThreads?: AnanProThreadSummary[];
  allAssistantThreads?: AnanProThreadSummary[];
  signalCounts?: { notificationCount: number; inboxCount: number };
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="workspace-shell"
      className="min-h-svh bg-slate-50 lg:flex lg:h-svh lg:overflow-hidden"
    >
      <div className={`hidden shrink-0 lg:flex lg:h-svh ${WORKSPACE_SIDEBAR_WIDTH_CLASS}`}>
        <Sidebar
          user={user}
          organization={organization}
          visibleZoneKeys={visibleZoneKeys}
          recentAssistantThreads={recentAssistantThreads}
          allAssistantThreads={allAssistantThreads}
          className="w-full"
        />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col bg-transparent lg:max-h-svh lg:overflow-hidden">
        <WorkspaceTopNavbar
          organization={organization}
          visibleZoneKeys={visibleZoneKeys}
          initialSignalCounts={signalCounts}
          mobileNavigation={
            <WorkspaceSidebarDrawer
              user={user}
              organization={organization}
              visibleZoneKeys={visibleZoneKeys}
              recentAssistantThreads={recentAssistantThreads}
              allAssistantThreads={allAssistantThreads}
            />
          }
        />

        <main className="min-w-0 flex-1 overflow-visible motion-safe:animate-zone-page-enter lg:overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
