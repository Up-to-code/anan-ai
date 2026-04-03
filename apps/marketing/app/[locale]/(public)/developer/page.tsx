import type { Metadata } from "next";
import { BarChart3, Globe, LayoutGrid, ShieldCheck } from "lucide-react";
import {
  ActionRow,
  ButtonLink,
  FeatureCardGrid,
  PageHero,
  Section,
  SectionLabel,
} from "@/app/[locale]/(public)/public";
import { DeveloperPulseVisual, EcosystemConnectionVisual } from "@/app/[locale]/(public)/LandingPage/LandingMotionVisuals";
import type { AppLocale } from "@/lib/locale";
import { getMarketingContent } from "@/lib/marketing-content";
import { withLocale } from "@/lib/routes";
import { createPageMetadata, getDocsUrl } from "@/lib/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.developer;
  return createPageMetadata(locale, "/developer", seo.title, seo.description);
}

export default async function DeveloperPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const docsUrl = getDocsUrl();
  const copy = {
    ar: {
      eyebrow: "للمطورين",
      title: "شغّل مشاريعك",
      accent: "برؤية أقرب للطلب",
      description:
        "عنان تساعد فرق التطوير على تنظيم المشاريع والعروض، تشغيل شبكة الوسطاء، وقراءة ما يطلبه السوق فعلاً من خلال بنية تشغيل موحّدة.",
      cards: [
        { icon: BarChart3, title: "ذكاء طلب حي", description: "رؤية أوضح للمناطق والميزانيات وأنماط الاهتمام التي تظهر في السوق." },
        { icon: Globe, title: "توزيع أوسع", description: "تحويل المشروع من ملف ثابت إلى قناة توزيع قابلة للقياس والمتابعة." },
        { icon: LayoutGrid, title: "تشغيل منظم", description: "ربط البيانات والعروض والوسطاء والعملاء داخل مسار واحد أقل تشتيتاً." },
      ],
      sections: [
        {
          title: "المشكلة",
          body: "الفرق التطويرية تحتاج إلى فهم السوق وتنفيذ التوزيع في الوقت نفسه، لكن المعلومات غالباً ما تبقى مجزأة بين أدوات متعددة.",
        },
        {
          title: "ما الذي تغيّره عنان",
          body: "توحد عنان بين بيانات المشروع والعرض وشبكة الوسطاء وإشارات الطلب لتصبح القرارات التجارية أقرب للواقع.",
        },
        {
          title: "الأثر التجاري",
          body: "هذا يعني إطلاقاً أسرع، متابعة أوضح، وقدرة أعلى على معرفة أين يتحرك الطلب الحقيقي وكيف يستجيب له الفريق.",
        },
      ],
      forWho: "مناسب للمطورين الذين يريدون منصة تساعدهم على البيع والتوزيع وفهم السوق، لا مجرد صفحة إدارة داخلية.",
      primaryCta: "وثائق المطورين",
      secondaryCta: "تحدث مع الفريق",
    },
    en: {
      eyebrow: "For developers",
      title: "Run your projects",
      accent: "with clearer demand visibility",
      description:
        "Anan helps developer teams organize projects and offers, activate broker distribution, and understand real market demand through one operating system.",
      cards: [
        { icon: BarChart3, title: "Live demand intelligence", description: "See which locations, budgets, and patterns are actually surfacing in the market." },
        { icon: Globe, title: "Broader distribution", description: "Turn a static project file into a measurable, trackable distribution channel." },
        { icon: LayoutGrid, title: "Structured operations", description: "Connect data, offers, brokers, and clients inside one lower-noise workflow." },
      ],
      sections: [
        {
          title: "The problem",
          body: "Developer teams need to understand the market and run distribution at the same time, but information is usually split across disconnected tools.",
        },
        {
          title: "What Anan changes",
          body: "Anan unifies project data, offer logic, broker networks, and live demand signals so commercial decisions stay closer to reality.",
        },
        {
          title: "Commercial impact",
          body: "That means faster launch cycles, clearer follow-through, and a stronger ability to see where demand is moving and how the team should respond.",
        },
      ],
      forWho: "Built for developers that need a platform for selling, distributing, and reading the market, not just an internal dashboard.",
      primaryCta: "Developer docs",
      secondaryCta: "Talk to the team",
    },
    fr: {
      eyebrow: "Pour les promoteurs",
      title: "Pilotez vos projets",
      accent: "avec une meilleure lecture de la demande",
      description:
        "Anan aide les equipes promoteur a organiser projets et offres, activer la distribution via courtiers et comprendre la demande reelle dans un seul systeme.",
      cards: [
        { icon: BarChart3, title: "Intelligence de demande", description: "Voir quelles zones, budgets et tendances apparaissent vraiment sur le marche." },
        { icon: Globe, title: "Distribution etendue", description: "Transformer un projet statique en canal de distribution mesurable." },
        { icon: LayoutGrid, title: "Operations structurees", description: "Relier donnees, offres, courtiers et clients dans un seul workflow." },
      ],
      sections: [
        {
          title: "Le probleme",
          body: "Les equipes promoteur doivent comprendre le marche et executer la distribution en meme temps, mais l'information reste souvent dispersee.",
        },
        {
          title: "Ce qu'Anan change",
          body: "Anan unifie les donnees projet, les offres, le reseau de courtiers et les signaux de demande pour rapprocher les decisions du terrain.",
        },
        {
          title: "Impact commercial",
          body: "Cela permet des lancements plus rapides, un meilleur suivi et une meilleure lecture de la direction prise par la demande.",
        },
      ],
      forWho: "Concu pour les promoteurs qui veulent une plateforme de vente, distribution et lecture du marche, pas seulement un tableau interne.",
      primaryCta: "Docs developpeur",
      secondaryCta: "Parler a l'equipe",
    },
  }[locale];

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2"
          contentClassName="space-y-10 text-right"
          badge={
            <SectionLabel
              icon={ShieldCheck}
              className="inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-50 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
            >
              {copy.eyebrow}
            </SectionLabel>
          }
          title={<>{copy.title} <br /><span className="text-blue-600">{copy.accent}</span></>}
          titleClassName="text-6xl font-black leading-tight text-slate-900 dark:text-slate-100"
          description={<p>{copy.description}</p>}
          descriptionClassName="max-w-xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
          actions={
            <ActionRow className="flex flex-col gap-6 pt-4 sm:flex-row">
              <ButtonLink href={docsUrl} variant="primary">{copy.primaryCta}</ButtonLink>
              <ButtonLink href={withLocale(locale, "/contact")} variant="outline">{copy.secondaryCta}</ButtonLink>
            </ActionRow>
          }
          visual={<DeveloperPulseVisual />}
        />
      </Section>

      <Section className="py-28">
        <FeatureCardGrid className="grid grid-cols-1 gap-8 lg:grid-cols-3" items={copy.cards} />
      </Section>

      <Section bg="dark">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <EcosystemConnectionVisual />
          <div className="grid gap-8 text-right">
            {copy.sections.map((section) => (
              <div key={section.title} className="border border-slate-800 p-8">
                <h2 className="text-2xl font-black text-white">{section.title}</h2>
                <p className="mt-4 text-base font-bold leading-8 text-slate-400">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-28">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">{copy.forWho}</p>
          <ActionRow className="flex flex-col justify-center gap-6 sm:flex-row">
            <ButtonLink href={docsUrl} variant="dark">{copy.primaryCta}</ButtonLink>
            <ButtonLink href={withLocale(locale, "/contact")} variant="ghost">
              {locale === "ar" ? "تحدث مع الفريق" : locale === "fr" ? "Parler a l'equipe" : "Talk to the team"}
            </ButtonLink>
          </ActionRow>
        </div>
      </Section>
    </main>
  );
}
