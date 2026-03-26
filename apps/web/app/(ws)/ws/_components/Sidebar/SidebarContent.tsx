"use client";

import { useCallback } from "react";
import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";
import { cn } from "@/lib/utils";
import type { SidebarProps } from "./types";
import { PenSquare, X, ChevronDown, MessageSquareText } from "lucide-react";
import { getWorkspaceZonesForKeys } from "../../_lib/zones";
import { useAssistantThreads } from "./useAssistantThreads";

function getThreadLabel(thread: AnanProThreadSummary) {
  const title = thread.title?.trim();
  return title && title.length > 0 ? title : "محادثة بدون عنوان";
}

function formatThreadDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SidebarContent({
  user,
  organization,
  visibleZoneKeys,
  recentAssistantThreads = [],
  allAssistantThreads = [],
  mode = "desktop",
  onNavigate,
  titleId,
}: Pick<SidebarProps, "user" | "organization" | "visibleZoneKeys" | "recentAssistantThreads" | "allAssistantThreads" | "mode" | "onNavigate" | "titleId">) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const allItems = getWorkspaceZonesForKeys(visibleZoneKeys ?? ["overview"]);
  const mainItems = allItems.filter((item) => item.href !== "/ws/settings");
  const settingsItems = allItems.filter((item) => item.href === "/ws/settings");
  const { threads: assistantThreads } = useAssistantThreads({
    serverThreads: allAssistantThreads,
    limit: Math.max(allAssistantThreads.length, 12),
  });
  const requestedThreadId = pathname === "/ws" ? searchParams.get("threadId") : null;
  const activeAssistantThreadId =
    requestedThreadId && assistantThreads.some((thread) => thread.id === requestedThreadId)
      ? requestedThreadId
      : null;

  const recentThreads = assistantThreads.slice(0, Math.max(recentAssistantThreads.length, 3));
  const accountInitial = (user.name || user.email || "A").trim().slice(0, 1).toUpperCase();

  const handleAssistantLinkClick = useCallback((
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (pathname !== "/ws") {
      onNavigate?.();
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (typeof window !== "undefined") {
      const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (currentHref !== href) {
        window.history.pushState(null, "", href);
      }
    }
    onNavigate?.();
  }, [onNavigate, pathname]);

  return (
    <div
      className={cn(
        "flex min-h-full flex-col bg-[var(--workspace-sidebar)] text-card-foreground",
        mode === "desktop" ? "h-full" : "w-full",
      )}
    >
      {/* ── Header (Switcher) ─────────────────────────────── */}
      <div className="flex h-[60px] shrink-0 items-center justify-between px-3">
        <Link
          href="/ws/me"
          className="group flex flex-1 items-center gap-3 rounded-md p-1.5 text-right transition hover:bg-[var(--workspace-accent-soft)]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--workspace-highlight)] text-[color:var(--primary-foreground)] shadow-sm ring-2 ring-transparent transition group-hover:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,transparent)]">
            {accountInitial}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-[13px] font-semibold leading-none text-foreground">
              {user?.name || "مستخدم عنان"}
            </p>
            <p className="mt-1 truncate text-[11px] font-medium leading-none text-muted-foreground">
              {organization?.name || ""}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
        </Link>
        <div className="ps-1">
          <Link
            href="/ws"
            prefetch={false}
            onClick={(event) => handleAssistantLinkClick(event, "/ws")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--workspace-accent-soft)] hover:text-foreground"
            aria-label="محادثة جديدة"
          >
            <PenSquare className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-2 pt-2 pb-4">
        <ul className="space-y-0.5">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/ws" && pathname.startsWith(`${item.href}/`));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[color:color-mix(in_srgb,var(--workspace-highlight)_16%,transparent)] text-[var(--workspace-highlight)]"
                      : "text-muted-foreground hover:bg-[var(--workspace-accent-soft)] hover:text-foreground",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}

          {settingsItems.length > 0 && <div className="mx-2 my-2 border-t border-[color:var(--workspace-border)]" />}

          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[color:color-mix(in_srgb,var(--workspace-highlight)_16%,transparent)] text-[var(--workspace-highlight)]"
                      : "text-muted-foreground hover:bg-[var(--workspace-accent-soft)] hover:text-foreground",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Threads ───────────────────────────────────────── */}
      <div className="border-t border-[color:var(--workspace-border)] px-2 py-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-[11px] font-semibold tracking-wider text-[var(--workspace-muted)]">المحادثات</span>
        </div>
        <div className="max-h-52 space-y-0.5 overflow-y-auto">
          {recentThreads.length === 0 ? (
            <div className="px-2 py-3 text-center text-[12px] text-muted-foreground">
              لا توجد محادثات بعد
            </div>
          ) : recentThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
              prefetch={false}
              onClick={(event) => handleAssistantLinkClick(event, `/ws?threadId=${encodeURIComponent(thread.id)}`)}
              className={cn(
                "group block rounded-md px-3 py-2 transition-colors hover:bg-[var(--workspace-accent-soft)]",
                activeAssistantThreadId === thread.id && "bg-[var(--workspace-accent-soft)]",
              )}
            >
              <div className={cn(
                "truncate text-[12px] font-medium transition-colors",
                activeAssistantThreadId === thread.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
              )}>
                {getThreadLabel(thread)}
              </div>
              <div className="mt-0.5 truncate text-[10px] text-muted-foreground/50">
                {formatThreadDate(thread.updatedAt)}
              </div>
            </Link>
          ))}
        </div>
        {assistantThreads.length > recentThreads.length ? (
          <Dialog.Root>
            <Dialog.Trigger className="mt-2 w-full rounded-lg py-2 text-center text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              عرض كل المحادثات
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
              <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                <div className="w-full max-w-xl rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <Dialog.Title className="text-sm font-semibold">كل المحادثات</Dialog.Title>
                    <Dialog.Close
                      aria-label="إغلاق"
                      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--workspace-accent-soft)] hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto p-2">
                    {assistantThreads.map((thread) => (
                      <Link
                        key={thread.id}
                        href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
                        prefetch={false}
                        onClick={(event) => handleAssistantLinkClick(event, `/ws?threadId=${encodeURIComponent(thread.id)}`)}
                        className={cn(
                          "block rounded-md px-4 py-3 transition-colors hover:bg-[var(--workspace-accent-soft)]",
                          activeAssistantThreadId === thread.id && "bg-[var(--workspace-accent-soft)]",
                        )}
                      >
                        <div className="truncate text-sm font-medium text-foreground">{getThreadLabel(thread)}</div>
                        <div className="mt-1 truncate text-xs text-muted-foreground">{formatThreadDate(thread.updatedAt)}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        ) : null}
      </div>
    </div>
  );
}
