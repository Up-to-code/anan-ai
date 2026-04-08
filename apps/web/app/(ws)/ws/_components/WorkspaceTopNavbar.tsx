"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Bell, Mail } from "lucide-react";
import WebLocaleSwitcher from "@/app/_components/WebLocaleSwitcher";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { cn } from "@/lib/utils";
import { useWorkspaceSignalCounts } from "../(zones)/inbox/pages/InboxPage/useRealtimeInbox";
import type { SidebarUser } from "./Sidebar/types";
import ThemeToggle from "@/app/_components/ThemeToggle";
import type { ComplianceBanner } from "../_lib/complianceBanner";
import WorkspaceIdentityMenu from "./WorkspaceIdentityMenu";
import { matchesWorkspacePath, type WorkspaceShellVariant } from "../_lib/workspaceChrome";

const HEADER_ACTION_BASE_CLASS_NAME =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[var(--workspace-panel)] px-3 text-[var(--workspace-bubble-other-foreground)] transition-colors hover:bg-[var(--workspace-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)]";
const HEADER_ICON_ACTION_CLASS_NAME = `${HEADER_ACTION_BASE_CLASS_NAME} w-10 justify-center px-0`;
const ASSISTANT_HEADER_CLASS_NAME =
  "h-14 border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] bg-[var(--workspace-chrome-header-bg)] px-4 sm:px-5 lg:px-6";
const DEFAULT_HEADER_CLASS_NAME =
  "h-16 border-[color:var(--workspace-border)] bg-[var(--workspace-chrome-header-bg)] px-4 sm:px-6";

/**
 * WHY:   Workspace screens need one shared top navbar for identity, organization context, and incoming signals.
 * WHAT:  Renders a compact unified account/org button, signal badges, and mobile nav trigger.
 * HOW:   Follows the dashboard redesign: unified profile on the end side, page context on the start side.
 */
export default function WorkspaceTopNavbar({
  user,
  organization,
  visibleZoneKeys,
  initialSignalCounts = { notificationCount: 0, inboxCount: 0 },
  complianceBanner = null,
  variant = "default",
  title,
  mobileNavigation,
}: {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  visibleZoneKeys?: WorkspaceZoneKey[];
  initialSignalCounts?: { notificationCount: number; inboxCount: number };
  complianceBanner?: ComplianceBanner | null;
  variant?: WorkspaceShellVariant;
  title?: string;
  mobileNavigation?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { dictionary, direction, isRtl } = useWebLocale();
  const signalCounts = useWorkspaceSignalCounts(initialSignalCounts);
  const isInboxActive = matchesWorkspacePath(pathname, "/ws/inbox");
  const canUseInbox = (visibleZoneKeys ?? []).includes("inbox");
  const isAssistantVariant = variant === "assistant";
  const resolvedTitle = title ?? (isAssistantVariant ? dictionary.nav.assistantTitle : dictionary.nav.overviewTitle);
  const verificationHref = complianceBanner?.ctaHref ?? "/ws/settings?tab=verification";
  const verificationBadgeLabel = complianceBanner?.ctaLabel ?? complianceBanner?.title ?? null;

  return (
    <header
      data-slot="workspace-top-navbar"
      data-variant={variant}
      dir={direction}
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-b transition-colors",
        isAssistantVariant
          ? ASSISTANT_HEADER_CLASS_NAME
          : DEFAULT_HEADER_CLASS_NAME,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {mobileNavigation ? <div className="lg:hidden">{mobileNavigation}</div> : null}
        {isAssistantVariant ? (
          <div className={cn("flex min-w-0 items-center gap-2.5", isRtl ? "flex-row-reverse" : "flex-row")}>
            <h1 className="truncate text-[15px] font-bold text-foreground">{resolvedTitle}</h1>
            <span className="h-1 w-1 shrink-0 rounded-full bg-[color:var(--workspace-border)]" aria-hidden="true" />
            <p
              className={cn(
                "hidden max-w-[18rem] truncate text-[12px] font-medium text-[var(--workspace-muted)] sm:block",
                isRtl ? "text-right" : "text-left",
              )}
              title={organization.name}
            >
              {organization.name}
            </p>
          </div>
        ) : (
          <h1 className="truncate text-base font-black text-foreground sm:text-lg">{resolvedTitle}</h1>
        )}
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-1 sm:gap-2",
          isAssistantVariant ? "max-w-[calc(100vw-7rem)]" : "max-w-[calc(100vw-6rem)] rounded-[18px] border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_94%,transparent)] p-1 sm:p-1.5",
        )}
      >
        <WebLocaleSwitcher className="rounded-xl border-[color:transparent] bg-transparent shadow-none hover:bg-[var(--workspace-elevated)]" />
        <ThemeToggle className="rounded-xl border-transparent bg-transparent shadow-none hover:bg-[var(--workspace-elevated)]" />
        <div className="h-6 w-px bg-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)]" aria-hidden="true" />
        <div className="flex items-center gap-1 sm:gap-2">
          <SignalButton
            label={dictionary.nav.notifications}
            count={signalCounts.notificationCount}
            href="/ws/notifications"
            icon={<Bell className="h-5 w-5" />}
            variant={variant}
          />
          {canUseInbox ? (
            <SignalButton
              label={dictionary.nav.inbox}
              count={signalCounts.inboxCount}
              href="/ws/inbox"
              isActive={isInboxActive}
              icon={<Mail className="h-5 w-5" />}
              variant={variant}
            />
          ) : null}
        </div>
        <div className="h-6 w-px bg-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)]" aria-hidden="true" />
        {verificationBadgeLabel ? (
          <Link
            href={verificationHref}
            data-slot="workspace-compliance-badge"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold text-amber-900 transition hover:border-amber-400/55 hover:bg-amber-400/15 dark:border-amber-400/40 dark:bg-amber-400/12 dark:text-amber-200"
            title={complianceBanner?.title}
            aria-label={verificationBadgeLabel}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{verificationBadgeLabel}</span>
          </Link>
        ) : null}
        <WorkspaceIdentityMenu user={user} organization={organization} variant={variant} />
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
        HEADER_ICON_ACTION_CLASS_NAME,
        "relative",
        isActive
          ? isAssistantVariant
            ? "bg-[var(--workspace-elevated)] text-foreground"
            : "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-[var(--workspace-highlight)]"
          : "text-[var(--workspace-muted)]",
      )}
      aria-label={`${label}: ${count}`}
      title={label}
    >
      {icon}
      {count > 0 ? (
        <span className="absolute end-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-[var(--workspace-panel)]" />
      ) : null}
    </Link>
  );
}
