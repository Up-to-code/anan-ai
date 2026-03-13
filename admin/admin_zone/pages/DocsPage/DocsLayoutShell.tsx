"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { docsTabs } from "@/lib/adminSectionTabs";
import { docsPageMeta, docsPageOrder } from "./registry";

type DocsLayoutShellProps = {
  children: ReactNode;
};

/**
 * WHY:   The docs section should feel like a dedicated developer handbook instead of a dashboard subsection.
 * WHAT:  Renders the shared docs hero and docs-specific route navigation for every `/docs` page.
 * HOW:   Uses the current pathname to highlight the active docs route and wraps content in a constrained article-friendly shell.
 */
export default function DocsLayoutShell({ children }: DocsLayoutShellProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden border border-slate-200/60 bg-white shadow-sm">
        <div className="grid gap-8 border-b border-slate-200/60 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-6 py-8 lg:grid-cols-[minmax(0,1.35fr)_320px] lg:px-10 lg:py-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-slate-700">
              Internal Docs
            </div>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 lg:text-[2.6rem]">
                Anan Internal Developer Handbook
              </h1>
              <p className="max-w-3xl text-sm font-semibold leading-7 text-slate-600">
                The standalone developer entrypoint for platform architecture, capability ownership, UI surfaces, data
                contracts, AI chatflow, and day-to-day development workflow.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="border border-slate-200 bg-slate-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Surfaces</div>
                <div className="mt-3 text-sm font-semibold leading-7 text-slate-700">Web, admin, mobile, and Convex.</div>
              </div>
              <div className="border border-slate-200 bg-slate-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Primary use</div>
                <div className="mt-3 text-sm font-semibold leading-7 text-slate-700">
                  Trace ownership before changing business rules.
                </div>
              </div>
              <div className="border border-slate-200 bg-slate-50 p-4">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Source of truth</div>
                <div className="mt-3 text-sm font-semibold leading-7 text-slate-700">
                  The route-backed docs below are the canonical internal developer handbook.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 border border-slate-200 bg-slate-50/80 p-5">
            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Browse handbook</div>
              <p className="text-sm font-semibold leading-6 text-slate-600">
                Move page-by-page or use the tabs below. Every page is a real docs route with its own URL.
              </p>
            </div>
            <div className="space-y-2">
              {docsPageOrder.map((pageKey) => {
                const page = docsPageMeta[pageKey];
                const active =
                  pageKey === "overview"
                    ? pathname === page.href
                    : pathname === page.href || pathname.startsWith(`${page.href}/`);

                return (
                  <a
                    key={page.href}
                    href={page.href}
                    className={[
                      "block border px-4 py-3 transition-colors",
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="text-sm font-black tracking-tight">{page.label}</div>
                    <div className={["mt-1 text-xs leading-6", active ? "text-slate-200" : "text-slate-500"].join(" ")}>
                      {page.description}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <nav aria-label="Docs navigation" className="overflow-x-auto bg-white px-4 py-4 lg:px-8">
          <div className="flex min-w-max gap-3">
            {docsTabs.map((tab) => {
              const active = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

              return (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "border px-4 py-2 text-sm font-black transition-colors",
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950",
                  ].join(" ")}
                >
                  {tab.label}
                </a>
              );
            })}
          </div>
        </nav>
      </section>

      <div className="max-w-[1360px]">{children}</div>
    </div>
  );
}
