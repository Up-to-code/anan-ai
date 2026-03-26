"use client";

import { useState } from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
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

export type WorkspaceShellVariant = "default" | "assistant";

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
  signalCounts = { notificationCount: 0, inboxCount: 0 },
  complianceBanner = null,
  variant = "default",
  headerTitle,
  children,
}: {
  user: SidebarUser;
  visibleZoneKeys?: WorkspaceZoneKey[];
  organization: WorkspaceOrganizationDisplay;
  recentAssistantThreads?: AnanProThreadSummary[];
  allAssistantThreads?: AnanProThreadSummary[];
  signalCounts?: { notificationCount: number; inboxCount: number };
  complianceBanner?: {
    title: string;
    body: string;
    ctaLabel?: string;
    ctaHref?: string;
  } | null;
  variant?: WorkspaceShellVariant;
  headerTitle?: string;
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isAssistantVariant = variant === "assistant";

  return (
    <div
      data-slot="workspace-shell"
      data-variant={variant}
      className={cn(
        "min-h-svh lg:flex lg:h-svh lg:overflow-hidden",
        "bg-[var(--workspace-shell)]",
      )}
    >
      {!sidebarCollapsed ? (
        <div className={`relative hidden shrink-0 lg:flex lg:h-svh p-3 ${WORKSPACE_SIDEBAR_WIDTH_CLASS}`}>
          <Sidebar
            user={user}
            organization={organization}
            visibleZoneKeys={visibleZoneKeys}
            recentAssistantThreads={recentAssistantThreads}
            allAssistantThreads={allAssistantThreads}
            className="h-full w-full overflow-hidden rounded-xl border border-[color:var(--workspace-border)] shadow-sm"
          />
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            className="absolute left-6 top-6 z-10 inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-2 text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-elevated)] hover:text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)]"
            aria-label="إخفاء القائمة"
            title="إخفاء القائمة"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {sidebarCollapsed ? (
        <div className="hidden shrink-0 border-e border-[color:var(--workspace-border)] bg-[var(--workspace-sidebar-strong)] py-4 lg:flex lg:h-svh lg:w-[72px] lg:flex-col lg:items-center">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-elevated)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)]"
            aria-label="إظهار القائمة"
            title="إظهار القائمة"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <span className="mt-3 text-[10px] font-black tracking-[0.18em] text-[var(--workspace-muted)]">
            القائمة
          </span>
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col bg-transparent lg:max-h-svh lg:overflow-hidden">
        <WorkspaceTopNavbar
          user={user}
          organization={organization}
          visibleZoneKeys={visibleZoneKeys}
          initialSignalCounts={signalCounts}
          variant={variant}
          title={headerTitle}
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

        {complianceBanner ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-right dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="text-sm font-black text-amber-900">{complianceBanner.title}</div>
            <div className="mt-1 text-xs font-semibold text-amber-800 dark:text-amber-200">{complianceBanner.body}</div>
            {complianceBanner.ctaLabel ? (
              <div className="mt-3">
                <a
                  href={complianceBanner.ctaHref ?? "/ws?onboarding=verification"}
                  className="inline-flex items-center rounded-[8px] border border-amber-300 bg-white px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-amber-900 dark:border-amber-400/40 dark:bg-slate-950 dark:text-amber-200"
                >
                  {complianceBanner.ctaLabel}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <main
          className={cn(
            "min-w-0 flex-1 motion-safe:animate-zone-page-enter",
            isAssistantVariant ? "overflow-hidden" : "overflow-visible lg:overflow-auto",
          )}
        >
          {children}
        </main>

        <WorkspaceMessageToasts />
      </div>
    </div>
  );
}
