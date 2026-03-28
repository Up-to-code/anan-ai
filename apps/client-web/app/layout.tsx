import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import PostHogProvider from "./PostHogProvider";
import { RootFontFaces, rootFontClassName } from "@/lib/rootFonts";
import { LocaleProvider } from "@/client_zone/components/LocaleProvider";
import { getDictionary } from "@/client_zone/i18n/dictionaries";
import { isRtlLocale, resolveLocale } from "@/client_zone/i18n/locale";

export const metadata: Metadata = {
  title: "Anan Clients",
  description: "Buyer-focused web experience for property search, financing, and advisor handoff.",
};

/**
 * WHY:   The client web app needs one root shell that resolves locale, fonts, and Convex auth providers.
 * WHAT:  Wraps the entire application with Cairo typography, locale context, and Convex providers.
 * HOW:   Reads the locale cookie on the server, sets `lang/dir`, then initializes auth and browser Convex clients.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("anan_client_locale")?.value);
  const dictionary = getDictionary(locale);

  return (
    <html lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"}>
      <body className={rootFontClassName}>
        <RootFontFaces />
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>
            <PostHogProvider>
              <LocaleProvider locale={locale} dictionary={dictionary}>
                {children}
              </LocaleProvider>
            </PostHogProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
