import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { isRtlLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";

/**
 * WHY:   Buyer-facing broken links should recover users back into the landing or assistant flow.
 * WHAT:  Renders the buyer app not-found state with clear next actions.
 * HOW:   Resolves locale server-side from the same cookie used by the root layout and keeps the shell on-brand.
 */
export default async function NotFound() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  const dictionary = getDictionary(locale);

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[var(--workspace-shell)] px-6 py-12"
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-lg rounded-[32px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--workspace-muted)]">404</p>
        <h1 className="mt-4 text-3xl font-black text-[var(--workspace-bubble-other-foreground)]">
          {dictionary.common.error}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--workspace-muted)]">
          {dictionary.property.notFound}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/app">
            <Button>{dictionary.handoff.backToAssistant}</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">{dictionary.nav.home}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
