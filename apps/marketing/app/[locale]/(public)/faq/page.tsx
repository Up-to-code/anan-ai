import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { PageHero, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.faq;
  return createPageMetadata(locale, "/faq", seo.title, seo.description);
}

export default async function FAQPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const faq = getMarketingContent(locale).faq;

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="mx-auto max-w-4xl space-y-8 text-center"
          badge={
            <SectionLabel
              icon={HelpCircle}
              className="mx-auto inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-600/10 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
            >
              {faq.eyebrow}
            </SectionLabel>
          }
          title={<>{faq.title}</>}
          titleClassName="text-5xl font-black leading-tight text-slate-900 dark:text-slate-100 md:text-6xl"
          description={<p className="mx-auto max-w-2xl">{faq.description}</p>}
          descriptionClassName="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
        />
      </Section>

      <Section className="py-24">
        <div className="mx-auto max-w-4xl space-y-24">
          {faq.groups.map((group) => (
            <div key={group.category} className="space-y-12">
              <h2 className="border-r-8 border-slate-200 pr-6 text-3xl font-black uppercase text-slate-900 dark:border-slate-700 dark:text-slate-100">
                {group.category}
              </h2>
              <div className="space-y-8">
                {group.items.map((item) => (
                  <div key={item.q} className="border-2 border-slate-100 bg-slate-50 p-8 transition-colors hover:border-blue-600 dark:border-slate-800 dark:bg-slate-900/70">
                    <h3 className="mb-4 text-xl font-black text-slate-900 dark:text-slate-100">{item.q}</h3>
                    <p className="font-bold leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
