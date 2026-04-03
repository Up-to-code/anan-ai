import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";
import { withLocale } from "@/lib/routes";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

/**
 * WHY:   The root URL should only act as an entry point into the canonical locale trees.
 * WHAT:  Redirects visitors to the preferred locale path based on the persisted cookie.
 * HOW:   Reads the web locale cookie on the server and falls back to Arabic when none is set.
 */
export default async function RootRedirectPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  redirect(withLocale(locale));
}

