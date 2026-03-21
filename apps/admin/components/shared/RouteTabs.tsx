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
 * WHY:   Admin sections still need route-backed secondary navigation, but in a simpler, more product-like style.
 * WHAT:  Renders a horizontal tab row with a plain underline active state.
 * HOW:   Matches the current pathname against each configured route and applies a subtle border indicator.
 */
export default function RouteTabs({ tabs, className }: RouteTabsProps) {
  const pathname = usePathname();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <nav className={cn("flex flex-wrap gap-5 border-b border-stone-300", className)} aria-label="section tabs">
      {tabs.map((tab) => {
        const active = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-1 py-3 text-sm font-medium transition-colors",
              active
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:border-stone-400 hover:text-slate-900",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
