"use client";

import { useCallback } from "react";
import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";
import { cn } from "@/lib/utils";
import type { SidebarProps } from "./types";
import { MessageSquareText, PenSquare, X } from "lucide-react";
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

/**
 * WHY:   Desktop and mobile workspace navigation must stay in sync to avoid role drift across shells.
 * WHAT:  Renders the brand header, grouped navigation, and assistant threads panel.
 * HOW:   Reads the current pathname to mark active zones. Identity moved to the top navbar per redesign.
 */
export default function SidebarContent({
  visibleZoneKeys,
  recentAssistantThreads = [],
  allAssistantThreads = [],
  mode = "desktop",
  onNavigate,
  titleId,
}: Pick<SidebarProps, "visibleZoneKeys" | "recentAssistantThreads" | "allAssistantThreads" | "mode" | "onNavigate" | "titleId">) {
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
        "flex min-h-full flex-col bg-slate-950 text-white",
        mode === "desktop" ? "h-full border-e border-white/5" : "w-full",
      )}
    >
      <div className="flex h-14 shrink-0 items-center border-b border-white/[0.06] px-5">
        <span id={titleId} className="text-base font-bold tracking-tight text-white">
          عنان
        </span>
      </div>

      <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-3 py-4">
        {mainItems.length > 0 && (
          <div className="space-y-0.5">
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
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {settingsItems.length > 0 && (
          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <ul className="space-y-0.5">
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
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-[11px] font-medium text-slate-500">المحادثات</span>
          <Link
            href="/ws"
            prefetch={false}
            onClick={(event) => handleAssistantLinkClick(event, "/ws")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-slate-400 transition-colors hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            aria-label="محادثة جديدة"
          >
            <PenSquare className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {recentThreads.length === 0 ? (
            <div className="px-2 py-2 text-[11px] font-medium text-slate-600">
              ستظهر هنا محادثات المساعد بعد أول رسالة ترسلها.
            </div>
          ) : recentThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
              prefetch={false}
              onClick={(event) => handleAssistantLinkClick(event, `/ws?threadId=${encodeURIComponent(thread.id)}`)}
              className={cn(
                "group flex items-start gap-2.5 rounded-md border border-transparent px-2.5 py-2 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                activeAssistantThreadId === thread.id && "bg-white/[0.06]",
              )}
            >
              <MessageSquareText className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", activeAssistantThreadId === thread.id ? "text-white" : "text-slate-600 group-hover:text-slate-400")} />
              <div className="min-w-0 flex-1">
                <div className={cn("truncate text-[11px] font-medium", activeAssistantThreadId === thread.id ? "text-white" : "text-slate-300")}>{getThreadLabel(thread)}</div>
                <div className="truncate text-[9px] text-slate-600">{formatThreadDate(thread.updatedAt)}</div>
              </div>
            </Link>
          ))}
        </div>
        {assistantThreads.length > recentThreads.length ? (
          <Dialog.Root>
            <Dialog.Trigger className="mt-2 w-full rounded-md bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20">
              عرض كل المحادثات
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
              <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                <div className="w-full max-w-2xl rounded-md border border-slate-800 bg-slate-950 text-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                    <Dialog.Title className="text-sm font-semibold">كل محادثات المساعد</Dialog.Title>
                    <Dialog.Close
                      aria-label="إغلاق"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.06] text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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
                          "flex items-start justify-between gap-4 rounded-md border border-transparent px-3 py-2.5 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                          activeAssistantThreadId === thread.id && "bg-white/[0.06]",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">{getThreadLabel(thread)}</div>
                          <div className="mt-0.5 truncate text-xs text-slate-500">{formatThreadDate(thread.updatedAt)}</div>
                        </div>
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
