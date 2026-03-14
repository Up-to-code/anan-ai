"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, Mail } from "lucide-react";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { cn } from "@/lib/utils";
import { useWorkspaceSignalCounts } from "../(zones)/inbox/InboxPage/useRealtimeInbox";

/**
 * WHY:   Workspace screens need one shared top navbar for identity, organization context, and incoming signals.
 * WHAT:  Renders the user card, organization summary, mobile nav trigger slot, and notifications/messages badges.
 * HOW:   Receives serializable user, organization, and optional mobile-navigation UI from the workspace shell.
 */
export default function WorkspaceTopNavbar({
  organization,
  visibleZoneKeys,
  initialSignalCounts = { notificationCount: 0, inboxCount: 0 },
  mobileNavigation,
}: {
  organization: WorkspaceOrganizationDisplay;
  visibleZoneKeys?: WorkspaceZoneKey[];
  initialSignalCounts?: { notificationCount: number; inboxCount: number };
  mobileNavigation?: React.ReactNode;
}) {
  const pathname = usePathname();
  const signalCounts = useWorkspaceSignalCounts(initialSignalCounts);
  const isInboxActive = pathname.startsWith("/ws/inbox");
  const canUseInbox = (visibleZoneKeys ?? []).includes("inbox");

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex w-full items-center justify-between gap-3 px-6 py-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {mobileNavigation ? <div className="lg:hidden">{mobileNavigation}</div> : null}

          <div className="hidden min-w-[320px] items-center gap-3 border border-slate-200 bg-white px-4 py-3 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-950">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black text-slate-950">{organization.name}</div>
              <div className="truncate text-xs font-medium text-slate-500">{organization.navbarSubtitle}</div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SignalButton
            label="الإشعارات"
            count={signalCounts.notificationCount}
            href="/ws/notifications"
            icon={<Bell className="h-4 w-4" />}
          />
          {canUseInbox ? (
            <SignalButton
              label="الرسائل"
              count={signalCounts.inboxCount}
              href="/ws/inbox"
              isActive={isInboxActive}
              icon={<Mail className="h-4 w-4" />}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SignalButton({
  label,
  count,
  href,
  icon,
  isActive,
}: {
  label: string;
  count: number;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center gap-3 border px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all",
        isActive
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-200 bg-white text-slate-950 hover:bg-slate-50"
      )}
      aria-label={`${label}: ${count}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {count > 0 ? (
        <span className={cn(
          "inline-flex min-w-6 items-center justify-center rounded-none px-2 py-0.5 text-[11px] font-black",
          isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white"
        )}>
          {count}
        </span>
      ) : null}
    </Link>
  );
}
