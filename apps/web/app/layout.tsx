import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import { RootFontFaces, rootFontClassName } from "@/lib/rootFonts";
import { getWebDictionary } from "@/lib/i18n";
import { isRtlLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";
import { WebLocaleProvider } from "./_components/WebLocaleProvider";
import ThemeProvider from "./theme-provider";
import PostHogProvider from "./PostHogProvider";

export const metadata: Metadata = {
  title: "Anan - Coming Soon",
  description: "Advanced Institutional Real Estate Intelligence",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  const dictionary = getWebDictionary(locale);
  return (
    <html lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${rootFontClassName} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <WebLocaleProvider locale={locale} dictionary={dictionary}>
              <PostHogProvider>
                <RootFontFaces />
                {children}
              </PostHogProvider>
            </WebLocaleProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
