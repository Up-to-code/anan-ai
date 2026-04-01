import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import { RootFontFaces, rootFontClassName } from "@/lib/rootFonts";
import { getDictionary } from "@/lib/i18n";
import { isRtlLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";
import { LocaleProvider } from "./_components/LocaleProvider";
import ThemeProvider from "./theme-provider";
import PostHogProvider from "./PostHogProvider";
import ConvexClientProvider from "./ConvexClientProvider";

export const metadata: Metadata = {
  title: "Anan - Public Assistant",
  description: "Advanced Institutional Real Estate Intelligence",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  const dictionary = getDictionary(locale);
  return (
    <html lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${rootFontClassName} bg-background text-foreground antialiased`}>
        <ConvexClientProvider>
          <ThemeProvider>
            <Suspense fallback={null}>
              <LocaleProvider locale={locale} dictionary={dictionary}>
                <PostHogProvider>
                  <RootFontFaces />
                  {children}
                </PostHogProvider>
              </LocaleProvider>
            </Suspense>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
