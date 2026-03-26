"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/serverSession";
import LogoutButton from "@/components/auth/LogoutButton";
import { adminNavGroups, getPrimaryNavItem } from "@/lib/adminNavigation";

type AdminShellProps = {
  children: React.ReactNode;
  user: SessionUser;
};

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("admin_sidebar_state");
    if (stored === "collapsed") {
      setDesktopExpanded(false);
    }
  }, []);

  function toggleDesktopSidebar() {
    setDesktopExpanded((current) => {
      const next = !current;
      window.localStorage.setItem("admin_sidebar_state", next ? "expanded" : "collapsed");
      return next;
    });
  }

  const sidebar = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 lg:bg-transparent lg:border-none lg:dark:bg-transparent lg:dark:border-none rounded-none lg:rounded-[40px]">
      <div className={desktopExpanded ? "px-6 py-8 lg:px-8 lg:py-10" : "px-4 py-10"}>
        {desktopExpanded ? (
          <div className="text-right">
            <div className="text-2xl lg:text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50">عنان أدمن</div>
            <p className="mt-2 text-[10px] font-black leading-relaxed text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Operational Nexus</p>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-slate-900 text-lg font-black text-white shadow-lg">A</div>
          </div>
        )}
      </div>

      <nav aria-label="Admin navigation" className={cn(
        "flex-1 overflow-y-auto px-4 py-4 lg:px-5 lg:py-6 custom-scrollbar",
        desktopExpanded ? "space-y-8 lg:space-y-10" : "space-y-8"
      )}>
        {adminNavGroups.map((group) => (
          <div key={group.label} className="space-y-4">
            {desktopExpanded ? (
              <div className="px-5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-600 leading-none">
                {group.label}
              </div>
            ) : null}
            <div className="space-y-2">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex flex-row-reverse items-center transition-all duration-300",
                      desktopExpanded
                        ? "gap-5 rounded-[24px] lg:rounded-3xl px-5 py-3.5 text-[14px] font-black tracking-tight"
                        : "justify-center rounded-[24px] px-3 py-4",
                      active 
                        ? "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 shadow-md" 
                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                    title={desktopExpanded ? undefined : label}
                  >
                    <Icon className={cn("shrink-0", desktopExpanded ? "h-5 w-5" : "h-6 w-6", active ? "text-current" : "text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors")} />
                    {desktopExpanded ? <span className="truncate">{label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("mt-auto px-5 py-6 lg:px-6 lg:py-8 border-t border-slate-100 dark:border-slate-800/50", !desktopExpanded && "px-4")}>
        {desktopExpanded ? (
          <div className="space-y-6">
            <div className="flex flex-row-reverse items-center gap-4 rounded-[28px] lg:rounded-[32px] bg-slate-50 dark:bg-slate-800/50 px-4 py-4 lg:px-5 lg:py-5 border border-slate-100 dark:border-slate-800 shadow-inner">
              <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-[16px] lg:rounded-[20px] bg-slate-900 text-white font-black text-lg">
                {((user.name ?? user.email ?? "A")[0] ?? "A").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-right">
                <div className="truncate text-[14px] lg:text-[15px] font-black text-slate-900 dark:text-slate-100 tracking-tight">{user.name || "مشرف المنصة"}</div>
                <div className="truncate text-[9px] lg:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user.email || user.id}</div>
              </div>
            </div>
            <LogoutButton className="flex flex-row-reverse w-full items-center justify-center gap-3 rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 lg:py-4 text-[10px] font-black tracking-[0.25em] uppercase text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-cairo-black">
              <LogOut className="h-4 w-4" />
              إنهاء الجلسة
            </LogoutButton>
          </div>
        ) : (
          <LogoutButton className="flex h-16 w-full items-center justify-center rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm">
            <LogOut className="h-7 w-7" />
            <span className="sr-only">خروج</span>
          </LogoutButton>
        )}
      </div>
    </div>
  );

  return (
    <div data-slot="workspace-shell" className="min-h-svh bg-background text-foreground lg:flex lg:h-svh lg:overflow-hidden font-cairo">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden h-svh shrink-0 transition-all duration-300 lg:sticky lg:top-0 lg:flex lg:flex-col p-6",
          desktopExpanded ? "w-[320px]" : "w-[120px]",
        )}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[40px] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-2xl backdrop-blur-xl">
          {/* Internal Desktop Toggle */}
          <button
            type="button"
            className="absolute left-6 top-8 z-10 hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-3 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-all lg:inline-flex shadow-sm active:scale-95"
            onClick={toggleDesktopSidebar}
          >
            {desktopExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
          {sidebar}
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" dir="rtl">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[300px] max-w-[85vw] flex-col transition-transform duration-300 animate-in slide-in-from-right duration-500 ease-out z-[51]">
            <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-2xl rounded-l-[40px]">
              <div className="flex flex-row-reverse items-center justify-between px-6 py-6 border-b border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Navigation</div>
                <button type="button" className="rounded-2xl p-2.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95" onClick={() => setMobileOpen(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebar}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col lg:max-h-svh lg:overflow-hidden">
        {/* Floating Mobile Toggle */}
        <button 
          type="button" 
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 shadow-xl lg:hidden active:scale-95 transition-all" 
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        <main className={cn(
          "min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-16 lg:py-16 mt-14 lg:mt-0",
          "overflow-visible lg:overflow-auto custom-scrollbar"
        )}>
          <div className="mx-auto w-full max-w-7xl animate-zone-page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
