"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type TabItem = {
  href: string;
  label: string;
};

type DashBarProps = {
  tabs?: TabItem[];
  actions?: React.ReactNode;
  className?: string;
};

export default function DashBar({ tabs, actions, className }: DashBarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-16 items-center justify-between border-b-2 border-slate-100 bg-white px-4",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        {tabs?.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/ws/me" && pathname.startsWith(`${tab.href}/`));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest transition",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-blue-600",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
