"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { adminNavGroups } from "@/lib/adminNavigation";
import type { SessionUser } from "@/lib/serverSession";
import { cn } from "@/lib/utils";
import { resolveAdminSidebarGroupState, type AdminSidebarGroupState } from "./sidebarState";

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
  "border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[var(--workspace-panel)]";
const NAV_ITEM_BASE_CLASS_NAME =
  "group flex min-w-0 items-center gap-3 rounded-xl border text-[13px] font-bold transition-[background-color,border-color,color,box-shadow,transform]";
const NAV_ITEM_ACTIVE_CLASS_NAME =
  "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[var(--workspace-highlight)] text-white shadow-sm";
const NAV_ITEM_IDLE_CLASS_NAME =
  "border-transparent text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)] active:scale-[0.98]";

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
 * WHY:   The protected admin routes need one navigation component that can work in the desktop rail and the mobile drawer.
 * WHAT:  Renders the admin brand block, grouped navigation items, operator identity, and the sign-out action.
 * HOW:   Uses `adminNavigation` as the single source of truth and switches between expanded and collapsed layouts locally.
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
  const [groupState, setGroupState] = useState<AdminSidebarGroupState>(() =>
    resolveAdminSidebarGroupState(adminNavGroups, pathname),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem("admin_sidebar_groups");
      const parsed = stored ? (JSON.parse(stored) as Partial<AdminSidebarGroupState>) : null;
      setGroupState(resolveAdminSidebarGroupState(adminNavGroups, pathname, parsed));
    } catch {
      setGroupState(resolveAdminSidebarGroupState(adminNavGroups, pathname));
    }
  }, [pathname]);

  const resolvedGroupState = useMemo(
    () => resolveAdminSidebarGroupState(adminNavGroups, pathname, groupState),
    [groupState, pathname],
  );

  function toggleGroup(groupId: string) {
    const next = { ...resolvedGroupState, [groupId]: !resolvedGroupState[groupId] };
    setGroupState(next);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_sidebar_groups", JSON.stringify(next));
    }
  }

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
          "flex shrink-0 items-center border-b border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)]",
          isCompact ? "justify-center px-3 py-5" : "justify-between px-5 py-5",
        )}
      >
        <Link
          href="/overview"
          onClick={onNavigate}
          className={cn(
            "transition-[background-color,border-color,color,transform] active:scale-[0.98]",
            isCompact ? "flex h-10 w-10 items-center justify-center rounded-xl border" : "min-w-0",
            SIDEBAR_PANEL_CLASS_NAME,
          )}
          aria-label="عنان أدمن"
          title="عنان أدمن"
        >
          {isCompact ? (
            <span className="text-sm font-black tracking-[0.22em] text-[var(--workspace-bubble-other-foreground)]">AA</span>
          ) : (
            <div className="text-right">
              <div className="text-lg font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">عنان أدمن</div>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--workspace-muted)]">
                Workspace Chrome
              </p>
            </div>
          )}
        </Link>
      </div>

      <nav
        aria-label="Admin navigation"
        className={cn("flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-4", isCompact && "px-1.5 pb-3 pt-3")}
      >
        <div className={cn("space-y-5", isCompact && "space-y-4")}>
          {adminNavGroups.map((group) => (
            <div key={group.id} className={cn("space-y-2", isCompact && "space-y-1.5")}>
              {!isCompact ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={resolvedGroupState[group.id]}
                  aria-controls={`admin-sidebar-group-${group.id}`}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--workspace-muted)] transition-[background-color,color] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)]"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      resolvedGroupState[group.id] ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>
              ) : null}
              <div
                id={`admin-sidebar-group-${group.id}`}
                className={cn("space-y-1.5", !isCompact && !resolvedGroupState[group.id] && "hidden")}
              >
                {group.items.map(({ href, label, icon: Icon, dataMode }) => {
                  const active = isActivePath(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        NAV_ITEM_BASE_CLASS_NAME,
                        isCompact ? "h-10 justify-center rounded-[14px] px-0" : "px-3 py-2.5",
                        active ? NAV_ITEM_ACTIVE_CLASS_NAME : NAV_ITEM_IDLE_CLASS_NAME,
                      )}
                      title={label}
                      aria-label={label}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!isCompact ? (
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate text-right">{label}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em]",
                              dataMode === "live"
                                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                                : "bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]",
                            )}
                          >
                            {dataMode === "live" ? "live" : "mock"}
                          </span>
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] px-3 py-4">
        {isCompact ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-[11px] font-black tracking-[0.18em] text-[var(--workspace-bubble-other-foreground)]",
                SIDEBAR_PANEL_CLASS_NAME,
              )}
              title={user.name ?? user.email ?? "مشرف المنصة"}
            >
              <UserAvatar image={user.image} label={avatarLabel} alt={user.name ?? user.email ?? "مشرف المنصة"} />
            </div>
            <LogoutButton className="h-10 w-10 rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] bg-[var(--workspace-panel)] px-0 text-[var(--workspace-muted)] shadow-sm hover:bg-[var(--workspace-elevated)] hover:text-red-500">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">إنهاء الجلسة</span>
            </LogoutButton>
          </div>
        ) : (
          <div className={cn("space-y-3 rounded-2xl p-3", SIDEBAR_PANEL_CLASS_NAME)}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[var(--workspace-elevated)] text-[11px] font-black tracking-[0.18em] text-[var(--workspace-bubble-other-foreground)]">
                <UserAvatar image={user.image} label={avatarLabel} alt={user.name ?? user.email ?? "مشرف المنصة"} />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="truncate text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
                  {user.name || "مشرف المنصة"}
                </div>
                <div className="truncate text-[11px] font-medium text-[var(--workspace-muted)]">
                  {user.email || "admin@anan.local"}
                </div>
              </div>
            </div>

            <LogoutButton className="h-11 w-full rounded-xl bg-[var(--workspace-highlight)] px-3 text-white shadow-sm hover:bg-[var(--workspace-highlight-strong)]">
              <LogOut className="h-4 w-4" />
              إنهاء الجلسة
            </LogoutButton>
          </div>
        )}
      </div>
    </div>
  );
}
