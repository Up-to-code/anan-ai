"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type BrandWorkspaceTab = {
  href: string;
  label: React.ReactNode;
};

/**
 * WHY:   Route-backed zone tabs should feel like a primary branded control instead of generic utility pills.
 * WHAT:  Renders a responsive tab row with active-route highlighting and a subtle underline treatment.
 * HOW:   Matches exact href or nested route prefixes using the current pathname.
 */
export default function BrandWorkspaceTabs({
  tabs,
  className,
}: {
  tabs: BrandWorkspaceTab[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 lg:px-8", className)}>
      <div className="flex flex-wrap gap-2 py-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "group relative overflow-hidden border px-4 py-3 text-xs font-black tracking-[0.18em] transition",
                isActive
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700",
              )}
            >
              <span className="relative z-10">{tab.label}</span>
              <span
                className={cn(
                  "absolute inset-x-3 bottom-0 h-0.5 origin-right transition-transform duration-200",
                  isActive ? "scale-x-100 bg-blue-600" : "scale-x-0 bg-blue-400 group-hover:scale-x-100",
                )}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
