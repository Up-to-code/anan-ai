"use client";

import { useCallback, useMemo, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";
import type { SidebarProps } from "./types";
import { ChevronLeft, ChevronRight, MessageSquareText, PenSquare, Search, X } from "lucide-react";
import { getWorkspaceZonesForKeys } from "../../_lib/zones";
import { useAssistantThreads } from "./useAssistantThreads";

const SIDEBAR_SHELL_CLASS_NAME =
  "bg-[var(--workspace-sidebar)] text-[var(--workspace-bubble-other-foreground)]";
const SIDEBAR_PANEL_CLASS_NAME =
  "border border-[color:color-mix(in_srgb,var(--workspace-border)_78%,transparent)] bg-[var(--workspace-panel)]";
const SIDEBAR_SUBTLE_PANEL_CLASS_NAME =
  "border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-elevated)]";
const NAV_ITEM_BASE_CLASS_NAME =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all";
const NAV_ITEM_ACTIVE_CLASS_NAME =
  "border border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[var(--workspace-highlight)] text-white shadow-sm";
const NAV_ITEM_IDLE_CLASS_NAME =
  "border border-transparent text-[var(--workspace-muted)] hover:border-[color:color-mix(in_srgb,var(--workspace-border)_82%,transparent)] hover:bg-[var(--workspace-panel)] hover:text-[var(--workspace-bubble-other-foreground)] active:scale-[0.98]";

const THREAD_CARD_ACTIVE_CLASS_NAME =
  "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[var(--workspace-highlight-soft)]";
const THREAD_CARD_IDLE_CLASS_NAME =
  "border-[color:transparent] bg-transparent hover:border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] hover:bg-[var(--workspace-panel)]";

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
  organization,
  visibleZoneKeys,
  recentAssistantThreads = [],
  allAssistantThreads = [],
  mode = "desktop",
  onNavigate,
}: Pick<SidebarProps, "user" | "organization" | "visibleZoneKeys" | "recentAssistantThreads" | "allAssistantThreads" | "mode" | "onNavigate" | "titleId">) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [threadPickerOpen, setThreadPickerOpen] = useState(false);
  const [threadQuery, setThreadQuery] = useState("");
  const [threadPage, setThreadPage] = useState(1);
  const allItems = getWorkspaceZonesForKeys(visibleZoneKeys ?? ["overview"]);
  const mainItems = allItems.filter((item) => item.href !== "/ws/settings");
  const settingsItems = allItems.filter((item) => item.href === "/ws/settings");
  const identitySubtitle = organization?.sidebarSubtitle?.trim() || "";
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
  const normalizedThreadQuery = threadQuery.trim().toLocaleLowerCase("ar");
  const filteredAssistantThreads = useMemo(() => {
    if (!normalizedThreadQuery) return assistantThreads;

    return assistantThreads.filter((thread) =>
      getThreadLabel(thread).toLocaleLowerCase("ar").includes(normalizedThreadQuery),
    );
  }, [assistantThreads, normalizedThreadQuery]);
  const threadsPerPage = 10;
  const totalThreadPages = Math.max(1, Math.ceil(filteredAssistantThreads.length / threadsPerPage));
  const safeThreadPage = Math.min(threadPage, totalThreadPages);
  const paginatedAssistantThreads = filteredAssistantThreads.slice(
    (safeThreadPage - 1) * threadsPerPage,
    safeThreadPage * threadsPerPage,
  );

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

  const handleThreadPickerOpenChange = useCallback((open: boolean) => {
    setThreadPickerOpen(open);
    if (!open) {
      setThreadQuery("");
      setThreadPage(1);
    }
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-full flex-col",
        SIDEBAR_SHELL_CLASS_NAME,
        mode === "desktop" ? "h-full" : "w-full",
      )}
    >
      {/* ── Header spacer + quick action ─────────────────── */}
      <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] px-4">
        <div
          aria-hidden="true"
          className={cn(
            "flex h-11 flex-1 items-center rounded-xl",
            identitySubtitle ? "justify-start px-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]" : "",
          )}
        >
          {identitySubtitle}
        </div>
        <div className="ps-2">
          <Link
            href="/ws"
            prefetch={false}
            onClick={(event) => handleAssistantLinkClick(event, "/ws")}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border text-[var(--workspace-muted)] transition-all active:scale-95",
              SIDEBAR_PANEL_CLASS_NAME,
              "hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)]",
            )}
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
                    NAV_ITEM_BASE_CLASS_NAME,
                    isActive
                      ? NAV_ITEM_ACTIVE_CLASS_NAME
                      : NAV_ITEM_IDLE_CLASS_NAME,
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 truncate text-right">{item.label}</span>
                </Link>
              </li>
            );
          })}

          {settingsItems.length > 0 && <div className="mx-2 my-4 border-t border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)]" />}

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
                    NAV_ITEM_BASE_CLASS_NAME,
                    isActive
                      ? NAV_ITEM_ACTIVE_CLASS_NAME
                      : NAV_ITEM_IDLE_CLASS_NAME,
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

      {recentThreads.length > 0 ? (
        <div className="border-t border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] px-3 py-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <Link
              href="/ws"
              prefetch={false}
              onClick={(event) => handleAssistantLinkClick(event, "/ws")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all active:scale-[0.97]",
                SIDEBAR_SUBTLE_PANEL_CLASS_NAME,
                "text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-panel)]",
              )}
            >
              <PenSquare className="h-3 w-3" />
              <span>جديد</span>
            </Link>
            <div className="flex items-center gap-2">
              {assistantThreads.length > 0 ? (
                <Dialog.Root open={threadPickerOpen} onOpenChange={handleThreadPickerOpenChange}>
                  <Dialog.Trigger
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-[10px] font-black tracking-[0.14em] transition-all active:scale-[0.97]",
                      SIDEBAR_SUBTLE_PANEL_CLASS_NAME,
                      "text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-panel)]",
                    )}
                    aria-label={`عرض كل المحادثات ${recentThreads.length} من ${assistantThreads.length}`}
                  >
                    {recentThreads.length}/{assistantThreads.length}
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
                    <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none transition-all duration-300 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                      <div className="flex h-[min(78vh,720px)] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-sidebar)] text-[var(--workspace-bubble-other-foreground)] shadow-2xl shadow-black/20">
                        <div className="flex items-start justify-between border-b border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-6 py-5" dir="rtl">
                          <div className="min-w-0">
                            <Dialog.Title className="text-lg font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                              كل المحادثات
                            </Dialog.Title>
                            <p className="mt-1 text-[12px] font-medium text-[var(--workspace-muted)]">
                              اختر محادثة للمتابعة أو ابحث بعنوانها
                            </p>
                          </div>
                          <Dialog.Close
                            aria-label="إغلاق"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--workspace-muted)] transition-all hover:bg-[var(--workspace-elevated)] hover:text-[var(--workspace-bubble-other-foreground)] active:scale-95"
                          >
                            <X className="h-5 w-5" />
                          </Dialog.Close>
                        </div>
                        <div className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-6 py-4">
                          <label className="relative block">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--workspace-muted)]" />
                            <input
                              type="search"
                              value={threadQuery}
                              onChange={(event) => {
                                setThreadQuery(event.target.value);
                                setThreadPage(1);
                              }}
                              placeholder="ابحث بعنوان المحادثة"
                              className="h-12 w-full rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] pr-10 pl-4 text-right text-sm font-medium text-[var(--workspace-bubble-other-foreground)] placeholder:text-[color:color-mix(in_srgb,var(--workspace-muted)_86%,transparent)] outline-none transition focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--workspace-highlight)_16%,transparent)]"
                            />
                          </label>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
                          <div className="space-y-2.5">
                            {paginatedAssistantThreads.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-4 py-8 text-center text-sm font-bold text-[var(--workspace-muted)]">
                                لا توجد محادثات بهذا العنوان
                              </div>
                            ) : paginatedAssistantThreads.map((thread) => (
                              <Dialog.Close key={thread.id} render={<div />}>
                                <Link
                                  href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
                                  prefetch={false}
                                  onClick={(event) => handleAssistantLinkClick(event, `/ws?threadId=${encodeURIComponent(thread.id)}`)}
                                  className={cn(
                                    "group flex min-h-[76px] items-center gap-4 rounded-2xl border px-4 py-4 text-right transition-all",
                                    activeAssistantThreadId === thread.id
                                      ? THREAD_CARD_ACTIVE_CLASS_NAME
                                      : THREAD_CARD_IDLE_CLASS_NAME,
                                  )}
                                >
                                  <div className="min-w-0 flex-1 text-right">
                                    <div className="truncate text-[14px] font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                                      {getThreadLabel(thread)}
                                    </div>
                                    <div className="mt-1 flex items-center justify-end gap-2 text-[11px] font-medium text-[var(--workspace-muted)]">
                                      <span>{formatThreadDate(thread.updatedAt)}</span>
                                      <span className="h-1 w-1 rounded-full bg-[color:var(--workspace-border)]" />
                                      <span>#{thread.id.slice(0, 8)}</span>
                                    </div>
                                  </div>
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] transition group-hover:text-[var(--workspace-bubble-other-foreground)]">
                                    <MessageSquareText className="h-4 w-4" />
                                  </div>
                                </Link>
                              </Dialog.Close>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] px-6 py-4">
                          <div className="text-[11px] font-bold text-[var(--workspace-muted)]">
                            صفحة {safeThreadPage} من {totalThreadPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setThreadPage((page) => Math.max(1, page - 1))}
                              disabled={safeThreadPage <= 1}
                              className="inline-flex items-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-3 py-2 text-[12px] font-bold text-[var(--workspace-bubble-other-foreground)] transition disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="الصفحة السابقة"
                            >
                              <ChevronRight className="h-4 w-4" />
                              السابق
                            </button>
                            <button
                              type="button"
                              onClick={() => setThreadPage((page) => Math.min(totalThreadPages, page + 1))}
                              disabled={safeThreadPage >= totalThreadPages}
                              className="inline-flex items-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] px-3 py-2 text-[12px] font-bold text-[var(--workspace-bubble-other-foreground)] transition disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="الصفحة التالية"
                            >
                              التالي
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Dialog.Popup>
                  </Dialog.Portal>
                </Dialog.Root>
              ) : null}
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--workspace-muted)]">
                آخر 3 محادثات
              </span>
            </div>
          </div>
          <div className={cn("space-y-1 rounded-2xl p-1", SIDEBAR_SUBTLE_PANEL_CLASS_NAME)}>
            {recentThreads.map((thread) => (
              <Link
                key={thread.id}
                href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
                prefetch={false}
                onClick={(event) => handleAssistantLinkClick(event, `/ws?threadId=${encodeURIComponent(thread.id)}`)}
                className={cn(
                  "group block rounded-xl border px-3 py-3 transition-all",
                  activeAssistantThreadId === thread.id
                    ? THREAD_CARD_ACTIVE_CLASS_NAME
                    : THREAD_CARD_IDLE_CLASS_NAME,
                )}
              >
                <div
                  className={cn(
                    "truncate text-[12px] font-bold transition-colors",
                    activeAssistantThreadId === thread.id
                      ? "text-[var(--workspace-bubble-other-foreground)]"
                      : "text-[var(--workspace-muted)] group-hover:text-[var(--workspace-bubble-other-foreground)]",
                  )}
                >
                  {getThreadLabel(thread)}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold text-[var(--workspace-muted)]">
                  <MessageSquareText className="h-3 w-3" />
                  <span>{formatThreadDate(thread.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

    </div>
  );
}
