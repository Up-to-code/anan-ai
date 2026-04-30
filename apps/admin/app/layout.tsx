import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import ThemeProvider from "./theme-provider";
import { ADMIN_LOCALE_COOKIE, isRtlLocale, resolveLocale } from "@/lib/locale";
import { rootFontClassName } from "@/lib/rootFonts";

export const metadata: Metadata = {
  title: "Anan Admin",
  description: "Institutional platform operations for Anan",
};

/**
 * WHY:   The standalone admin app needs its own root layout and token setup.
 * WHAT:  Provides the Cairo-based RTL document shell and the shared Better Auth + Convex providers.
 * HOW:   Mirrors the web app baseline while branding the experience for admin operations.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);
  return (
    <html lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${rootFontClassName} workspace-root-chrome bg-background text-foreground`}
      >
        <ThemeProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
