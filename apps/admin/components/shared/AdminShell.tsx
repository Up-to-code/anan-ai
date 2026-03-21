"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { SessionUser } from "@/lib/serverSession";
import LogoutButton from "@/components/auth/LogoutButton";
import AdminRangeControl from "@/components/shared/AdminRangeControl";
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

  return (
    <div data-slot="workspace-shell" className="min-h-svh bg-stone-100 text-slate-900 lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="hidden min-h-svh border-l border-stone-300 bg-stone-50 lg:flex lg:flex-col">
        <div className="border-b border-stone-300 px-5 py-5">
          <div className="text-lg font-semibold text-slate-900">إدارة عنان</div>
          <p className="mt-1 text-sm text-slate-500">متابعة التشغيل، السوق، والحوكمة</p>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {adminNavGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2 text-xs font-medium text-slate-500">{group.label}</div>
              <div className="mt-2 space-y-1">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={[
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-stone-200 hover:text-slate-900",
                      ].join(" ")}
                    >
                      <Icon className={["h-4 w-4", active ? "text-white" : "text-slate-500"].join(" ")} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-stone-300 px-4 py-4">
          <div className="flex items-center gap-3 rounded-md border border-stone-300 bg-white px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
              {((user.name ?? user.email ?? "A")[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-900">{user.name || "مشرف المنصة"}</div>
              <div className="truncate text-xs text-slate-500">{user.email || user.id}</div>
            </div>
          </div>
          <LogoutButton className="mt-3 w-full justify-center rounded-md border border-stone-300 bg-white text-slate-700 hover:bg-stone-100">
            <LogOut className="mr-2 h-4 w-4" />
            تسجيل الخروج
          </LogoutButton>
        </div>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-stone-300 bg-stone-100/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{currentItem.label}</h1>
                <p className="mt-1 text-sm text-slate-500">{pathname}</p>
              </div>
              <AdminRangeControl className="self-start" />
            </div>

            <nav className="flex gap-4 overflow-x-auto border-t border-stone-300 pt-3 text-sm lg:hidden" aria-label="mobile navigation">
              {adminNavGroups.flatMap((group) => group.items).map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "whitespace-nowrap font-medium text-slate-900" : "whitespace-nowrap text-slate-500"}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-visible px-4 py-5 sm:px-6 lg:overflow-auto lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
