"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/serverSession";
import LogoutButton from "@/components/auth/LogoutButton";
import { adminNavGroups, getPrimaryNavItem } from "@/lib/adminNavigation";

type AdminShellProps = {
  children: React.ReactNode;
  user: SessionUser;
};

/**
 * WHY:   The rebuilt admin needs one normal, product-like workspace shell for navigation, time controls, and identity.
 * WHAT:  Renders the grouped admin sidebar, shared header, mobile nav row, and page content frame.
 * HOW:   Resolves the current route from the pathname and maps the grouped navigation metadata into simple active states.
 */
export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const currentItem = getPrimaryNavItem(pathname);
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
    <>
      <div className={desktopExpanded ? "border-b border-border px-5 py-5" : "border-b border-border px-3 py-5"}>
        {desktopExpanded ? (
          <>
            <div className="text-lg font-semibold text-slate-900">إدارة عنان</div>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">واجهة تشغيل داخلية للمراجعة والمتابعة</p>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-slate-900 text-sm font-semibold text-white">A</div>
          </div>
        )}
      </div>

      <nav aria-label="Admin navigation" className={desktopExpanded ? "flex-1 space-y-5 overflow-y-auto px-3 py-4" : "flex-1 space-y-4 overflow-y-auto px-2 py-4"}>
        {adminNavGroups.map((group) => (
          <div key={group.label}>
            {desktopExpanded ? <div className="px-2 text-[11px] font-medium text-slate-500">{group.label}</div> : null}
            <div className="mt-2 space-y-1">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      desktopExpanded
                        ? "flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-colors"
                        : "flex items-center justify-center rounded-[8px] px-2 py-2.5 text-[13px] font-medium transition-colors",
                      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")}
                    title={desktopExpanded ? undefined : label}
                  >
                    <Icon className={["h-4 w-4", active ? "text-white" : "text-slate-500"].join(" ")} />
                    {desktopExpanded ? label : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={desktopExpanded ? "border-t border-border px-4 py-4" : "border-t border-border px-2 py-4"}>
        {desktopExpanded ? (
          <>
            <div className="flex items-center gap-3 rounded-[8px] border border-border bg-slate-50 px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-slate-900 text-sm font-semibold text-white">
                {((user.name ?? user.email ?? "A")[0] ?? "A").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">{user.name || "مشرف المنصة"}</div>
                <div className="truncate text-xs text-slate-500">{user.email || user.id}</div>
              </div>
            </div>
            <LogoutButton className="mt-3 w-full justify-center rounded-[8px] border border-border bg-white text-slate-700 hover:bg-slate-50">
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </LogoutButton>
          </>
        ) : (
          <LogoutButton className="w-full justify-center rounded-[8px] border border-border bg-white px-0 text-slate-700 hover:bg-slate-50">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">تسجيل الخروج</span>
          </LogoutButton>
        )}
      </div>
    </>
  );

  return (
    <div data-slot="workspace-shell" className="min-h-svh bg-white text-slate-900 lg:flex">
      <aside
        className={[
          "hidden h-svh min-h-svh shrink-0 border-r border-border bg-white lg:sticky lg:top-0 lg:flex lg:flex-col",
          desktopExpanded ? "w-72" : "w-[72px]",
        ].join(" ")}
      >
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-slate-950/20"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div className="text-sm font-medium text-slate-900">التنقل</div>
              <button type="button" className="rounded-[8px] p-2 text-slate-500 hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={desktopExpanded ? "طي الشريط الجانبي" : "فتح الشريط الجانبي"}
                className="hidden rounded-[8px] border border-border bg-white p-2 text-slate-600 hover:bg-slate-50 lg:inline-flex"
                onClick={toggleDesktopSidebar}
              >
                {desktopExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </button>
              <button type="button" className="rounded-[8px] p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="text-sm font-medium text-slate-900">{currentItem.label}</div>
                <div className="text-xs text-slate-500">{pathname.replace("/","") || "overview"}</div>
              </div>
            </div>
            <div className="hidden text-xs text-slate-500 lg:block">واجهة تشغيل تجريبية مبنية على بيانات mock</div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-visible px-4 py-5 sm:px-6 lg:overflow-auto lg:px-8 lg:py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
