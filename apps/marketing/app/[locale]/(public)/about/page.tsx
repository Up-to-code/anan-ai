import type { Metadata } from "next";
import { Shield, Target, Users } from "lucide-react";
import { ButtonLink, FeatureCardGrid, MetricGrid, PageHero, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
import { createPageMetadata } from "@/lib/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.about;
  return createPageMetadata(locale, "/about", seo.title, seo.description);
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const about = getMarketingContent(locale).about;
  const clarityValue = locale === "ar" ? "واضح" : locale === "fr" ? "Clair" : "Clear";

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="mx-auto max-w-4xl space-y-10 text-center"
          badge={
            <SectionLabel
              className="mx-auto inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-50 px-4 py-2"
              icon={Target}
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
            >
              {about.badge}
            </SectionLabel>
          }
          title={<>{about.title} <br /><span className="text-blue-600">{about.titleAccent}</span></>}
          titleClassName="text-6xl font-black leading-tight text-slate-900 dark:text-slate-100"
          description={<p>{about.description}</p>}
          descriptionClassName="mx-auto max-w-3xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
          actions={
            <div className="pt-4">
              <ButtonLink href={withLocale(locale, "/contact")} variant="primary">
                {about.contact}
              </ButtonLink>
            </div>
          }
        />
      </Section>

      <Section className="py-28">
        <FeatureCardGrid
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          items={[
            { icon: Target, title: about.missionTitle, description: about.missionDescription },
            { icon: Shield, title: about.valuesTitle, description: about.valuesDescription },
            { icon: Users, title: about.workStyleTitle, description: about.workStyleDescription },
          ]}
        />
      </Section>

      <Section bg="white" border>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 py-8 lg:grid-cols-2">
          <div className="space-y-6 text-right">
            <h2 className="text-5xl font-black leading-tight text-slate-900 dark:text-slate-100">
              {about.whyTitle} <br />
              <span className="text-blue-600">{about.whyAccent}</span>
            </h2>
          </div>
          <div className="space-y-6 text-right text-lg font-bold leading-8 text-slate-500 dark:text-slate-300">
            <p>{about.whyDescriptionPrimary}</p>
            <p>{about.whyDescriptionSecondary}</p>
          </div>
        </div>
      </Section>

      <Section bg="dark">
        <MetricGrid
          className="grid grid-cols-2 gap-12 text-center lg:grid-cols-4"
          itemClassName="space-y-4"
          valueClassName="block text-5xl font-black tracking-tight text-blue-500"
          labelClassName="block text-xs font-black uppercase tracking-[0.2em] text-slate-400"
          items={[
            { value: "1", label: about.metricsUnified },
            { value: "2", label: about.metricsAudience },
            { value: "24/7", label: about.metricsAvailability },
            { value: clarityValue, label: about.metricsClarity },
          ]}
        />
      </Section>

      <Section className="py-28">
        <div className="mx-auto max-w-5xl space-y-12 text-right">
          <h2 className="text-5xl font-black leading-tight text-slate-900 dark:text-slate-100">
            {about.identityTitle} <br />
            <span className="text-blue-600">{about.identityAccent}</span>
          </h2>
          <div className="grid grid-cols-1 gap-10 text-lg font-bold leading-8 text-slate-500 dark:text-slate-300 lg:grid-cols-2">
            <p>{about.identityDescriptionPrimary}</p>
            <p>{about.identityDescriptionSecondary}</p>
          </div>
          <div className="flex flex-col gap-6 pt-4 sm:flex-row">
            <ButtonLink href={withLocale(locale, "/contact")} variant="primary">{about.talkToTeam}</ButtonLink>
            <ButtonLink href={withLocale(locale, "/developer")} variant="outline">{about.developerSpace}</ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
