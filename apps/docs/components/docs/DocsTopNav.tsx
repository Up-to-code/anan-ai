import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function DocsTopNav() {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-slate-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="mt-[1px] md:hidden" />
          <div className="flex flex-col">
            <Link href="/" className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-colors hover:text-blue-600">
              Anan Docs
            </Link>
            <span className="text-[10px] font-black tracking-widest text-slate-400">DEVELOPER API</span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <Badge variant="outline" className="hidden rounded-none border-2 border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500 md:inline-flex">
            v1.0
          </Badge>
          <Button variant="ghost" size="sm" className="hidden rounded-none px-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-slate-900 md:flex" render={<Link href="/docs/getting-started" />}>
            Quickstart
          </Button>
          <Button size="sm" className="rounded-none bg-blue-600 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-none transition-colors hover:bg-blue-700" render={<Link href="/docs/oauth/authorization-code-pkce" />}>
            OAuth Flow
          </Button>
        </nav>
      </div>
    </header>
  );
}
