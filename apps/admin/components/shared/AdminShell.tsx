"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import type { SessionUser } from "@/lib/serverSession";
import LogoutButton from "@/components/auth/LogoutButton";
import { adminPrimaryNav, getPrimaryNavLabel } from "@/lib/adminNavigation";

type AdminShellProps = {
  children: React.ReactNode;
  user: SessionUser;
};

/**
 * WHY:   The admin app needs a dedicated operational shell distinct from the public web workspace.
 * WHAT:  Renders the shared admin sidebar, top identity bar, and page content frame.
 * HOW:   Uses fixed nav metadata and highlights the current route from the provided pathname.
 */
export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const currentSection = getPrimaryNavLabel(pathname);

  return (
    <div data-slot="workspace-shell" className="min-h-svh bg-slate-50 text-slate-900 lg:flex lg:h-svh lg:overflow-hidden">
      <div className="hidden shrink-0 lg:flex lg:h-svh w-[280px]">
        <aside className="flex h-full w-full flex-col bg-slate-950 text-white border-e border-white/5">
            <div className="border-b border-white/5 px-6 py-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center bg-blue-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black tracking-tighter text-white">مركز إدارة المنصة</div>
              <div className="mt-3 inline-flex items-center gap-3">
                <span className="h-px w-8 bg-blue-500" />
                <div className="text-xs font-bold text-slate-400">إدارة عنان</div>
              </div>
            </div>

            <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-4">
              {adminPrimaryNav.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "flex items-center gap-3 border px-4 py-3 text-[11px] font-black tracking-[0.18em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                      active
                        ? "border-blue-600 bg-blue-600 text-white shadow-none"
                        : "border-transparent text-slate-400 hover:border-white/5 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className={["h-4 w-4", active ? "text-white" : "text-slate-500"].join(" ")} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/5 p-4 space-y-3">
              <div className="group flex items-center gap-3 border border-transparent p-2 transition hover:border-white/5 hover:bg-white/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-blue-400/30 bg-blue-500/15 text-xs font-black uppercase text-blue-100">
                  {((user.name ?? user.email ?? "A")[0] ?? "A").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10px] font-black uppercase tracking-widest text-white">
                    {user.name || "مشرف المنصة"}
                  </div>
                  <div className="truncate text-[9px] font-bold text-slate-500">
                    {user.email || user.id}
                  </div>
                </div>
              </div>
              <LogoutButton className="w-full justify-center bg-transparent border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all text-[11px] font-black tracking-[0.18em]">
                <LogOut className="mr-2 h-3 w-3" />
                تسجيل الخروج
              </LogoutButton>
            </div>
        </aside>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col bg-transparent lg:max-h-svh lg:overflow-hidden">
        <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 py-4 lg:px-10 sticky top-0 z-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-black tracking-[0.3em] text-blue-600">المساحة التشغيلية</div>
              <div className="mt-2 text-xl font-black tracking-tight text-slate-900">{currentSection}</div>
            </div>
            <div className="text-[10px] font-bold tracking-[0.22em] text-slate-400">{pathname}</div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-visible motion-safe:animate-zone-page-enter lg:overflow-auto p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
