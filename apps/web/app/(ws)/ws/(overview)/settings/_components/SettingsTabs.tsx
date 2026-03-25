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
  tabs: readonly SettingsTabItem[];
  defaultTab?: string;
}

function SettingsTabLink({
  href,
  isActive,
  tab,
}: {
  href: string;
  isActive: boolean;
  tab: SettingsTabItem;
}) {
  const Icon = tab.icon;
  return (
    <Link
      key={tab.key}
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
        isActive
          ? "border-slate-950 text-slate-950"
          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
      )}
    >
      {Icon ? (
        <Icon className={cn("h-4 w-4", isActive ? "text-slate-950" : "text-slate-400 group-hover:text-slate-600")} />
      ) : null}
      {tab.label}
    </Link>
  );
}

function buildSettingsHref(pathname: string | null, searchParams: ReturnType<typeof useSearchParams>, tabKey: string) {
  const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
  nextParams.set("tab", tabKey);
  const hrefPath = pathname && pathname.length > 0 ? pathname : "/ws/settings";
  const hrefQuery = nextParams.toString();
  return hrefQuery ? `${hrefPath}?${hrefQuery}` : hrefPath;
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
          const href = buildSettingsHref(pathname, searchParams, tab.key);
          return <SettingsTabLink key={tab.key} href={href} isActive={isActive} tab={tab} />;
        })}
      </nav>
    </div>
  );
}
