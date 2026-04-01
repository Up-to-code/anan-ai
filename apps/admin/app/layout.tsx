import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ADMIN_LOCALE_COOKIE, isRtlLocale, resolveLocale } from "@/lib/locale";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anan Admin",
  description: "Institutional platform operations for Anan",
};

/**
 * WHY:   The standalone admin app needs its own root layout and token setup.
 * WHAT:  Provides the Cairo-based RTL document shell and the shared Convex auth server provider.
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
    <html lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"}>
      <body className={`${cairo.className} ${geistMono.variable} antialiased font-sans`}>
        <ConvexAuthNextjsServerProvider>{children}</ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
