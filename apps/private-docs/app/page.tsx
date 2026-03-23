import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FileCode2, Layers3, LockKeyhole, Route } from "lucide-react";
import { unlockPrivateDocs } from "./actions";
import { hasPrivateDocsAccess, sanitizePrivateDocsReturnTo } from "@/lib/privateAccess";

/**
 * WHY:   The private docs app needs one controlled entrypoint before the internal handbook becomes visible.
 * WHAT:  Renders the unlock screen and redirects unlocked sessions into the handbook.
 * HOW:   Checks the access cookie on the server and posts the PIN form to the server action that issues the `HttpOnly` cookie.
 */
export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const returnTo = sanitizePrivateDocsReturnTo(params.returnTo ?? null);
  const hasAccess = hasPrivateDocsAccess(cookieStore);

  if (hasAccess) {
    redirect(returnTo);
  }

  const hasError = params.error === "invalid-pin";

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.14),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:p-12">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#0f172a_0%,#14b8a6_50%,#f59e0b_100%)]" />
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">
            <LockKeyhole className="h-4 w-4 text-teal-600" />
            Private Developer Handbook
          </div>
          <h1 className="mt-8 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
            Internal Handbook For The Anan Codebase
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-slate-600">
            This private app is the in-product handbook for how the repo works: architecture,
            zones, runtime surfaces, contribution recipes, and the current audit trail for Convex,
            web, and documentation drift.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Layers3,
                title: "Foundations",
                body: "Architecture, zones, ownership, data contracts, and security rules.",
              },
              {
                icon: FileCode2,
                title: "Runtime Surfaces",
                body: "Convex, web, admin, mobile, and AI or channel system maps.",
              },
              {
                icon: Route,
                title: "Build & Extend",
                body: "Practical recipes for adding tables, web domains, channels, and agents.",
              },
              {
                icon: LockKeyhole,
                title: "Audit & Drift",
                body: "Current findings, documentation gaps, and prioritized remediation order.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5"
                >
                  <Icon className="h-6 w-6 text-teal-600" />
                  <h2 className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{item.body}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-7 text-slate-700">
            The access model stays intentionally lightweight in this pass: a hardcoded PIN and an
            <code className="mx-1 rounded bg-white px-2 py-1 text-xs text-slate-900">HttpOnly</code>
            cookie. Treat it as internal-only convenience rather than production-grade security.
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.07)] xl:p-10">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
            Unlock Handbook
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">
            Enter The Internal Access PIN
          </h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
            Unlocking sets a short-lived server cookie so navigation and reloads stay inside the private handbook.
          </p>

          <form action={unlockPrivateDocs} className="mt-8 space-y-5">
            <input type="hidden" name="returnTo" value={returnTo} />

            <label className="block" htmlFor="private-docs-pin">
              <span className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">
                Internal PIN
              </span>
              <input
                id="private-docs-pin"
                name="pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                spellCheck={false}
                placeholder="Enter the internal PIN…"
                className="mt-3 block h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-teal-100"
              />
            </label>

            <div aria-live="polite" className="min-h-6 text-sm font-semibold text-rose-600">
              {hasError ? "The PIN was incorrect. Try again with the internal access code." : null}
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-[transform,background-color,box-shadow] hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 active:translate-y-px"
            >
              Unlock Developer Handbook
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
              Included In This Pass
            </div>
            <ul className="mt-4 space-y-3 text-sm font-medium leading-7 text-slate-600">
              <li>Foundations for architecture, zones, ownership, and security.</li>
              <li>Runtime-surface maps for Convex, web, admin, mobile, and AI or channels.</li>
              <li>Recipes for adding tables, web domains, channels, and agents.</li>
              <li>Audit pages for Convex, web UI, documentation gaps, and the remediation roadmap.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
