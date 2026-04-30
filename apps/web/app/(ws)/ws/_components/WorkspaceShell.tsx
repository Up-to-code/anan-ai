"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose, PenSquare } from "lucide-react";
import { AuthStateGate } from "@anan/ui/auth";
import Sidebar from "./Sidebar";
import type { SidebarUser } from "./Sidebar/types";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { WORKSPACE_SIDEBAR_WIDTH_CLASS } from "../_lib/shell";
import WorkspaceSidebarDrawer from "./WorkspaceSidebarDrawer";
import WorkspaceTopNavbar from "./WorkspaceTopNavbar";
import WorkspaceMessageToasts from "./WorkspaceMessageToasts";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";
import { cn } from "@/lib/utils";
import { getWorkspaceZonesForKeys } from "../_lib/zones";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { ComplianceBanner } from "../_lib/complianceBanner";
import type { NotificationSummary } from "@/server/contracts/notifications";
import {
  getWorkspaceChromeState,
  matchesWorkspacePath,
  type WorkspaceShellVariant,
} from "../_lib/workspaceChrome";

/**
 * WHY:   The workspace route group needs one responsive shell that behaves consistently across desktop and Safari-class mobile browsers.
 * WHAT:  Renders the desktop sidebar rail, mobile drawer trigger, top navbar, and main content column for `/ws`.
 * HOW:   Uses `svh`-based sizing on the desktop shell, supports an assistant-first overview variant, and keeps mobile navigation reachable.
 */
export default function WorkspaceShell({
  user,
  visibleZoneKeys,
  organization,
  recentAssistantThreads = [],
  allAssistantThreads = [],
  initialNotifications = [],
  signalCounts = { notificationCount: 0, inboxCount: 0 },
  complianceBanner = null,
  variant,
  headerTitle,
  children,
}: {
  user: SidebarUser;
  visibleZoneKeys?: WorkspaceZoneKey[];
  organization: WorkspaceOrganizationDisplay;
  recentAssistantThreads?: AnanProThreadSummary[];
  allAssistantThreads?: AnanProThreadSummary[];
  initialNotifications?: NotificationSummary[];
  signalCounts?: { notificationCount: number; inboxCount: number };
  complianceBanner?: ComplianceBanner | null;
  variant?: WorkspaceShellVariant;
  headerTitle?: string;
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { dictionary, direction, isRtl, locale } = useWebLocale();
  const chrome = getWorkspaceChromeState({
    pathname,
    visibleZoneKeys,
    locale,
    organizationSubtitle: organization.sidebarSubtitle,
    explicitTitle: headerTitle,
    variantOverride: variant,
  });
  const isAssistantVariant = chrome.variant === "assistant";
  const visibleZones = getWorkspaceZonesForKeys(visibleZoneKeys ?? ["overview"], locale);
  const sidebarTogglePositionClassName = isAssistantVariant ? "top-[10px]" : "top-6";
  const collapsedRailPaddingTopClassName = isAssistantVariant ? "pt-14" : "pt-16";
  const sidebarToggleButton = (
    <button
      type="button"
      onClick={() => setSidebarCollapsed((value) => !value)}
      data-slot="workspace-sidebar-trigger"
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-2 text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-elevated)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)]"
      aria-label={sidebarCollapsed ? dictionary.nav.showSidebar : dictionary.nav.hideSidebar}
      title={sidebarCollapsed ? dictionary.nav.showSidebar : dictionary.nav.hideSidebar}
    >
      {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-4 w-4" />}
    </button>
  );

  return (
    <div
      data-slot="workspace-shell"
      data-variant={chrome.variant}
      dir={direction}
      className={cn(
        "app-shell-height app-shell-fixed-height flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--workspace-shell)] lg:flex-row",
        !chrome.isAssistantHome && "lg:overflow-hidden",
      )}
    >
      <div
        className={cn(
          "relative hidden h-full min-h-0 shrink-0 lg:flex motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out",
          sidebarCollapsed ? "w-24" : WORKSPACE_SIDEBAR_WIDTH_CLASS,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
            sidebarCollapsed
              ? cn("pointer-events-none opacity-0", isRtl ? "-translate-x-2" : "translate-x-2")
              : "translate-x-0 opacity-100",
          )}
        >
          <Sidebar
            user={user}
            organization={organization}
            visibleZoneKeys={visibleZoneKeys}
            recentAssistantThreads={recentAssistantThreads}
            allAssistantThreads={allAssistantThreads}
            variant={chrome.variant}
            headerAction={!sidebarCollapsed ? sidebarToggleButton : undefined}
            className="h-full w-full overflow-hidden border-e border-[color:var(--workspace-border)]"
          />
        </div>
        {sidebarCollapsed ? (
          <div
            className={cn(
              "absolute z-10",
              sidebarTogglePositionClassName,
              "left-1/2 -translate-x-1/2",
            )}
          >
            {sidebarToggleButton}
          </div>
        ) : null}
        <div
          className={cn(
            "hidden h-full w-full flex-col items-center border-e border-[color:var(--workspace-border)] bg-[var(--workspace-sidebar)] px-2 pb-4 lg:flex motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
            collapsedRailPaddingTopClassName,
            sidebarCollapsed
              ? "translate-x-0 opacity-100"
              : cn("pointer-events-none opacity-0", isRtl ? "translate-x-3" : "-translate-x-3"),
          )}
          aria-hidden={!sidebarCollapsed}
        >
          <div className="flex w-full flex-col items-center gap-2">
            <Link
              href="/ws"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-elevated)]"
              aria-label={dictionary.nav.newChat}
              title={dictionary.nav.newChat}
            >
              <PenSquare className="h-4 w-4" />
            </Link>
          </div>
          <nav aria-label={dictionary.nav.workspaceNavigation} className="mt-5 flex w-full flex-1 flex-col items-center gap-2">
            {visibleZones.map((item) => {
              const Icon = item.icon;
              const isActive = matchesWorkspacePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all active:scale-95",
                    isActive
                      ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[var(--workspace-highlight)] text-white"
                      : "border-transparent bg-transparent text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]",
                  )}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="relative flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col bg-transparent lg:overflow-hidden">
        <WorkspaceTopNavbar
          user={user}
          organization={organization}
          visibleZoneKeys={visibleZoneKeys}
          initialSignalCounts={signalCounts}
          complianceBanner={complianceBanner}
          variant={chrome.variant}
          title={chrome.headerTitle}
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

        <main
          className={cn(
            "flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col motion-safe:animate-zone-page-enter",
            chrome.isAssistantHome ? "overflow-hidden" : "overflow-auto",
          )}
        >
          <div
            data-slot="workspace-content"
            className={cn(
              "flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col",
              isAssistantVariant ? "pt-0" : undefined,
            )}
            >
            <AuthStateGate loading={children} unauthenticated={children} error={children}>
              {children}
            </AuthStateGate>
          </div>
        </main>

        <WorkspaceMessageToasts initialNotifications={initialNotifications} />
      </div>
    </div>
  );
}
