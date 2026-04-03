"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../vendor/ui/button";
import { Badge } from "../vendor/ui/badge";
import { SidebarTrigger } from "../vendor/ui/sidebar";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { resolveLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";

export default function DocsTopNav() {
  const pathname = usePathname();
  const locale = resolveLocale(pathname.split("/")[1]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="mt-[1px] md:hidden" />
          <div className="flex flex-col">
            <Link href={withLocale(locale)} className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400">
              Anan Docs
            </Link>
            <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500">DEVELOPER API</span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <ThemeToggle className="h-9 w-9 rounded-lg md:h-8 md:w-8" />
          <Badge variant="outline" className="hidden rounded-lg border-2 border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 md:inline-flex">
            v1.0
          </Badge>
          <Button variant="ghost" size="sm" className="hidden rounded-lg px-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 md:flex" render={<Link href={withLocale(locale, "/docs/getting-started")} />}>
            Quickstart
          </Button>
          <Button size="sm" className="rounded-lg bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-none transition-colors hover:bg-blue-700" render={<Link href={withLocale(locale, "/docs/oauth/authorization-code-pkce")} />}>
            OAuth Flow
          </Button>
        </nav>
      </div>
    </header>
  );
}
