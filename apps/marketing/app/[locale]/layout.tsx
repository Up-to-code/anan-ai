import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isSupportedLocale, WEB_SUPPORTED_LOCALES } from "@/lib/locale";

export function generateStaticParams() {
  return WEB_SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

/**
 * WHY:   Public locale routes should only be generated for supported marketing languages.
 * WHAT:  Guards the locale subtree and exposes static params for crawlable locale pages.
 * HOW:   Rejects unsupported locale params early with `notFound()`.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return children;
}
