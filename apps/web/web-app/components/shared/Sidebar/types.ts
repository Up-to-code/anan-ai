import type { SessionUser } from "@/lib/serverSession";
import type { WorkspaceOrganizationDisplay } from "@/app/(ws)/ws/_lib/organizationDisplay";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";

export type SidebarMode = "desktop" | "drawer";

export type SidebarUser = Pick<SessionUser, "name" | "email">;

export type SidebarProps = {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  visibleZoneKeys?: WorkspaceZoneKey[];
  recentAssistantThreads?: AnanProThreadSummary[];
  allAssistantThreads?: AnanProThreadSummary[];
  mode?: SidebarMode;
  className?: string;
  titleId?: string;
  onNavigate?: () => void;
};
