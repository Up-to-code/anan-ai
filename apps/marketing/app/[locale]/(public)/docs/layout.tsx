import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsShell } from "@/app/[locale]/(public)/docs/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.docs;
  return createPageMetadata(locale, "/docs", seo.title, seo.description);
}

/**
 * WHY:   All docs pages need a consistent public documentation frame.
 * WHAT:  Wraps docs routes with top navigation and sidebar shell.
 * HOW:   Uses a shared `DocsShell` component for layout consistency across all docs pages.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <section dir="ltr" className="min-h-screen bg-background text-foreground transition-colors">
      <DocsShell>{children}</DocsShell>
    </section>
  );
}
