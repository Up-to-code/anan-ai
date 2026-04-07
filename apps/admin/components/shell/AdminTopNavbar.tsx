"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { getPrimaryNavItem } from "@/lib/adminNavigation";
import type { SessionUser } from "@/lib/serverSession";
import { cn } from "@/lib/utils";
import { ADMIN_TOPBAR_HEIGHT_CLASS } from "@/components/shell/lib";

type AdminTopNavbarProps = {
  user: Pick<SessionUser, "name" | "email" | "image">;
  mobileNavigation?: React.ReactNode;
  title?: string;
};

function getUserAvatarLabel(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "A";
  return source[0]?.toUpperCase() ?? "A";
}

function UserAvatar({
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
 * WHY:   Admin pages need a stable top chrome for section context, identity, and the session exit action.
 * WHAT:  Renders the active section title, the mobile sidebar trigger, and the current operator badge.
 * HOW:   Derives the active label from `adminNavigation` and keeps the right-side identity cluster compact like the workspace shell.
 */
export default function AdminTopNavbar({ user, mobileNavigation, title }: AdminTopNavbarProps) {
  const pathname = usePathname();
  const activeItem = getPrimaryNavItem(pathname);
  const resolvedTitle = title ?? activeItem.title;
  const avatarLabel = getUserAvatarLabel(user.name, user.email);
  const displayName = user.name?.trim() || "مشرف المنصة";

  return (
    <header
      data-slot="admin-top-navbar"
      className="sticky top-0 z-40 shrink-0 border-b border-[color:var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_88%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--workspace-panel)_82%,transparent)]"
    >
      <div className={cn("flex w-full min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8", ADMIN_TOPBAR_HEIGHT_CLASS)}>
        <div className="flex min-w-0 items-center gap-3">
          {mobileNavigation ? <div className="lg:hidden">{mobileNavigation}</div> : null}
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--workspace-muted)]">
              التحكم الإداري
            </div>
            <p className="truncate text-base font-black text-[var(--workspace-bubble-other-foreground)] sm:text-lg">
              {resolvedTitle}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-[22px] border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_94%,transparent)] p-1.5 shadow-sm",
            "max-w-[calc(100vw-6rem)]",
          )}
        >
          <ThemeToggle />

          <div className="hidden items-center gap-3 rounded-[14px] bg-[var(--workspace-elevated)] px-3 py-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-panel)] text-[11px] font-black tracking-[0.18em] text-[var(--workspace-bubble-other-foreground)]">
              <UserAvatar image={user.image} label={avatarLabel} alt={displayName} />
            </div>
            <div className="min-w-0 text-right">
              <div className="truncate text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{displayName}</div>
              <div className="truncate text-[11px] font-medium text-[var(--workspace-muted)]">
                {user.email || "admin@anan.local"}
              </div>
            </div>
          </div>

          <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </div>

          <LogoutButton className="h-10 rounded-xl bg-[var(--workspace-highlight)] px-3 text-white shadow-sm hover:bg-[var(--workspace-highlight-strong)]">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">إنهاء الجلسة</span>
          </LogoutButton>
        </div>
      </div>
    </header>
  );
}
