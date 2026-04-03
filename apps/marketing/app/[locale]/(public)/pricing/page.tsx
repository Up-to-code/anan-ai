import type { Metadata } from "next";
import { ButtonLink, PageHero, Section } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
import { createPageMetadata } from "@/lib/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.pricing;
  return createPageMetadata(locale, "/pricing", seo.title, seo.description);
}

export default async function PricingPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const copy = locale === "ar"
    ? {
        title: "تسعير مرن",
        accent: "يناسب مراحل النمو",
        body: "نعمل مع كل شركة بحسب مرحلة تشغيلها: من بدء استخدام المساعد والوثائق العامة، إلى توسيع مساحة العمل والتكاملات والخدمات التشغيلية.",
        cta: "تحدث مع الفريق",
      }
    : locale === "fr"
      ? {
          title: "Une tarification flexible",
          accent: "adaptee aux etapes de croissance",
          body: "Nous travaillons avec chaque entreprise selon sa phase: de l'assistant et des docs publiques, jusqu'au workspace et aux integrations plus profondes.",
          cta: "Parler a l'equipe",
        }
      : {
          title: "Flexible pricing",
          accent: "for different growth stages",
          body: "We work with each company based on its operating stage: from the assistant and public docs through workspace expansion, integrations, and operating support.",
          cta: "Talk to the team",
        };

  return (
    <main className="min-h-[70vh]">
      <Section bg="slate" className="py-32 pt-40">
        <PageHero
          contentClassName="mx-auto max-w-4xl space-y-10 text-center"
          title={<>{copy.title} <br /><span className="text-blue-600">{copy.accent}</span></>}
          titleClassName="text-6xl font-black leading-tight text-slate-900 dark:text-slate-100"
          description={<p className="mx-auto max-w-2xl">{copy.body}</p>}
          descriptionClassName="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
          actions={<div className="pt-4"><ButtonLink href={withLocale(locale, "/contact")} variant="primary">{copy.cta}</ButtonLink></div>}
        />
      </Section>
    </main>
  );
}
