import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const cairo = Cairo({

  subsets: ["arabic", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.className} ${geistMono.variable} antialiased font-sans`}
      >
        <ConvexAuthNextjsServerProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
