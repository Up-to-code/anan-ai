"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type BrandWorkspaceTab = {
  href: string;
  label: React.ReactNode;
  exact?: boolean;
};

export default function BrandWorkspaceTabs({
  tabs,
  className,
}: {
  tabs: BrandWorkspaceTab[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("border-b border-slate-200 bg-white px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950", className)}>
      <div className="flex flex-wrap gap-6 py-3">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "border-b-2 border-transparent pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-slate-950 text-slate-950 dark:border-slate-100 dark:text-slate-100"
                  : "text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-100",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
