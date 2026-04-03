import type { Metadata } from "next";
import LandingPage from "./LandingPage";
import { createPageMetadata } from "@/lib/site";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.home;
  return createPageMetadata(locale, "/", seo.title, seo.description);
}

/**
 * WHY:   The localized home route should stay thin while the landing narrative grows in complexity.
 * WHAT:  Delegates the homepage render to the page-local landing orchestrator with locale context.
 * HOW:   Awaits the locale segment param and passes it down as a plain prop.
 */
export default async function Home({ params }: HomeProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  return <LandingPage locale={locale} />;
}
