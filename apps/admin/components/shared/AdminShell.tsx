"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/serverSession";
import AdminSidebar from "@/components/shell/AdminSidebar";
import AdminSidebarDrawer from "@/components/shell/AdminSidebarDrawer";
import AdminTopNavbar from "@/components/shell/AdminTopNavbar";
import {
  ADMIN_SIDEBAR_COLLAPSED_WIDTH_CLASS,
  ADMIN_SIDEBAR_EXPANDED_WIDTH_CLASS,
} from "@/components/shell/lib";
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

  function focusMainContent() {
    window.requestAnimationFrame(() => {
      document.getElementById("admin-main-content")?.focus();
    });
  }

  return (
    <>
      <a
        href="#admin-main-content"
        onClick={focusMainContent}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-[var(--workspace-highlight)] focus:px-4 focus:py-2 focus:text-sm focus:font-black focus:text-white focus:shadow-lg"
      >
        الانتقال إلى المحتوى الرئيسي
      </a>

      <div
        data-slot="admin-shell"
        className="workspace-root-chrome app-shell-height app-shell-fixed-height grid h-full min-h-0 w-full grid-rows-[1fr] overflow-hidden bg-[var(--workspace-shell)] font-cairo text-foreground lg:grid-cols-[auto_minmax(0,1fr)]"
      >
        <div
          className={cn(
            "relative hidden h-full min-h-0 shrink-0 lg:sticky lg:top-0 lg:flex lg:self-start lg:overflow-hidden motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out",
            sidebarCollapsed ? ADMIN_SIDEBAR_COLLAPSED_WIDTH_CLASS : ADMIN_SIDEBAR_EXPANDED_WIDTH_CLASS,
          )}
        >
          <div
            className={cn(
              "absolute inset-0 motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out",
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
              "absolute top-5 z-10 inline-flex h-9 min-w-9 items-center justify-center rounded-sm border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-2 text-[var(--workspace-muted)] transition-[background-color,color,box-shadow,transform] hover:bg-[var(--workspace-elevated)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--workspace-highlight-border)]",
              sidebarCollapsed ? "left-1/2 -translate-x-1/2" : "left-6",
            )}
            aria-label={sidebarCollapsed ? "إظهار الشريط الجانبي" : "طي الشريط الجانبي"}
            title={sidebarCollapsed ? "إظهار الشريط الجانبي" : "طي الشريط الجانبي"}
          >
            {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <div
            className={cn(
              "hidden h-full w-full lg:flex motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out",
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

        <div className="relative grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] bg-transparent">
          <AdminTopNavbar user={user} mobileNavigation={<AdminSidebarDrawer user={user} />} />

          <main
            id="admin-main-content"
            tabIndex={-1}
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-mt-24 focus:outline-none motion-safe:animate-zone-page-enter"
          >
            <div
              data-slot="admin-content"
              className="grid min-h-full w-full min-w-0 content-start gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:gap-5 lg:py-5"
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
