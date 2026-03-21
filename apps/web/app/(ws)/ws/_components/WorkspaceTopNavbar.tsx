"use client";

import ConvexClientProvider from "@/app/ConvexClientProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Mail } from "lucide-react";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { cn } from "@/lib/utils";
import { useWorkspaceSignalCounts } from "../(zones)/inbox/InboxPage/useRealtimeInbox";
import type { SidebarUser } from "@/components/shared/Sidebar/types";
import type { WorkspaceShellVariant } from "./WorkspaceShell";

/**
 * WHY:   Workspace screens need one shared top navbar for identity, organization context, and incoming signals.
 * WHAT:  Renders a compact unified account/org button, signal badges, and mobile nav trigger.
 * HOW:   Follows the dashboard redesign: unified profile on the end side, page context on the start side.
 */
export default function WorkspaceTopNavbar({
  ...props
}: {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  visibleZoneKeys?: WorkspaceZoneKey[];
  initialSignalCounts?: { notificationCount: number; inboxCount: number };
  variant?: WorkspaceShellVariant;
  title?: string;
  mobileNavigation?: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <WorkspaceTopNavbarInner {...props} />
    </ConvexClientProvider>
  );
}

function WorkspaceTopNavbarInner({
  user,
  organization,
  visibleZoneKeys,
  initialSignalCounts = { notificationCount: 0, inboxCount: 0 },
  variant = "default",
  title,
  mobileNavigation,
}: {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  visibleZoneKeys?: WorkspaceZoneKey[];
  initialSignalCounts?: { notificationCount: number; inboxCount: number };
  variant?: WorkspaceShellVariant;
  title?: string;
  mobileNavigation?: React.ReactNode;
}) {
  const pathname = usePathname();
  const signalCounts = useWorkspaceSignalCounts(initialSignalCounts);
  const isInboxActive = pathname.startsWith("/ws/inbox");
  const canUseInbox = (visibleZoneKeys ?? []).includes("inbox");
  const accountInitial = (user.name || user.email || "A").trim().slice(0, 1).toUpperCase();
  const isAssistantVariant = variant === "assistant";
  const resolvedTitle = title ?? (isAssistantVariant ? "مساعد عنان" : "نظرة عامة");

  return (
    <header
      data-slot="workspace-top-navbar"
      data-variant={variant}
      className={cn(
        "flex shrink-0 items-center justify-between border-b bg-white",
        isAssistantVariant
          ? "h-14 border-slate-200/80 px-4 sm:px-5 lg:px-6"
          : "h-16 border-slate-200 px-6",
      )}
    >
      {/* Start side (right in RTL): Mobile nav + page context */}
      <div className="flex items-center gap-3">
        {mobileNavigation ? <div className="lg:hidden">{mobileNavigation}</div> : null}
        <h1
          className={cn(
            isAssistantVariant ? "text-base font-semibold text-slate-900" : "text-lg font-black text-slate-800",
          )}
        >
          {resolvedTitle}
        </h1>
      </div>

      {/* End side (left in RTL): Signal buttons + unified account */}
      <div className={cn("flex items-center", isAssistantVariant ? "gap-3" : "gap-4")}>
        {/* Action Group */}
        <div className={cn("flex items-center gap-1 border-s border-slate-200", isAssistantVariant ? "ps-3" : "ps-4")}>
          <SignalButton
            label="الإشعارات"
            count={signalCounts.notificationCount}
            href="/ws/notifications"
            icon={<Bell className="h-5 w-5" />}
            variant={variant}
          />
          {canUseInbox ? (
            <SignalButton
              label="الرسائل"
              count={signalCounts.inboxCount}
              href="/ws/inbox"
              isActive={isInboxActive}
              icon={<Mail className="h-5 w-5" />}
              variant={variant}
            />
          ) : null}
        </div>

        {/* Unified Account / Org Button */}
        <Link
          href="/ws/me"
          className={cn(
            "group flex items-center text-right transition hover:bg-slate-50",
            isAssistantVariant ? "gap-2 rounded-lg px-2 py-1.5" : "gap-3 rounded-full p-1 pe-3",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center text-sm font-bold text-white transition",
              isAssistantVariant
                ? "h-8 w-8 rounded-lg bg-slate-900"
                : "h-9 w-9 rounded-full bg-blue-600 shadow-sm ring-2 ring-transparent group-hover:ring-blue-100",
            )}
          >
            {accountInitial}
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-black leading-none text-slate-700">
              {user.name || "مستخدم عنان"}
            </p>
            <p className="mt-1 text-[11px] font-bold leading-none text-slate-500">
              {organization.name}
            </p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 transition group-hover:text-slate-600 sm:block" />
        </Link>
      </div>
    </header>
  );
}

function SignalButton({
  label,
  count,
  href,
  icon,
  isActive,
  variant = "default",
}: {
  label: string;
  count: number;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
  variant?: WorkspaceShellVariant;
}) {
  const isAssistantVariant = variant === "assistant";

  return (
    <Link
      href={href}
      className={cn(
        "relative p-2 transition",
        isAssistantVariant ? "rounded-lg" : "rounded-full",
        isActive
          ? isAssistantVariant
            ? "bg-slate-100 text-slate-900"
            : "bg-blue-50 text-blue-600"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
      )}
      aria-label={`${label}: ${count}`}
    >
      {icon}
      {count > 0 ? (
        <span className="absolute end-1 top-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 ring-2 ring-white" />
      ) : null}
    </Link>
  );
}
