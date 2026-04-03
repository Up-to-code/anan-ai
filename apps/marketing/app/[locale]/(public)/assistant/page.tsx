import type { Metadata } from "next";
import { Bot, ChevronRight, Target, Workflow } from "lucide-react";
import {
  ActionRow,
  ButtonLink,
  FeatureCardGrid,
  PageHero,
  Section,
  SectionLabel,
} from "@/app/[locale]/(public)/public";
import { AiIntelligenceVisual, BuyerIntelligenceVisual } from "@/app/[locale]/(public)/LandingPage/LandingMotionVisuals";
import type { AppLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/site";
import { getMarketingContent } from "@/lib/marketing-content";
import { withLocale } from "@/lib/routes";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.assistant;
  return createPageMetadata(locale, "/assistant", seo.title, seo.description);
}

export default async function AssistantPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const copy = {
    ar: {
      eyebrow: "المساعد",
      title: "قناة اكتساب وتأهيل",
      accent: "تعمل على مدار الساعة",
      description:
        "مساعد عنان يساعدك من أول رسالة. يفهم ما يريده العميل ثم يرسله إلى الشخص أو المشروع المناسب.",
      sections: [
        {
          title: "المشكلة",
          body: "رسائل العملاء تأتي من أماكن كثيرة، وهذا يجعل المتابعة صعبة ويضيع بعض الفرص.",
        },
        {
          title: "ما الذي يغيّره عنان",
          body: "المساعد يجمع المعلومات المهمة داخل المحادثة نفسها، مثل الميزانية والمنطقة وما الذي يبحث عنه العميل.",
        },
        {
          title: "الأثر التجاري",
          body: "النتيجة أن الفريق يفهم العميل أسرع ويعرف ما هي الخطوة التالية بسهولة.",
        },
      ],
      cards: [
        { title: "فهم سريع", description: "تحويل الكلام إلى معلومات واضحة تساعد الفريق." },
        { title: "إرسال صحيح", description: "إرسال كل عميل إلى المكان أو الشخص المناسب." },
        { title: "صورة أوضح", description: "كل محادثة تساعد الفريق على فهم ما يطلبه الناس." },
      ],
      forWho: "مناسب لكل فريق يريد بداية أسهل وأوضح مع العميل.",
      primaryCta: "تواصل مع الفريق",
      secondaryCta: "اعرف المزيد عن الشركة",
    },
    en: {
      eyebrow: "Assistant",
      title: "An acquisition and qualification channel",
      accent: "that stays on",
      description:
        "The Anan Assistant helps from the first message. It understands what the customer wants and sends them to the right project or person.",
      sections: [
        {
          title: "The problem",
          body: "Customer messages come from many places, and that makes follow-up harder than it should be.",
        },
        {
          title: "What Anan changes",
          body: "The assistant collects the key details in the chat, like budget, area, and what the customer is looking for.",
        },
        {
          title: "Commercial impact",
          body: "That helps the team understand the customer faster and know the next step more easily.",
        },
      ],
      cards: [
        { title: "Fast understanding", description: "Turn a chat into clear information for the team." },
        { title: "Send to the right place", description: "Move each customer to the right project or person." },
        { title: "A clearer picture", description: "Each chat helps the team better understand what people want." },
      ],
      forWho: "Built for any team that wants a simpler and clearer start with the customer.",
      primaryCta: "Talk to the team",
      secondaryCta: "Learn about the company",
    },
    fr: {
      eyebrow: "Assistant",
      title: "Un canal d'acquisition et de qualification",
      accent: "toujours actif",
      description:
        "L'assistant Anan aide des le premier message. Il comprend ce que veut le client puis l'envoie vers le bon projet ou la bonne personne.",
      sections: [
        {
          title: "Le probleme",
          body: "Les messages clients arrivent de plusieurs endroits, et cela rend le suivi plus difficile qu'il ne devrait l'etre.",
        },
        {
          title: "Ce qu'Anan change",
          body: "L'assistant collecte les details utiles dans la conversation, comme le budget, la zone et ce que cherche le client.",
        },
        {
          title: "Impact commercial",
          body: "Le resultat: l'equipe comprend le client plus vite et voit plus facilement la prochaine etape.",
        },
      ],
      cards: [
        { title: "Comprendre vite", description: "Transformer un chat en informations claires pour l'equipe." },
        { title: "Envoyer au bon endroit", description: "Diriger chaque client vers le bon projet ou la bonne personne." },
        { title: "Une image plus claire", description: "Chaque conversation aide l'equipe a mieux comprendre les besoins." },
      ],
      forWho: "Concu pour toute equipe qui veut un debut plus simple et plus clair avec le client.",
      primaryCta: "Parler a l'equipe",
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
              icon={Bot}
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
          visual={<AiIntelligenceVisual />}
        />
      </Section>

      <Section className="py-28">
        <FeatureCardGrid
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
          items={copy.cards}
        />
      </Section>

      <Section bg="dark">
        <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
          <BuyerIntelligenceVisual />
          <div className="space-y-10 text-right">
            <SectionLabel
              icon={Workflow}
              className="inline-flex items-center gap-3 border-r-4 border-blue-500 bg-blue-500/10 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-500"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-400"
            >
              {locale === "ar" ? "منطق العمل" : locale === "fr" ? "Logique produit" : "Product logic"}
            </SectionLabel>
            <div className="grid gap-8">
              {copy.sections.map((section) => (
                <div key={section.title} className="border border-slate-800 p-8">
                  <h2 className="text-2xl font-black text-white">{section.title}</h2>
                  <p className="mt-4 text-base font-bold leading-8 text-slate-400">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="py-28">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <SectionLabel
            icon={Target}
            className="mx-auto inline-flex items-center gap-3 border-r-4 border-slate-900 bg-slate-100 px-4 py-2"
            iconClassName="h-5 w-5 text-slate-900"
            textClassName="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100"
          >
            {locale === "ar" ? "لمن صُمم" : locale === "fr" ? "Pour qui" : "Who it is for"}
          </SectionLabel>
          <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
            {copy.forWho}
          </p>
          <ActionRow className="flex flex-col justify-center gap-6 pt-6 sm:flex-row">
            <ButtonLink href={withLocale(locale, "/contact")} variant="dark">{copy.primaryCta}</ButtonLink>
            <ButtonLink href={withLocale(locale, "/about")} variant="ghost">
              {copy.secondaryCta} <ChevronRight className="h-4 w-4" />
            </ButtonLink>
          </ActionRow>
        </div>
      </Section>
    </main>
  );
}
