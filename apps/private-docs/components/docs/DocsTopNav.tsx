import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DocsTopNav() {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="mt-[1px] md:hidden" />
          <div className="flex flex-col">
            <Link
              href="/docs/overview"
              className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-colors hover:text-teal-700"
            >
              Anan Developer Handbook
            </Link>
            <span className="text-[10px] font-black tracking-widest text-slate-400">
              INTERNAL CODEBASE GUIDE
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden rounded-none border-2 border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500 md:inline-flex"
          >
            private v1
          </Badge>
          <Link
            href="/docs/overview"
            className="hidden rounded-none px-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:inline-flex md:h-8 md:items-center"
          >
            Overview
          </Link>
          <Link
            href="/docs/workflow"
            className="hidden rounded-none px-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:inline-flex md:h-8 md:items-center"
          >
            Workflow
          </Link>
          <Link
            href="/docs/audit-overview"
            className="inline-flex h-9 items-center rounded-none bg-teal-600 px-6 text-xs font-black uppercase tracking-widest text-white shadow-none transition-colors hover:bg-teal-700"
          >
            Audit & Drift
          </Link>
        </nav>
      </div>
    </header>
  );
}
