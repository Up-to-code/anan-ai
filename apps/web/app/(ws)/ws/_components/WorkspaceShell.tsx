"use client";

import { useState } from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
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
  complianceBanner = null,
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
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      data-slot="workspace-shell"
      className="min-h-svh bg-slate-50 lg:flex lg:h-svh lg:overflow-hidden"
    >
      {!sidebarCollapsed ? (
        <div className={`hidden shrink-0 lg:flex lg:h-svh relative group ${WORKSPACE_SIDEBAR_WIDTH_CLASS}`}>
          <Sidebar
            user={user}
            organization={organization}
            visibleZoneKeys={visibleZoneKeys}
            recentAssistantThreads={recentAssistantThreads}
            allAssistantThreads={allAssistantThreads}
            className="w-full"
          />
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 opacity-0 shadow-sm transition-opacity hover:text-slate-600 group-hover:opacity-100 focus-visible:opacity-100 z-10"
            aria-label="إخفاء القائمة"
          >
            <PanelLeftClose className="h-3 w-3" />
          </button>
        </div>
      ) : null}
      {sidebarCollapsed ? (
        <div className="hidden shrink-0 lg:flex lg:h-svh lg:w-16 flex-col items-center border-e border-slate-200 bg-white py-6">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="إظهار القائمة"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col bg-transparent lg:max-h-svh lg:overflow-hidden">
        <WorkspaceTopNavbar
          user={user}
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

        {complianceBanner ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-right">
            <div className="text-sm font-black text-amber-900">{complianceBanner.title}</div>
            <div className="mt-1 text-xs font-semibold text-amber-800">{complianceBanner.body}</div>
            {complianceBanner.ctaLabel ? (
              <div className="mt-3">
                <a
                  href={complianceBanner.ctaHref ?? "/ws?onboarding=verification"}
                  className="inline-flex items-center border border-amber-300 bg-white px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-amber-900"
                >
                  {complianceBanner.ctaLabel}
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        <main className="min-w-0 flex-1 overflow-visible motion-safe:animate-zone-page-enter lg:overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
