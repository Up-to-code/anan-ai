"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarUser } from "@/components/shared/Sidebar/types";
import type { WorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import type { ZoneShellData } from "../../_lib/zones";

/**
 * WHY:   Business zones need their own persistent navigation so each zone feels like a dedicated workspace.
 * WHAT:  Renders the full-height zone sidebar with branding, back action, local links, and user identity.
 * HOW:   Uses the current pathname to highlight the active local link while keeping the sidebar focused on the current zone only.
 */
export default function ZoneSidebar({
  zone,
  user,
  organization,
}: {
  zone: ZoneShellData;
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
}) {
  const pathname = usePathname();

  return (
    <aside
      data-slot="zone-sidebar"
      className="flex h-full flex-col border-e border-white/5 bg-slate-950 text-white"
    >
      <div className="border-b border-white/5 px-6 py-8">
        <div className="text-3xl font-black tracking-tighter text-white">{organization.name}</div>
        <div className="mt-6 space-y-2">
          <div className="text-xs font-bold text-slate-300">{organization.sidebarSubtitle}</div>
          <h1 className="text-2xl font-black tracking-tight text-white">{zone.label}</h1>
          <p className="text-sm font-medium leading-6 text-slate-300">{zone.description}</p>
        </div>
      </div>

      <div className="border-b border-white/5 px-4 py-4">
        <Link
          href="/ws"
          className="flex items-center justify-between border border-white/5 bg-white/5 px-5 py-4 text-[11px] font-black tracking-[0.18em] text-white transition hover:border-blue-600 hover:bg-blue-600 shadow-none"
        >
          <span className="flex items-center gap-3">
            <ArrowLeft className="h-4 w-4" />
            العودة إلى لوحة العمل
          </span>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      <nav aria-label="Zone navigation" className="flex-1 space-y-2 px-4 py-8">
        {zone.localNav.map((item) => {
          if (!item.href || item.disabled) {
            return (
              <span
                key={`${zone.key}-${item.label}`}
                className="flex items-center justify-between border border-transparent px-5 py-4 text-[11px] font-black tracking-[0.18em] text-slate-400"
                aria-disabled="true"
              >
                <span>{item.label}</span>
                <ChevronLeft className="h-4 w-4" />
              </span>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between border px-5 py-4 text-[11px] font-black tracking-[0.18em] transition-all",
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-none"
                  : "border-transparent text-slate-400 hover:border-white/5 hover:bg-white/5 hover:text-white",
              )}
            >
              <span>{item.label}</span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-6">
        <Link
          href="/ws/me"
          className="group flex items-center gap-4 border border-transparent p-3 transition hover:border-white/5 hover:bg-white/5"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-blue-400/30 bg-blue-600/15 text-xs font-black uppercase text-blue-100">
            {(user.name || user.email || "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[10px] font-black uppercase tracking-widest text-white">
              {user.name || "مستخدم أنان"}
            </div>
            <div className="truncate text-[10px] font-bold text-slate-400">
              {user.email || "حساب google"}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
