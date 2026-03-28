import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DocsTopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-[#09090b]/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="mt-[1px] md:hidden text-slate-600 dark:text-slate-300" />
          <div className="flex flex-col">
            <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
              Anan Docs
            </Link>
            <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-400">DEVELOPER API</span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Badge variant="outline" className="hidden rounded-full border border-black/5 bg-slate-50 shadow-sm px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500 md:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            v1.0
          </Badge>
          <Button variant="ghost" size="sm" className="hidden h-7 rounded-full shadow-sm bg-white border border-black/5 px-4 text-xs font-black uppercase tracking-[0.15em] text-slate-600 hover:bg-slate-50 hover:border-black/10 hover:text-slate-900 md:flex transition-all dark:bg-[#111114] dark:border-white/10 dark:text-slate-300 dark:hover:bg-[#18181b] dark:hover:border-white/20 dark:hover:text-white" render={<Link href="/docs/getting-started" />}>
            Quickstart
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
