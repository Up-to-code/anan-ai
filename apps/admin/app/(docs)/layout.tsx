import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/serverSession";

/**
 * WHY:   Developer docs should live outside the admin dashboard shell while still staying protected.
 * WHAT:  Guards the standalone `/docs` route group and renders a minimal docs-only chrome.
 * HOW:   Resolves the current authenticated session, redirects anonymous users, and wraps children in a clean developer shell.
 */
export default async function DocsRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthenticatedSession();

  if (!session.token || !session.user) {
    redirect("/signin?returnTo=/docs");
  }

  return (
    <div className="min-h-svh bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="space-y-1">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600">Developer Docs</div>
            <div className="text-xl font-black tracking-tight text-slate-950">Anan Internal Handbook</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Signed In</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              {session.user.name || session.user.email || session.user.id}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
