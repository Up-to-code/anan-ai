import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const arabicSans = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-assistant-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-assistant-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anan Main Assistant",
  description: "Public voice-first assistant prototype for the Anan main assistant.",
};

/**
 * WHY:   The public assistant app needs a minimal document shell with Arabic-first typography.
 * WHAT:  Wraps the app with fonts, metadata, and global styles.
 * HOW:   Uses Google-hosted IBM Plex Arabic/Sans pair to avoid depending on app-local assets.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${arabicSans.variable} ${mono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
