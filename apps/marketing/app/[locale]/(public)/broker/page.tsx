import type { Metadata } from "next";
import { Percent, Users2, Wallet, Zap } from "lucide-react";
import {
  ActionRow,
  ButtonLink,
  FeatureCardGrid,
  PageHero,
  Section,
  SectionLabel,
} from "@/app/[locale]/(public)/public";
import { BrokerNetworkVisual, BuyerIntelligenceVisual } from "@/app/[locale]/(public)/LandingPage/LandingMotionVisuals";
import type { AppLocale } from "@/lib/locale";
import { getMarketingContent } from "@/lib/marketing-content";
import { withLocale } from "@/lib/routes";
import { createPageMetadata } from "@/lib/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.broker;
  return createPageMetadata(locale, "/broker", seo.title, seo.description);
}

export default async function BrokerPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const copy = {
    ar: {
      eyebrow: "للوسطاء",
      title: "اعمل من شبكة أوضح",
      accent: "وفرص أكثر قابلية للمتابعة",
      description:
        "عنان تساعد الوسطاء على الوصول إلى المشاريع المناسبة، متابعة العملاء بوضوح أكبر، والعمل مع المطورين من خلال سياق تجاري مشترك.",
      cards: [
        { icon: Percent, title: "فرص أوضح", description: "اعرف ما الذي يناسب عميلك وما هي الخطوة التالية بسرعة." },
        { icon: Wallet, title: "متابعة منظمة", description: "حافظ على العميل والعرض والسياق في نظام واحد أسهل للاستخدام." },
        { icon: Users2, title: "تعاون فعلي", description: "اقترب أكثر من المطورين والفرق التي تملك المشروع أو القرار." },
      ],
      sections: [
        {
          title: "المشكلة",
          body: "الوسيط يتحرك بسرعة لكن كثيراً من الوقت يضيع في جمع المعلومات، فهم حالة المشروع، أو إعادة شرح السياق من جديد.",
        },
        {
          title: "ما الذي تغيّره عنان",
          body: "تعطي عنان الوسيط طبقة أقرب للمشروع والعرض والعميل، مع سياق مشترك يسهل التعاون مع المطورين والفرق الأخرى.",
        },
        {
          title: "الأثر التجاري",
          body: "هذا يسرّع المتابعة، يقلل ضياع الفرص، ويجعل الجهد اليومي أقرب إلى الإغلاق الفعلي بدلاً من الدوران بين الرسائل.",
        },
      ],
      forWho: "للوسطاء والفرق التجارية التي تريد تقليل الضوضاء اليوميّة والعمل من نظام يفهم مسار الصفقة.",
      primaryCta: "تواصل معنا",
      secondaryCta: "اعرف المزيد",
    },
    en: {
      eyebrow: "For brokers",
      title: "Work from a clearer network",
      accent: "and more actionable opportunities",
      description:
        "Anan helps brokers reach the right projects, follow clients with stronger structure, and collaborate with developers through shared commercial context.",
      cards: [
        { icon: Percent, title: "Clearer opportunities", description: "See what fits the client and what should happen next without digging for context." },
        { icon: Wallet, title: "Structured follow-up", description: "Keep the client, the offer, and the project context inside one easier workflow." },
        { icon: Users2, title: "Real collaboration", description: "Move closer to the developers and teams that hold the project or the decision." },
      ],
      sections: [
        {
          title: "The problem",
          body: "Brokers move fast, but too much time disappears into gathering details, checking project status, or re-explaining context from scratch.",
        },
        {
          title: "What Anan changes",
          body: "Anan gives brokers a layer closer to the project, the offer, and the client, with shared context that makes collaboration easier.",
        },
        {
          title: "Commercial impact",
          body: "That accelerates follow-up, reduces missed opportunities, and makes daily effort feel closer to actual closure instead of message churn.",
        },
      ],
      forWho: "For brokers and commercial teams that want less daily noise and a system that understands the path to the deal.",
      primaryCta: "Contact us",
      secondaryCta: "Learn more",
    },
    fr: {
      eyebrow: "Pour les courtiers",
      title: "Travaillez depuis un reseau plus clair",
      accent: "et des opportunites plus actionnables",
      description:
        "Anan aide les courtiers a acceder aux bons projets, suivre les clients avec plus de structure et collaborer avec les promoteurs via un contexte partage.",
      cards: [
        { icon: Percent, title: "Opportunites plus claires", description: "Voir ce qui convient au client et ce qui doit venir ensuite sans chercher partout." },
        { icon: Wallet, title: "Suivi structure", description: "Conserver client, offre et contexte projet dans un seul workflow plus simple." },
        { icon: Users2, title: "Vraie collaboration", description: "Se rapprocher des promoteurs et des equipes qui portent le projet ou la decision." },
      ],
      sections: [
        {
          title: "Le probleme",
          body: "Les courtiers vont vite, mais trop de temps part a collecter l'information, verifier l'etat du projet ou re-expliquer le contexte.",
        },
        {
          title: "Ce qu'Anan change",
          body: "Anan donne aux courtiers une couche plus proche du projet, de l'offre et du client, avec un contexte partage qui facilite la collaboration.",
        },
        {
          title: "Impact commercial",
          body: "Cela accelere le suivi, reduit les opportunites manquees et rapproche l'effort quotidien de la conclusion reelle.",
        },
      ],
      forWho: "Pour les courtiers et equipes commerciales qui veulent moins de bruit quotidien et un systeme qui comprend le parcours de la transaction.",
      primaryCta: "Nous contacter",
      secondaryCta: "En savoir plus",
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
              icon={Zap}
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
              <ButtonLink href={withLocale(locale, "/contact")} variant="primary">{copy.primaryCta}</ButtonLink>
              <ButtonLink href={withLocale(locale, "/about")} variant="outline">{copy.secondaryCta}</ButtonLink>
            </ActionRow>
          }
          visual={<BrokerNetworkVisual />}
        />
      </Section>

      <Section className="py-28">
        <FeatureCardGrid className="grid grid-cols-1 gap-8 lg:grid-cols-3" items={copy.cards} />
      </Section>

      <Section bg="dark">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <BuyerIntelligenceVisual />
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
            <ButtonLink href={withLocale(locale, "/contact")} variant="dark">{copy.primaryCta}</ButtonLink>
            <ButtonLink href={withLocale(locale, "/about")} variant="ghost">
              {copy.secondaryCta}
            </ButtonLink>
          </ActionRow>
        </div>
      </Section>
    </main>
  );
}
