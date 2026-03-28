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
 * WHY:   Secondary navigation in Nexus should feel light and modern, using subtle pill indicators.
 * WHAT:  Modernizes the tab row with high-contrast text and a minimalist active state.
 * HOW:   Uses rounded-full for a subtle active-background or refined underline to match the platform HUD.
 */
export default function RouteTabs({ tabs, className }: RouteTabsProps) {
  const pathname = usePathname();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav className={cn("flex flex-wrap items-center gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-1", className)} aria-label="section tabs">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "px-4 py-2.5 text-[13px] font-black uppercase tracking-widest transition-all rounded-full border border-transparent",
              active
                ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
