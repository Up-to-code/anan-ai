import type { Metadata } from "next";
import "./globals.css";
import { RootFontFaces, rootFontClassName } from "@/lib/rootFonts";

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
      <body className={rootFontClassName}>
        <RootFontFaces />
        {children}
      </body>
    </html>
  );
}
