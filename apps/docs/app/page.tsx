import Link from "next/link";
import { docsNavGroups, docsPages } from "@/lib/docs/registry";
import { Button } from "@/components/ui/button";

/**
 * WHY:   External partners need a single public landing page before diving into detailed integration guides.
 * WHAT:  Presents quickstart entry points and structured links to all developer docs sections.
 * HOW:   Reads the typed docs registry so landing links stay synchronized with docs route definitions.
 */
export default function LandingPage() {
  return (
    <main className="min-h-svh bg-workspace-canvas text-foreground selection:bg-workspace-highlight/30">
      {/* Dynamic Premium Hero */}
      <section className="relative overflow-hidden border-b border-workspace-border bg-workspace-shell px-4 pb-20 pt-28 text-center sm:px-6 lg:pb-32 lg:pt-40">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--workspace-bubble-self-muted),_transparent_50%)] opacity-30 dark:opacity-20" />
        
        <div className="relative mx-auto max-w-5xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-workspace-border bg-workspace-elevated px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-workspace-muted shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-workspace-highlight animate-pulse" />
            Anan Developer Documentation
          </div>
          <h1 className="max-w-4xl mx-auto text-5xl font-black tracking-tight text-foreground sm:text-7xl lg:text-[5.5rem] leading-[1.1]">
            Build The Future Of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Real Estate</span>
          </h1>
          <p className="mt-8 max-w-2xl mx-auto text-lg font-medium leading-relaxed text-workspace-muted sm:text-xl">
            We try to make the future of real estate technology easier and smarter.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 rounded-2xl bg-workspace-bubble-self px-10 text-sm font-black uppercase tracking-[0.15em] text-workspace-bubble-self-foreground shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-transform hover:scale-105 hover:bg-workspace-bubble-self">
              <Link href="/docs/getting-started">Start Integration</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-2xl border-workspace-border bg-workspace-panel px-10 text-sm font-black uppercase tracking-[0.15em] text-foreground shadow-sm transition-colors hover:bg-workspace-accent-soft hover:text-foreground">
              <Link href="/docs/api-keys">Explore API Keys</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Scalable Hub Navigation */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="grid gap-16">
          {docsNavGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <div className="h-3.5 w-3.5 rounded-sm bg-current" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {group.title}
                </h2>
              </div>
              
              {/* Massive Scalable Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((pageKey) => {
                  const page = docsPages[pageKey];
                  return (
                    <Link
                      key={page.key}
                      href={page.href}
                      className="group flex flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] dark:border-white/10 dark:bg-[#0c0c0f] dark:shadow-none dark:hover:border-blue-500/40 dark:hover:bg-[#111114]"
                    >
                      {/* Premium Typography & Badging Layout */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <span className="text-xl font-black text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {page.title}
                        </span>
                        {page.pageType === "api" ? (
                          <span className="rounded-full flex h-5 items-center bg-emerald-500/10 px-2 text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/20">API</span>
                        ) : page.pageType === "concept" ? (
                          <span className="rounded-full flex h-5 items-center bg-amber-500/10 px-2 text-[9px] font-black uppercase tracking-widest text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ring-1 ring-amber-500/20">Concept</span>
                        ) : (
                          <span className="rounded-full flex h-5 items-center bg-blue-500/10 px-2 text-[9px] font-black uppercase tracking-widest text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ring-1 ring-blue-500/20">Guide</span>
                        )}
                      </div>
                      
                      <span className="text-sm font-medium leading-relaxed text-slate-500 line-clamp-3 dark:text-slate-400">
                        {page.description}
                      </span>
                      
                      {/* Future Media Placeholder Area (Scalability) */}
                      <div className="mt-8 h-2 w-12 rounded-full bg-slate-100 transition-colors group-hover:bg-blue-500/20 dark:bg-[#18181b] dark:group-hover:bg-blue-500/40" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
