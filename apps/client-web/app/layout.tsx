import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import PostHogProvider from "./PostHogProvider";
import { RootFontFaces, rootFontClassName } from "@/lib/rootFonts";
import { getClientWebBaseUrl } from "@/lib/site";
import { LocaleProvider } from "@/client_zone/components/LocaleProvider";
import { getDictionary } from "@/client_zone/i18n/dictionaries";
import { isRtlLocale, resolveLocale } from "@/client_zone/i18n/locale";

const metadataBase = getClientWebBaseUrl();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Anan Client Assistant",
    template: "%s | Anan Client Assistant",
  },
  description: "Search live properties, check financing, and request advisor follow-up from one buyer-friendly Anan experience.",
  applicationName: "Anan Client Assistant",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: metadataBase,
    siteName: "Anan Client Assistant",
    title: "Anan Client Assistant",
    description:
      "Search live properties, check financing, and request advisor follow-up from one buyer-friendly Anan experience.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anan Client Assistant",
    description:
      "Search live properties, check financing, and request advisor follow-up from one buyer-friendly Anan experience.",
  },
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
