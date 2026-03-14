"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, Mail, User } from "lucide-react";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { cn } from "@/lib/utils";
import { useWorkspaceSignalCounts } from "../(zones)/inbox/InboxPage/useRealtimeInbox";
import type { SidebarUser } from "@/components/shared/Sidebar/types";

/**
 * WHY:   Workspace screens need one shared top navbar for identity, organization context, and incoming signals.
 * WHAT:  Renders the user card, organization summary, mobile nav trigger slot, and notifications/messages badges.
 * HOW:   Receives serializable user, organization, and optional mobile-navigation UI from the workspace shell.
 */
export default function WorkspaceTopNavbar({
  user,
  organization,
  visibleZoneKeys,
  initialSignalCounts = { notificationCount: 0, inboxCount: 0 },
  mobileNavigation,
}: {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  visibleZoneKeys?: WorkspaceZoneKey[];
  initialSignalCounts?: { notificationCount: number; inboxCount: number };
  mobileNavigation?: React.ReactNode;
}) {
  const pathname = usePathname();
  const signalCounts = useWorkspaceSignalCounts(initialSignalCounts);
  const isInboxActive = pathname.startsWith("/ws/inbox");
  const canUseInbox = (visibleZoneKeys ?? []).includes("inbox");
  const canManageOrganization = (visibleZoneKeys ?? []).includes("settings");

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="px-6 py-4 lg:px-8">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {mobileNavigation ? <div className="lg:hidden">{mobileNavigation}</div> : null}

            <div className="hidden min-w-[360px] overflow-hidden border border-slate-200 bg-white lg:flex lg:flex-col">
              <IdentityCard
                user={user}
                organization={organization}
                canManageOrganization={canManageOrganization}
              />
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

        <div className="mt-3 border border-slate-200 bg-white lg:hidden">
          <IdentityCard
            user={user}
            organization={organization}
            canManageOrganization={canManageOrganization}
            compact
          />
        </div>
      </div>
    </div>
  );
}

function IdentityCard({
  user,
  organization,
  canManageOrganization,
  compact,
}: {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  canManageOrganization: boolean;
  compact?: boolean;
}) {
  return (
    <>
      <Link
        href="/ws/me"
        className={cn(
          "flex items-center gap-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          compact ? "px-4 py-3" : "px-4 py-3",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-950">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-black text-slate-950">
            {user.name || "مستخدم أنان"}
          </div>
          <div className="truncate text-xs font-medium text-slate-500">
            {user.email || "حساب Google"}
          </div>
        </div>
      </Link>

      <div className="h-px bg-slate-200" />

      {canManageOrganization ? (
        <Link
          href="/ws/settings"
          className={cn(
            "flex items-center gap-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
            compact ? "px-4 py-3" : "px-4 py-3",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-950">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-slate-950">{organization.name}</div>
            <div className="truncate text-xs font-medium text-slate-500">{organization.navbarSubtitle}</div>
          </div>
        </Link>
      ) : (
        <div className={cn("flex items-center gap-3", compact ? "px-4 py-3" : "px-4 py-3")}>
          <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-white text-slate-950">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-slate-950">{organization.name}</div>
            <div className="truncate text-xs font-medium text-slate-500">{organization.navbarSubtitle}</div>
          </div>
        </div>
      )}
    </>
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
