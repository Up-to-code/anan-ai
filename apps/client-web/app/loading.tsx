import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n";
import { isRtlLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";

/**
 * WHY:   Route transitions in the buyer app should keep a polished state instead of a blank frame.
 * WHAT:  Renders a lightweight localized loading shell for App Router navigations.
 * HOW:   Resolves locale from the same cookie used by the root layout and mirrors the buyer-facing visual system.
 */
export default async function Loading() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  const dictionary = getDictionary(locale);

  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-[var(--workspace-shell)] px-6 py-12 text-center"
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-8 shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--workspace-highlight)]" />
        <p className="mt-5 text-sm font-semibold text-[var(--workspace-bubble-other-foreground)]">
          {dictionary.common.loading}
        </p>
      </div>
    </div>
  );
}
