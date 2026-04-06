"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { RouteTab } from "@/lib/adminNavigation";

type RouteTabsProps = {
  tabs: RouteTab[];
  className?: string;
};

/**
 * WHY:   Secondary navigation should feel like part of the workspace shell rather than a separate admin sub-theme.
 * WHAT:  Renders the shared section tabs using token-driven pill styles.
 * HOW:   Highlights the active route with the workspace accent and keeps inactive tabs calm but discoverable.
 */
export default function RouteTabs({ tabs, className }: RouteTabsProps) {
  const pathname = usePathname();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] pb-2",
        className,
      )}
      aria-label="section tabs"
    >
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-2xl border px-4 py-2.5 text-[12px] font-black uppercase tracking-[0.16em] transition-all",
              active
                ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_32%,transparent)] bg-[var(--workspace-highlight)] text-white shadow-sm"
                : "border-transparent text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_80%,transparent)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
