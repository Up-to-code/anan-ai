"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/serverSession";
import AdminSidebar from "@/components/shell/AdminSidebar";
import AdminSidebarDrawer from "@/components/shell/AdminSidebarDrawer";
import AdminTopNavbar from "@/components/shell/AdminTopNavbar";
import { ADMIN_SIDEBAR_WIDTH_CLASS } from "@/components/shell/lib";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  children: React.ReactNode;
  user: SessionUser;
};

/**
 * WHY:   Every protected admin page should share one responsive workspace-style chrome instead of each route rebuilding navigation.
 * WHAT:  Renders the admin sidebar rail, mobile drawer trigger, top navbar, and the scrolling content column.
 * HOW:   Copies the workspace-shell layout behavior into admin-owned components while keeping admin routes and auth semantics unchanged.
 */
export default function AdminShell({ children, user }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("admin_sidebar_state");
    if (stored === "collapsed") {
      setSidebarCollapsed(true);
    }
  }, []);

  function toggleDesktopSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("admin_sidebar_state", next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <div
      data-slot="admin-shell"
      className="app-shell-height app-shell-fixed-height flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--workspace-shell)] font-cairo text-foreground lg:flex-row lg:overflow-hidden"
    >
      <div
        className={cn(
          "relative hidden h-full min-h-0 shrink-0 lg:flex motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out",
          sidebarCollapsed ? "w-24" : ADMIN_SIDEBAR_WIDTH_CLASS,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
            sidebarCollapsed ? "pointer-events-none translate-x-2 opacity-0" : "translate-x-0 opacity-100",
          )}
        >
          <AdminSidebar
            user={user}
            className="h-full w-full overflow-hidden border-e border-[color:var(--workspace-border)]"
          />
        </div>
        <button
          type="button"
          onClick={toggleDesktopSidebar}
          className={cn(
            "absolute top-6 z-10 inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-2 text-[var(--workspace-muted)] shadow-sm transition hover:bg-[var(--workspace-elevated)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)]",
            sidebarCollapsed ? "left-1/2 -translate-x-1/2" : "left-6",
          )}
          aria-label={sidebarCollapsed ? "إظهار الشريط الجانبي" : "طي الشريط الجانبي"}
          title={sidebarCollapsed ? "إظهار الشريط الجانبي" : "طي الشريط الجانبي"}
        >
          {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        <div
          className={cn(
            "hidden h-full w-full lg:flex motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
            sidebarCollapsed ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-3 opacity-0",
          )}
          aria-hidden={!sidebarCollapsed}
        >
          <AdminSidebar
            user={user}
            collapsed
            className="h-full w-full overflow-hidden border-e border-[color:var(--workspace-border)]"
          />
        </div>
      </div>

      <div className="relative flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col bg-transparent lg:overflow-hidden">
        <AdminTopNavbar user={user} mobileNavigation={<AdminSidebarDrawer user={user} />} />

        <main className="flex h-full min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-y-auto overflow-x-clip motion-safe:animate-zone-page-enter">
          <div
            data-slot="admin-content"
            className="flex h-full min-h-0 min-w-0 max-w-full flex-1 basis-0 flex-col overflow-x-clip px-4 py-5 sm:px-6 lg:px-8 lg:py-6"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
