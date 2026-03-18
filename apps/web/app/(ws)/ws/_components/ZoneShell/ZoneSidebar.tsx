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
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/5 px-6">
        <span className="text-xl font-black tracking-tight text-blue-400">
          عنان <span className="text-white">Anan</span>
        </span>
      </div>

      <div className="border-b border-white/5 px-6 py-8">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{organization.name}</div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">{zone.label}</h1>
        <p className="text-sm font-medium leading-relaxed text-slate-400">{zone.description}</p>
      </div>

      <div className="border-b border-white/5 px-4 py-4">
        <Link
          href="/ws"
          className="flex items-center justify-between border border-white/5 bg-white/5 px-5 py-3 text-[10px] font-black tracking-[0.18em] text-white transition hover:border-blue-600 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <span className="flex items-center gap-3">
            <ArrowLeft className="h-4 w-4" />
            العودة للرئيسية
          </span>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      <nav aria-label="Zone navigation" className="flex-1 space-y-1 px-4 py-6">
        {zone.localNav.map((item) => {
          if (!item.href || item.disabled) {
            return (
              <span
                key={`${zone.key}-${item.label}`}
                className="flex items-center justify-between border border-transparent px-5 py-3 text-[10px] font-black tracking-[0.18em] text-slate-500"
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
                "flex items-center justify-between border rounded-lg px-5 py-3 text-[10px] font-black tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                isActive
                  ? "border-blue-600/30 bg-blue-600/15 text-blue-400"
                  : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <span>{item.label}</span>
              <ChevronLeft className="h-3 w-3" />
            </Link>
          );
        })}
      </nav>
    </aside>

  );
}
