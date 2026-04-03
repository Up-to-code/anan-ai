import type { Metadata } from "next";
import { ButtonLink, FeatureCardGrid, PageHero, Section } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
import { createPageMetadata } from "@/lib/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.investor;
  return createPageMetadata(locale, "/investor", seo.title, seo.description);
}

export default async function InvestorPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const copy = locale === "ar"
    ? {
        title: "فرصة بنية تحتية",
        accent: "في سوق عقاري يتغير بسرعة",
        body: "نرى في عنان فرصة لبناء طبقة تشغيل تجمع الذكاء، التوزيع، والعمليات التجارية داخل سوق يحتاج إلى وضوح أعلى وربط أقوى بين القنوات.",
        cards: [
          { title: "قنوات متعددة", description: "الطلب يبدأ في المحادثة لكنه يحتاج إلى نظام يحمله حتى التنفيذ." },
          { title: "بيانات تشغيلية", description: "كل تفاعل يمكن أن يتحول إلى ذكاء يساعد الفرق على اتخاذ قرار أفضل." },
          { title: "قابلية توسع", description: "عندما تكون البنية موحّدة، يصبح توسيع المنتجات والقنوات أسرع وأقل تكلفة." },
        ],
      }
    : locale === "fr"
      ? {
          title: "Une opportunite d'infrastructure",
          accent: "dans un marche qui evolue vite",
          body: "Anan voit une opportunite de construire une couche operatoire reliant IA, distribution et execution commerciale dans un marche immobilier qui a besoin de plus de clarte.",
          cards: [
            { title: "Canaux multiples", description: "La demande commence dans la conversation mais doit etre transportee jusqu'a l'execution." },
            { title: "Donnees operatoires", description: "Chaque interaction peut devenir une intelligence utile a la decision." },
            { title: "Scalabilite", description: "Quand la couche est unifiee, etendre produits et canaux devient plus rapide." },
          ],
        }
      : {
          title: "An infrastructure opportunity",
          accent: "inside a fast-changing market",
          body: "Anan sees an opportunity to build the operating layer that connects AI, distribution, and commercial execution inside a real estate market that needs more clarity.",
          cards: [
            { title: "Multi-channel demand", description: "Interest starts in conversation but needs a system that carries it into execution." },
            { title: "Operational data", description: "Every interaction can become intelligence that improves the next decision." },
            { title: "Scalability", description: "When the layer is unified, expanding products and channels becomes faster and cheaper." },
          ],
        };

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="mx-auto max-w-4xl space-y-8 text-center"
          title={<>{copy.title} <br /><span className="text-blue-600">{copy.accent}</span></>}
          titleClassName="text-6xl font-black leading-tight text-slate-900 dark:text-slate-100"
          description={<p className="mx-auto max-w-2xl">{copy.body}</p>}
          descriptionClassName="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
        />
      </Section>
      <Section className="py-24">
        <FeatureCardGrid className="grid grid-cols-1 gap-8 lg:grid-cols-3" items={copy.cards} />
        <div className="pt-12 text-center">
          <ButtonLink href={withLocale(locale, "/contact")} variant="primary">
            {locale === "ar" ? "تواصل مع الفريق" : locale === "fr" ? "Contacter l'equipe" : "Talk to the team"}
          </ButtonLink>
        </div>
      </Section>
    </main>
  );
}
