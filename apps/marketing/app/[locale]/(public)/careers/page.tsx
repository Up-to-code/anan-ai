import type { Metadata } from "next";
import { ButtonLink, PageHero, Section } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.careers;
  return createPageMetadata(locale, "/careers", seo.title, seo.description);
}

export default async function CareersPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const copy = locale === "ar"
    ? {
        title: "نبحث عن أشخاص",
        accent: "يحوّلون التعقيد إلى نظام واضح",
        body: "إذا كنت تحب بناء منتجات تفهم السوق وتخدم الفرق فعلياً، فربما تكون عنان المكان المناسب لك.",
        cta: "تواصل معنا",
      }
    : locale === "fr"
      ? {
          title: "Nous cherchons des personnes",
          accent: "qui transforment la complexite en systeme clair",
          body: "Si vous aimez construire des produits qui comprennent le marche et servent vraiment les equipes, Anan peut etre le bon endroit.",
          cta: "Nous contacter",
        }
      : {
          title: "We are looking for people",
          accent: "who turn complexity into clear systems",
          body: "If you like building products that understand the market and genuinely help teams operate, Anan might be the right place for you.",
          cta: "Contact us",
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
          actions={<div className="pt-4"><ButtonLink href="mailto:info@anan.sa" variant="primary">{copy.cta}</ButtonLink></div>}
        />
      </Section>
    </main>
  );
}
