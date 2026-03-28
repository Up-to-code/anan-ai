"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Mail } from "lucide-react";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { cn } from "@/lib/utils";
import { useWorkspaceSignalCounts } from "../(zones)/inbox/InboxPage/useRealtimeInbox";
import type { SidebarUser } from "./Sidebar/types";
import type { WorkspaceShellVariant } from "./WorkspaceShell";
import ThemeToggle from "@/app/_components/ThemeToggle";

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
  return <WorkspaceTopNavbarInner {...props} />;
}

function WorkspaceTopNavbarInner({
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
  const isAssistantVariant = variant === "assistant";
  const resolvedTitle = title ?? (isAssistantVariant ? "مساعد عنان" : "نظرة عامة");
  const orgSubtitle = organization.navbarSubtitle?.trim() || organization.sidebarSubtitle?.trim() || "مساحة العمل";

  return (
    <header
      data-slot="workspace-top-navbar"
      data-variant={variant}
      className={cn(
        "flex shrink-0 items-center justify-between border-b transition-colors",
        isAssistantVariant
          ? "h-14 border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 sm:px-5 lg:px-6"
          : "h-16 border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-6",
      )}
    >
      {/* Start side (right in RTL): Mobile nav + page context */}
      <div className="flex items-center gap-3">
        {mobileNavigation ? <div className="lg:hidden">{mobileNavigation}</div> : null}
        <h1
          className={cn(
            isAssistantVariant ? "text-base font-semibold text-foreground" : "text-lg font-black text-foreground",
          )}
        >
          {resolvedTitle}
        </h1>
      </div>

      {/* End side (left in RTL): Signal buttons + unified account */}
      <div className={cn("flex items-center", isAssistantVariant ? "gap-3" : "gap-4")}>
        <ThemeToggle className="h-9 w-9 rounded-[8px]" />
        {/* Action Group */}
        <div className={cn("flex items-center gap-1 border-s border-[color:var(--workspace-border)]", isAssistantVariant ? "ps-3" : "ps-4")}>
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
        <Link
          href="/ws/settings"
          className={cn(
            "flex items-center gap-3 rounded-[10px] border px-3 py-2 text-right transition",
            "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] hover:bg-[var(--workspace-accent-soft)]",
            isAssistantVariant ? "min-w-[160px]" : "min-w-[210px]",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-black text-foreground">{organization.name}</div>
            <div className="truncate text-[11px] text-muted-foreground">{orgSubtitle}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
        "rounded-[8px]",
        isActive
          ? isAssistantVariant
            ? "bg-muted text-foreground"
            : "bg-[color:color-mix(in_srgb,var(--workspace-highlight)_14%,transparent)] text-[var(--workspace-highlight)]"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-label={`${label}: ${count}`}
    >
      {icon}
      {count > 0 ? (
        <span className="absolute end-1 top-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 ring-2 ring-background" />
      ) : null}
    </Link>
  );
}
