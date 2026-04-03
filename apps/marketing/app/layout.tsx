import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import { RootFontFaces, rootFontClassName } from "@/lib/rootFonts";
import { getWebDictionary } from "@/lib/i18n";
import { isRtlLocale, isSupportedLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";
import { marketingBrand } from "@/lib/brand";
import { getMarketingBaseUrl } from "@/lib/site";
import { WebLocaleProvider } from "./_components/WebLocaleProvider";
import ThemeProvider from "./theme-provider";
import PostHogProvider from "./PostHogProvider";

export const metadata: Metadata = {
  metadataBase: getMarketingBaseUrl(),
  title: {
    default: "Anan | Real Estate Operating Infrastructure",
    template: "%s | Anan",
  },
  description:
    "Anan connects AI qualification, real estate workflow operations, and commercial execution in one operating system.",
  applicationName: marketingBrand.legalName,
  icons: {
    icon: marketingBrand.iconPath,
    shortcut: marketingBrand.iconPath,
    apple: marketingBrand.iconPath,
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const cookieStore = await cookies();
  const resolvedParams = await params;
  const locale = isSupportedLocale(resolvedParams?.locale)
    ? resolvedParams.locale
    : resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  const dictionary = getWebDictionary(locale);

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`${rootFontClassName} bg-background text-foreground antialiased`}
      >
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
