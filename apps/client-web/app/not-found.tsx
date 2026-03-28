import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/client_zone/components/ui/button";
import { getDictionary } from "@/client_zone/i18n/dictionaries";
import { isRtlLocale, resolveLocale } from "@/client_zone/i18n/locale";

/**
 * WHY:   Buyer-facing broken links should recover users back into search or chat instead of showing a generic framework page.
 * WHAT:  Renders the client web not-found state with clear next actions.
 * HOW:   Resolves locale server-side, then offers routes back to the assistant and public discovery pages.
 */
export default async function NotFound() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("anan_client_locale")?.value);
  const dictionary = getDictionary(locale);
  const copy =
    locale === "ar"
      ? {
          title: "هذه الصفحة غير متاحة",
          description: "قد يكون الرابط غير صحيح أو أن هذا المحتوى لم يعد منشوراً حالياً.",
        }
      : {
          title: "This page is not available",
          description: "The link may be incorrect, or this content is no longer currently published.",
        };

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[var(--workspace-shell)] px-6 py-12"
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-lg rounded-[32px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--workspace-muted)]">404</p>
        <h1 className="mt-4 text-3xl font-black text-[var(--workspace-bubble-other-foreground)]">{copy.title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--workspace-muted)]">{copy.description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/app">
            <Button>{dictionary.app.backToAssistant}</Button>
          </Link>
          <Link href="/search">
            <Button variant="outline">{dictionary.nav.search}</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
