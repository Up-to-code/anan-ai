import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { RootFontFaces, rootFontClassName } from "@/lib/rootFonts";
import ThemeProvider from "./theme-provider";
import PostHogProvider from "./PostHogProvider";

export const metadata: Metadata = {
  title: "Anan - Coming Soon",
  description: "Advanced Institutional Real Estate Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${rootFontClassName} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <PostHogProvider>
              <RootFontFaces />
              {children}
            </PostHogProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
