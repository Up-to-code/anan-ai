"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Mail } from "lucide-react";
import WebLocaleSwitcher from "@/app/_components/WebLocaleSwitcher";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { WorkspaceZoneKey } from "@/server/contracts/workspace";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import { cn } from "@/lib/utils";
import { useWorkspaceSignalCounts } from "../(zones)/inbox/InboxPage/useRealtimeInbox";
import type { SidebarUser } from "./Sidebar/types";
import type { WorkspaceShellVariant } from "./WorkspaceShell";
import ThemeToggle from "@/app/_components/ThemeToggle";

const HEADER_ACTION_BASE_CLASS_NAME =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-panel)] px-3 text-[var(--workspace-bubble-other-foreground)] shadow-sm transition-colors hover:bg-[var(--workspace-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)]";
const HEADER_ICON_ACTION_CLASS_NAME = `${HEADER_ACTION_BASE_CLASS_NAME} w-10 justify-center px-0`;
const HEADER_AVATAR_CLASS_NAME =
  "relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-elevated)] text-[10px] font-black tracking-[0.12em] text-foreground";

function getOrganizationAvatarLabel(name: string) {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return tokens.map((token) => token[0]).join("").toUpperCase() || "O";
}

function getUserAvatarLabel(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";
  return source[0]?.toUpperCase() ?? "U";
}

function HeaderAvatar({
  image,
  label,
  alt,
}: {
  image?: string | null;
  label: string;
  alt: string;
}) {
  if (image) {
    return <img src={image} alt={alt} className="h-full w-full object-cover" />;
  }

  return <span>{label}</span>;
}

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
  const { dictionary, direction, isRtl } = useWebLocale();
  const signalCounts = useWorkspaceSignalCounts(initialSignalCounts);
  const isInboxActive = pathname.startsWith("/ws/inbox");
  const canUseInbox = (visibleZoneKeys ?? []).includes("inbox");
  const isAssistantVariant = variant === "assistant";
  const resolvedTitle = title ?? (isAssistantVariant ? dictionary.nav.assistantTitle : dictionary.nav.overviewTitle);
  const orgSubtitle = organization.navbarSubtitle?.trim() || organization.sidebarSubtitle?.trim() || dictionary.nav.workspaceFallback;
  const organizationSettingsHref = "/ws/settings?tab=org";
  const userSettingsHref = "/ws/settings";
  const organizationAvatarLabel = getOrganizationAvatarLabel(organization.name);
  const userAvatarLabel = getUserAvatarLabel(user.name, user.email);
  const userDisplayName = user.name?.trim() || user.email?.trim() || dictionary.settings.title;

  return (
    <header
      data-slot="workspace-top-navbar"
      data-variant={variant}
      dir={direction}
      className={cn(
        "flex shrink-0 items-center justify-between gap-3 border-b transition-colors",
        isAssistantVariant
          ? "h-14 border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-3 sm:px-5 lg:px-6"
          : "h-16 border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 sm:px-6",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {mobileNavigation ? <div className="lg:hidden">{mobileNavigation}</div> : null}
        <h1
          className={cn(
            "truncate text-foreground",
            isAssistantVariant ? "text-base font-semibold" : "text-base font-black sm:text-lg",
          )}
        >
          {resolvedTitle}
        </h1>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-[18px] border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_94%,transparent)] p-1 sm:gap-2 sm:p-1.5 shadow-sm",
          isAssistantVariant ? "max-w-[calc(100vw-7rem)]" : "max-w-[calc(100vw-6rem)]",
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
        <Link
          href={organizationSettingsHref}
          aria-label={dictionary.settings.organizationSettingsTitle}
          title={`${dictionary.settings.organizationSettingsTitle} · ${orgSubtitle}`}
          className={cn(
            HEADER_ACTION_BASE_CLASS_NAME,
            "w-10 justify-center px-0 sm:min-w-0 sm:max-w-[13.5rem] sm:justify-start sm:ps-1.5 sm:pe-3",
            organization.isVerified
              ? ""
              : "border-amber-400/80 ring-2 ring-amber-300/50 hover:bg-amber-50/70 dark:hover:bg-amber-500/10",
          )}
        >
          <span className={HEADER_AVATAR_CLASS_NAME}>
            <HeaderAvatar image={organization.logoUrl} label={organizationAvatarLabel} alt={organization.name} />
          </span>
          <span className={cn("hidden min-w-0 flex-1 truncate text-sm font-bold sm:block", isRtl ? "text-right" : "text-left")}>
            {organization.name}
          </span>
          {!organization.isVerified ? (
            <span
              aria-hidden="true"
              className="absolute end-2 top-2 h-2.5 w-2.5 rounded-full border border-[var(--workspace-panel)] bg-amber-400"
            />
          ) : null}
        </Link>
        <Link
          href={userSettingsHref}
          className={cn(
            HEADER_ICON_ACTION_CLASS_NAME,
            "relative overflow-hidden",
          )}
          aria-label={userDisplayName}
          title={userDisplayName}
        >
          <span className={HEADER_AVATAR_CLASS_NAME}>
            <HeaderAvatar image={user.image} label={userAvatarLabel} alt={userDisplayName} />
          </span>
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
