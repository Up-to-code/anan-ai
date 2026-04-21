"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ShieldUser,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveAvatarImageUrl } from "@/lib/avatarImage";
import { cn } from "@/lib/utils";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { WorkspaceOrganizationDisplay } from "../_lib/organizationDisplay";
import type { SidebarUser } from "./Sidebar/types";
import WorkspaceSignOutAction from "./WorkspaceSignOutAction";
import WorkspaceOrganizationSwitcher from "./WorkspaceOrganizationSwitcher";

type WorkspaceIdentityMenuProps = {
  user: SidebarUser;
  organization: WorkspaceOrganizationDisplay;
  variant?: "default" | "assistant";
};

export type WorkspaceIdentityAction = {
  key: "account";
  label: string;
  href: string;
  icon: LucideIcon;
};

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
  const resolvedImage = resolveAvatarImageUrl(image);

  if (resolvedImage) {
    return <img src={resolvedImage} alt={alt} className="h-full w-full object-cover" />;
  }

  return <span>{label}</span>;
}

function inferTypeMeta(organization: WorkspaceOrganizationDisplay) {
  const fallbackTypeLabel = organization.navbarSubtitle.split("·")[0]?.trim() || organization.name;
  const typeKey =
    organization.typeKey ??
    (/developer|promoteur|مطور/i.test(fallbackTypeLabel) ? "developer" : "broker");

  return {
    label: organization.typeLabel?.trim() || fallbackTypeLabel,
    Icon: typeKey === "developer" ? Building2 : BriefcaseBusiness,
  };
}

/**
 * WHY:   Workspace chrome needs one reusable identity-action model so account and organization entry points stay consistent anywhere we reuse the navbar identity cluster.
 * WHAT:  Returns the localized user and organization actions rendered by the workspace identity menu.
 * HOW:   Locks the account action to `/ws/me` and the organization action to `/ws/settings?tab=org`, with labels pulled from the shared dictionary.
 */
export function getWorkspaceIdentityActions(args: {
  accountLabel: string;
}): WorkspaceIdentityAction[] {
  return [
    {
      key: "account",
      label: args.accountLabel,
      href: "/ws/me",
      icon: ShieldUser,
    },
  ];
}

/**
 * WHY:   The navbar identity area should keep organization context and user actions together, while still separating account settings from organization settings.
 * WHAT:  Renders a reusable organization summary plus a user-avatar dropdown with localized account and organization actions.
 * HOW:   Uses the shared dropdown primitive with `align="end"` so popup positioning follows the viewport edge safely in both RTL and LTR.
 */
export default function WorkspaceIdentityMenu({
  user,
  organization,
  variant = "default",
}: WorkspaceIdentityMenuProps) {
  const { dictionary, isRtl } = useWebLocale();
  const actions = getWorkspaceIdentityActions({
    accountLabel: dictionary.settings.accountSettingsTitle,
  });
  const organizationAvatarLabel = getOrganizationAvatarLabel(organization.name);
  const userAvatarLabel = getUserAvatarLabel(user.name, user.email);
  const userDisplayName = user.name?.trim() || user.email?.trim() || dictionary.settings.accountSettingsTitle;
  const typeMeta = inferTypeMeta(organization);
  const isAssistantVariant = variant === "assistant";

  return (
    <div
      data-slot="workspace-identity-menu"
      className={cn(
        "flex min-w-0 items-center gap-2.5",
        isRtl ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Link
        href="/ws/settings?tab=org"
        data-slot="workspace-organization-settings-trigger"
        aria-label={dictionary.settings.organizationSettingsTitle}
        title={`${dictionary.settings.organizationSettingsTitle} · ${organization.name}`}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-xl bg-transparent px-2 py-1.5 text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)]",
            isRtl ? "flex-row-reverse" : "flex-row",
          )}
      >
        <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-elevated)] text-[10px] font-black tracking-[0.12em] text-foreground">
          <HeaderAvatar image={organization.logoUrl} label={organizationAvatarLabel} alt={organization.name} />
        </span>
        <div className={cn("min-w-0", isRtl ? "text-right" : "text-left")}>
          <div className="truncate text-[13px] font-bold text-[var(--workspace-bubble-other-foreground)]">
            {organization.name}
          </div>
          <div
            className={cn(
              "mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[var(--workspace-muted)]",
              isRtl ? "flex-row-reverse justify-end" : "flex-row justify-start",
            )}
          >
            <typeMeta.Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{typeMeta.label}</span>
          </div>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <button
              type="button"
              data-slot="workspace-user-settings-trigger"
              aria-label={dictionary.settings.accountSettingsTitle}
              title={dictionary.settings.accountSettingsTitle}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-transparent px-1.5 text-[var(--workspace-bubble-other-foreground)] transition hover:bg-[var(--workspace-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)]",
                isRtl ? "flex-row-reverse" : "flex-row",
                isAssistantVariant ? "min-w-[3rem]" : undefined,
              )}
            >
              <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-elevated)] text-[10px] font-black tracking-[0.12em] text-foreground">
                <HeaderAvatar image={user.image} label={userAvatarLabel} alt={userDisplayName} />
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--workspace-muted)]" />
            </button>
          )}
        />
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[min(19rem,calc(100vw-1rem))] min-w-0 rounded-[16px] bg-[var(--workspace-panel)] p-1 shadow-none ring-0"
        >
          <div className="px-1 pb-1">
            <WorkspaceOrganizationSwitcher />
          </div>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.key}
              render={<Link href={action.href} />}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[var(--workspace-bubble-other-foreground)] focus:bg-[var(--workspace-elevated)] focus:text-[var(--workspace-bubble-other-foreground)]",
                isRtl ? "flex-row-reverse text-right" : "flex-row text-left",
              )}
            >
              <action.icon className="h-4 w-4 shrink-0 text-[var(--workspace-muted)]" />
              <span className="min-w-0 flex-1 text-[13px] font-bold">
                {action.label}
              </span>
            </DropdownMenuItem>
          ))}
          <WorkspaceSignOutAction variant="menu" />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
