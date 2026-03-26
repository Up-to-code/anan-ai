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
        "flex min-h-full flex-col bg-background text-foreground",
        mode === "desktop" ? "h-full" : "w-full",
      )}
    >
      {/* ── Header (Switcher) ─────────────────────────────── */}
      <div className="flex h-[64px] shrink-0 items-center justify-between px-4">
        <Link
          href="/ws/me"
          className="group flex flex-1 items-center gap-3 rounded-xl p-1.5 transition hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background shadow-sm transition-all group-hover:scale-105">
            {accountInitial}
          </div>
          <div className="flex-1 truncate text-right">
            <p className="truncate text-[13px] font-bold leading-none text-foreground">
              {user?.name || "مستخدم عنان"}
            </p>
            <p className="mt-1 truncate text-[10px] font-bold leading-none text-muted-foreground/60">
              {organization?.name || ""}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
        </Link>
        <div className="ps-2">
          <Link
            href="/ws"
            prefetch={false}
            onClick={(event) => handleAssistantLinkClick(event, "/ws")}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="محادثة جديدة"
          >
            <PenSquare className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-3 pt-4 pb-4">
        <ul className="space-y-1">
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
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all",
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-[0.98]",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 truncate text-right">{item.label}</span>
                </Link>
              </li>
            );
          })}

          {settingsItems.length > 0 && <div className="mx-2 my-4 border-t border-border/40" />}

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
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all",
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground active:scale-[0.98]",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 truncate text-right">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Threads ───────────────────────────────────────── */}
      <div className="border-t border-border/40 px-3 py-5">
        <div className="mb-3 flex items-center justify-between px-3">
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50">
            أحدث المحادثات
          </span>
        </div>
        <div className="max-h-52 space-y-1 overflow-y-auto">
          {recentThreads.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] font-bold text-muted-foreground/40">
              لا توجد محادثات نشطة
            </div>
          ) : recentThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
              prefetch={false}
              onClick={(event) => handleAssistantLinkClick(event, `/ws?threadId=${encodeURIComponent(thread.id)}`)}
              className={cn(
                "group block rounded-xl px-3 py-3 transition-all",
                activeAssistantThreadId === thread.id
                  ? "bg-muted shadow-sm"
                  : "hover:bg-muted/40",
              )}
            >
              <div className={cn(
                "truncate text-[12px] font-bold transition-colors",
                activeAssistantThreadId === thread.id ? "text-foreground" : "text-muted-foreground/80 group-hover:text-foreground",
              )}>
                {getThreadLabel(thread)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/40">
                <MessageSquareText className="h-3 w-3" />
                <span>{formatThreadDate(thread.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
        {assistantThreads.length > recentThreads.length ? (
          <Dialog.Root>
            <Dialog.Trigger className="mt-4 w-full rounded-xl bg-muted/20 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]">
              عرض كل المحادثات
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
              <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none transition-all duration-300 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                <div className="w-full max-w-2xl rounded-3xl border border-border bg-card text-card-foreground shadow-2xl shadow-black/20">
                  <div className="flex items-center justify-between border-b border-border/40 px-6 py-5">
                    <Dialog.Close
                      aria-label="إغلاق"
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
                    >
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                    <Dialog.Title className="text-base font-black tracking-tight text-foreground">كل المحادثات</Dialog.Title>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {assistantThreads.map((thread) => (
                        <Link
                          key={thread.id}
                          href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
                          prefetch={false}
                          onClick={(event) => handleAssistantLinkClick(event, `/ws?threadId=${encodeURIComponent(thread.id)}`)}
                          className={cn(
                            "group block rounded-2xl border border-transparent px-4 py-4 text-right transition-all hover:border-border/60 hover:bg-muted/40",
                            activeAssistantThreadId === thread.id && "bg-muted border-border/40",
                          )}
                        >
                          <div className="truncate text-[14px] font-bold tracking-tight text-foreground">
                            {getThreadLabel(thread)}
                          </div>
                          <div className="mt-2 flex items-center justify-end gap-2 text-[10px] font-bold text-muted-foreground/60">
                            <span>{formatThreadDate(thread.updatedAt)}</span>
                            <div className="h-1 w-1 rounded-full bg-border" />
                            <MessageSquareText className="h-3 w-3" />
                          </div>
                        </Link>
                      ))}
                    </div>
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
