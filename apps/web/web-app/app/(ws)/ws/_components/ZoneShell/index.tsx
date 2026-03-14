import type { SidebarUser } from "@/components/shared/Sidebar/types";
import type { WorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { WORKSPACE_SIDEBAR_WIDTH_CLASS } from "../../_lib/shell";
import type { ZoneShellData } from "../../_lib/zones";
import WorkspaceTopNavbar from "../WorkspaceTopNavbar";
import ZoneSidebar from "./ZoneSidebar";

/**
 * WHY:   Zone routes need a dedicated full-screen shell that is independent from the overview workspace chrome.
 * WHAT:  Renders a sidebar-only business-zone layout with a full-height content area.
 * HOW:   Uses the shared zone metadata and user identity to compose the sidebar while leaving zone pages responsible for inner content sections only.
 */
export default function ZoneShell({
  zone,
  user,
  organization,
  children,
}: {
  zone: ZoneShellData;
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="zone-shell"
      className="min-h-svh bg-slate-50 lg:flex lg:h-svh lg:overflow-hidden"
    >
      <div className={`hidden shrink-0 lg:flex lg:h-svh ${WORKSPACE_SIDEBAR_WIDTH_CLASS}`}>
        <ZoneSidebar zone={zone} user={user} organization={organization} />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col bg-transparent lg:max-h-svh lg:overflow-hidden">
        <WorkspaceTopNavbar 
          organization={organization} 
          visibleZoneKeys={[zone.key]} 
        />
        <main className="min-w-0 flex-1 bg-transparent motion-safe:animate-zone-page-enter lg:h-svh lg:overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
