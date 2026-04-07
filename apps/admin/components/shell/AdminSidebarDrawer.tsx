"use client";

import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import type { SessionUser } from "@/lib/serverSession";

type AdminSidebarDrawerProps = {
  user: Pick<SessionUser, "name" | "email" | "image">;
};

/**
 * WHY:   Small screens still need direct access to the full admin navigation without shrinking the content surface.
 * WHAT:  Renders the mobile nav trigger and a slide-in admin drawer.
 * HOW:   Controls an overlay locally, closes on backdrop or link navigation, and locks body scrolling while open.
 */
export default function AdminSidebarDrawer({ user }: AdminSidebarDrawerProps) {
  const [open, setOpen] = useState(false);
  const [isRtl, setIsRtl] = useState(true);
  const drawerId = useId();

  useEffect(() => {
    setIsRtl(document.documentElement.dir !== "ltr");
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="فتح التنقل"
        aria-expanded={open}
        aria-controls={drawerId}
        data-slot="admin-sidebar-trigger"
        className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] shadow-sm transition-all hover:bg-[var(--workspace-accent-soft)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] active:scale-95"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق التنقل"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div
            id={drawerId}
            data-slot="admin-sidebar-mobile-drawer"
            className="absolute inset-y-0 w-[min(22rem,100vw)] max-w-full shadow-2xl shadow-black/45"
            style={isRtl ? { right: 0 } : { left: 0 }}
          >
            <div className="relative flex h-full w-full">
              <AdminSidebar user={user} mode="drawer" className="h-full w-full" onNavigate={() => setOpen(false)} />

              <button
                type="button"
                aria-label="إغلاق التنقل"
                className="absolute top-3 inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-white/10 bg-black/20 text-white/75 backdrop-blur-sm transition-all hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)] hover:bg-black/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] active:scale-95"
                style={isRtl ? { left: "0.75rem" } : { right: "0.75rem" }}
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
