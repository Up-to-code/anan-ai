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
 * WHY:   Every admin section now uses route-backed tabs to keep each screen focused on a single goal.
 * WHAT:  Renders a horizontal tab bar that highlights the active route and navigates through real URLs.
 * HOW:   Matches the current pathname against each configured tab and applies the shared Anan admin styling.
 */
export default function RouteTabs({ tabs, className }: RouteTabsProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-wrap gap-3", className)} aria-label="section tabs">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border px-4 py-2 text-sm font-black transition-colors",
              active
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-slate-200/60 bg-white/50 backdrop-blur-sm text-slate-600 hover:border-slate-300 hover:bg-white hover:text-blue-600 shadow-sm",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
