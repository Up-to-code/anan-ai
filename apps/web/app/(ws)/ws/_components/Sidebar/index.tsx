import { cn } from "@/lib/utils";
import SidebarContent from "./SidebarContent";
import type { SidebarProps } from "./types";

/**
 * WHY:   The workspace shell needs one navigation component that can render safely in desktop rails and mobile drawers.
 * WHAT:  Provides the semantic wrapper and layout mode selection for the shared sidebar content.
 * HOW:   Delegates the actual navigation markup to `SidebarContent` and only varies the outer container per mode.
 */
export default function Sidebar({
  user,
  organization,
  visibleZoneKeys,
  recentAssistantThreads,
  allAssistantThreads,
  mode = "desktop",
  className,
  titleId,
  onNavigate,
}: SidebarProps) {
  const Component = mode === "desktop" ? "aside" : "div";

  return (
    <Component
      data-slot={mode === "desktop" ? "workspace-sidebar-desktop" : "workspace-sidebar-drawer"}
      aria-labelledby={titleId}
      className={cn("flex min-h-0 flex-col", mode === "desktop" ? "h-full" : "h-full w-full", className)}
    >
      <SidebarContent
        user={user}
        organization={organization}
        visibleZoneKeys={visibleZoneKeys}
        recentAssistantThreads={recentAssistantThreads}
        allAssistantThreads={allAssistantThreads}
        mode={mode}
        titleId={titleId}
        onNavigate={onNavigate}
      />
    </Component>
  );
}
