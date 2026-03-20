import Link from "next/link";
import { docsNavGroups, docsPages } from "@/lib/docs/registry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * WHY:   External partners need a single public landing page before diving into detailed integration guides.
 * WHAT:  Presents quickstart entry points and structured links to all developer docs sections.
 * HOW:   Reads the typed docs registry so landing links stay synchronized with docs route definitions.
 */
export default function LandingPage() {
  return (
    <main className="min-h-svh bg-white">
      {/* Clean, expansive premium hero area (Sharp UI) */}
      <section className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 pb-16 pt-24 text-center lg:px-6 lg:pb-24 lg:pt-32">
        <Badge variant="outline" className="mb-6 rounded-none border-2 border-slate-900 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-widest text-slate-900">
          Public Documentation
        </Badge>
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 uppercase sm:text-6xl lg:text-7xl">
          Anan Developer Protocol
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-slate-500 sm:text-xl">
          Build partner integrations with OAuth credentials, delegated Clients and Properties APIs, and scope-based access controls.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" className="rounded-none bg-blue-600 px-10 py-6 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-700">
            <Link href="/docs/getting-started">Start Integration</Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-none border-2 border-blue-600 bg-white px-10 py-6 text-sm font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">
            <Link href="/docs/oauth/authorization-code-pkce">OAuth + PKCE</Link>
          </Button>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl bg-slate-100 h-[2px]" />

      {/* Flat Navigation Cards (Sharp UI) */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:px-6 lg:py-24">
        <div className="grid md:grid-cols-2 gap-px bg-slate-100 border-y-2 border-slate-100">
          {docsNavGroups.map((group) => (
            <div key={group.id} className="flex flex-col bg-white p-8">
              <h2 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">{group.title}</h2>
              <div className="flex flex-col">
                {group.items.map((pageKey) => {
                  const page = docsPages[pageKey];
                  return (
                    <Link
                      key={page.key}
                      href={page.href}
                      className="group flex flex-col justify-center border-b-2 border-slate-50 py-5 last:border-b-0 transition-colors hover:border-blue-600"
                    >
                      <span className="text-sm font-black uppercase tracking-widest text-slate-900 transition-colors group-hover:text-blue-600">{page.title}</span>
                      <span className="mt-2 text-sm font-medium leading-relaxed text-slate-500">{page.description}</span>
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
