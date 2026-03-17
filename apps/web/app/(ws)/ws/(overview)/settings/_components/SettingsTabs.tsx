"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type SettingsTabItem = {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

interface SettingsTabsProps {
  tabs: SettingsTabItem[];
  defaultTab?: string;
}

export default function SettingsTabs({ tabs, defaultTab }: SettingsTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTab = searchParams?.get("tab");
  const currentTab = tabs.some((tab) => tab.key === selectedTab)
    ? selectedTab
    : defaultTab || tabs[0]?.key;

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex flex-wrap gap-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const Icon = tab.icon;
          const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
          nextParams.set("tab", tab.key);
          const hrefPath = pathname && pathname.length > 0 ? pathname : "/ws/settings";
          const hrefQuery = nextParams.toString();
          const href = hrefQuery ? `${hrefPath}?${hrefQuery}` : hrefPath;

          return (
            <Link
              key={tab.key}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group inline-flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-black tracking-wide transition-all",
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
                  )}
                />
              )}
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
