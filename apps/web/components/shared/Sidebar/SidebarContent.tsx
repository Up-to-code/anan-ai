"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { getWorkspaceZonesForKeys } from "@/app/(ws)/ws/_lib/zones";
import type { AnanProThreadSummary } from "@/server/contracts/ananPro";
import { cn } from "@/lib/utils";
import type { SidebarProps } from "./types";
import { MessageSquareText, PenSquare, X } from "lucide-react";
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

  return (
    <div
      className={cn(
        "flex min-h-full flex-col bg-slate-950 text-white",
        mode === "desktop" ? "h-full border-e border-white/5" : "w-full shadow-none",
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/5 px-6">
        <span id={titleId} className="text-xl font-black tracking-tight text-blue-400">
          عنان <span className="text-white">Anan</span>
        </span>
      </div>

      {/* Grouped Navigation */}
      <nav aria-label="Workspace navigation" className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
        {/* Group: الرئيسية (Main) */}
        {mainItems.length > 0 && (
          <div>
            <h3 className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              الرئيسية
            </h3>
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
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-black tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                        isActive
                          ? "bg-blue-600/15 text-blue-400"
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-slate-500")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Group: الإعدادات (Settings) */}
        {settingsItems.length > 0 && (
          <div>
            <h3 className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              الإعدادات
            </h3>
            <ul className="space-y-1">
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
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[11px] font-black tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                        isActive
                          ? "bg-blue-600/15 text-blue-400"
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-slate-500")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Assistant Threads */}
      <div className="border-t border-white/5 px-3 py-4">
        <div className="mb-3 flex items-center justify-between px-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">مساعد Anan Workspace</span>
          <Link
            href="/ws?newThread=1"
            onClick={onNavigate}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:border-blue-500 hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="محادثة جديدة"
          >
            <PenSquare className="h-4 w-4" />
          </Link>
        </div>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {recentThreads.length === 0 ? (
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500">
              ستظهر هنا محادثات المساعد بعد أول رسالة ترسلها.
            </div>
          ) : recentThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
              onClick={onNavigate}
              className={cn(
                "flex items-start gap-3 border border-transparent px-3 py-2 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                activeAssistantThreadId === thread.id && "border-white/10 bg-white/5",
              )}
            >
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[10px] font-bold text-slate-300">{getThreadLabel(thread)}</div>
                <div className="truncate text-[9px] text-slate-500">{formatThreadDate(thread.updatedAt)}</div>
              </div>
            </Link>
          ))}
        </div>
        {assistantThreads.length > recentThreads.length ? (
          <Dialog.Root>
            <Dialog.Trigger className="mt-3 w-full border border-white/10 px-3 py-2 text-[10px] font-black tracking-[0.18em] text-slate-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              عرض كل المحادثات
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/70" />
              <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
                <div className="w-full max-w-2xl border border-slate-800 bg-slate-950 text-white">
                  <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <Dialog.Title className="text-sm font-black tracking-[0.18em]">كل محادثات المساعد</Dialog.Title>
                    <Dialog.Close
                      aria-label="إغلاق"
                      className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-slate-300 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto p-3">
                    {assistantThreads.map((thread) => (
                      <Link
                        key={thread.id}
                        href={`/ws?threadId=${encodeURIComponent(thread.id)}`}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-start justify-between gap-4 border border-transparent px-3 py-3 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                          activeAssistantThreadId === thread.id && "border-white/10 bg-white/5",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-white">{getThreadLabel(thread)}</div>
                          <div className="mt-1 truncate text-xs text-slate-400">{formatThreadDate(thread.updatedAt)}</div>
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
