"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { adminPrimaryNav } from "@/lib/adminNavigation";
import type { SessionUser } from "@/lib/serverSession";
import { cn } from "@/lib/utils";

type AdminSidebarMode = "desktop" | "drawer";

type AdminSidebarProps = {
  user: Pick<SessionUser, "name" | "email" | "image">;
  mode?: AdminSidebarMode;
  collapsed?: boolean;
  className?: string;
  titleId?: string;
  onNavigate?: () => void;
};

const SIDEBAR_SHELL_CLASS_NAME =
  "bg-[var(--workspace-sidebar)] text-[var(--workspace-bubble-other-foreground)]";
const SIDEBAR_PANEL_CLASS_NAME =
  "border border-[color:color-mix(in_srgb,var(--workspace-border)_90%,transparent)] bg-[var(--workspace-panel)]";
const NAV_ITEM_BASE_CLASS_NAME =
  "group flex min-w-0 items-center gap-3 rounded-sm border text-[13px] font-bold transition-[background-color,border-color,color,transform]";
const NAV_ITEM_ACTIVE_CLASS_NAME =
  "border-[color:var(--workspace-highlight-border)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-[var(--workspace-ink)]";
const NAV_ITEM_IDLE_CLASS_NAME =
  "border-transparent text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)] active:scale-[0.98]";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getUserAvatarLabel(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "A";
  return source[0]?.toUpperCase() ?? "A";
}

function UserAvatar({
  image,
  label,
  alt,
  className,
}: {
  image?: string | null;
  label: string;
  alt: string;
  className?: string;
}) {
  if (image) {
    return <img src={image} alt={alt} className={cn("h-full w-full object-cover", className)} />;
  }

  return <span className={className}>{label}</span>;
}

/**
 * WHY:   The MVP admin needs one compact navigation component that works in the desktop rail and mobile drawer.
 * WHAT:  Renders a flat two-item operations nav, operator identity, and the sign-out action.
 * HOW:   Uses the reduced admin registry as the single source of truth and switches between expanded and collapsed layouts locally.
 */
export default function AdminSidebar({
  user,
  mode = "desktop",
  collapsed = false,
  className,
  titleId,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const avatarLabel = getUserAvatarLabel(user.name, user.email);
  const isCompact = mode === "desktop" && collapsed;
  const shellTitle = "Admin navigation";

  return (
    <div
      aria-labelledby={titleId}
      data-slot={mode === "desktop" ? "admin-sidebar-desktop" : "admin-sidebar-drawer"}
      className={cn(
        "flex min-h-0 flex-col",
        SIDEBAR_SHELL_CLASS_NAME,
        mode === "desktop" ? "h-full" : "h-full w-full",
        className,
      )}
    >
      {titleId ? (
        <h2 id={titleId} className="sr-only">
          {shellTitle}
        </h2>
      ) : null}

      <div
        className={cn(
          "flex shrink-0 items-center border-b border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)]",
          isCompact ? "justify-center px-3 py-5" : "justify-between px-5 py-5",
        )}
      >
        <Link
          href="/overview"
          onClick={onNavigate}
          className={cn(
            "transition-[background-color,border-color,color,transform] active:scale-[0.98]",
            isCompact ? "flex h-10 w-10 items-center justify-center rounded-sm border" : "min-w-0",
            SIDEBAR_PANEL_CLASS_NAME,
          )}
          aria-label="عنان أدمن"
          title="عنان أدمن"
        >
          {isCompact ? (
            <span className="text-sm font-black tracking-[0.22em] text-[var(--workspace-bubble-other-foreground)]">AA</span>
          ) : (
            <div className="border-s-2 border-[var(--workspace-highlight)] ps-3 text-right">
              <div className="text-lg font-black tracking-[-0.04em] text-[var(--workspace-bubble-other-foreground)]">عنان أدمن</div>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--workspace-muted)]">
                MVP Operations
              </p>
            </div>
          )}
        </Link>
      </div>

      <nav
        aria-label="Admin navigation"
        className={cn("flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-4", isCompact && "px-1.5 pb-3 pt-3")}
      >
        {!isCompact ? (
          <div className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] px-1 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--workspace-muted)]">
            العمليات الأساسية
          </div>
        ) : null}

        <div className={cn("mt-2 space-y-1.5", isCompact && "mt-0")}>
          {adminPrimaryNav.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  NAV_ITEM_BASE_CLASS_NAME,
                  isCompact ? "h-10 justify-center rounded-sm px-0" : "px-3 py-2.5",
                  active ? NAV_ITEM_ACTIVE_CLASS_NAME : NAV_ITEM_IDLE_CLASS_NAME,
                )}
                title={label}
                aria-label={label}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border",
                    active
                      ? "border-[color:var(--workspace-highlight-border)] bg-[var(--workspace-highlight)] text-white"
                      : "border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] bg-[var(--workspace-panel-strong)] text-[var(--workspace-muted)] group-hover:text-[var(--workspace-bubble-other-foreground)]",
                  )}
                >
                  <Icon className="h-[16px] w-[16px] shrink-0" />
                </div>
                {!isCompact ? <span className="truncate text-right">{label}</span> : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)] px-3 py-4">
        {isCompact ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm text-[11px] font-black tracking-[0.18em] text-[var(--workspace-bubble-other-foreground)]",
                SIDEBAR_PANEL_CLASS_NAME,
              )}
              title={user.name ?? user.email ?? "مشرف المنصة"}
            >
              <UserAvatar image={user.image} label={avatarLabel} alt={user.name ?? user.email ?? "مشرف المنصة"} />
            </div>
            <LogoutButton className="h-10 w-10 rounded-sm border border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] bg-[var(--workspace-panel)] px-0 text-[var(--workspace-muted)] hover:bg-[var(--workspace-elevated)] hover:text-red-500">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">إنهاء الجلسة</span>
            </LogoutButton>
          </div>
        ) : (
          <div className={cn("space-y-3 rounded-md p-3", SIDEBAR_PANEL_CLASS_NAME)}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-sm border border-[color:color-mix(in_srgb,var(--workspace-border)_88%,transparent)] bg-[var(--workspace-panel-strong)] text-[11px] font-black tracking-[0.18em] text-[var(--workspace-bubble-other-foreground)]">
                <UserAvatar image={user.image} label={avatarLabel} alt={user.name ?? user.email ?? "مشرف المنصة"} />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="truncate text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
                  {user.name ?? "مشرف المنصة"}
                </div>
                <div className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--workspace-muted)]">
                  {user.email ?? "admin@anan.local"}
                </div>
              </div>
            </div>
            <LogoutButton className="h-11 w-full rounded-sm border border-[color:var(--workspace-border)] bg-[var(--workspace-panel-strong)] px-3 text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-elevated)] hover:text-red-500">
              <LogOut className="h-4 w-4" />
              <span>إنهاء الجلسة</span>
            </LogoutButton>
          </div>
        )}
      </div>
    </div>
  );
}
