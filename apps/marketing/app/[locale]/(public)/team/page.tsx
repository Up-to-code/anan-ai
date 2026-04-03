import type { LucideIcon } from "lucide-react";
import { Briefcase, Code2, User } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink, PageHero, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
import { createPageMetadata } from "@/lib/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.team;
  return createPageMetadata(locale, "/team", seo.title, seo.description);
}

function TeamRoleCard(props: { icon: LucideIcon; title: string; subtitle: string; description: string }) {
  const Icon = props.icon;
  return (
    <div className="group space-y-8 border-2 border-slate-100 bg-white p-12 transition-all hover:border-blue-600 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-20 w-20 items-center justify-center bg-slate-50 transition-colors group-hover:bg-blue-600 dark:bg-slate-900">
        <Icon className="h-10 w-10 text-slate-300 group-hover:text-white dark:text-slate-500" />
      </div>
      <div className="space-y-4 text-right">
        <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-slate-100">{props.title}</h3>
        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{props.subtitle}</span>
        <p className="font-bold leading-relaxed text-slate-500 dark:text-slate-300">{props.description}</p>
      </div>
    </div>
  );
}

export default async function TeamPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const copy = {
    ar: {
      title: "الفريق الذي يبني",
      accent: "وضوحاً تجارياً وتقنياً",
      body: "يجمع فريق عنان بين فهم السوق العقاري، تصميم التشغيل، وبناء الأنظمة التقنية التي تجعل التنفيذ أسهل على الفرق.",
      roles: [
        {
          icon: User,
          title: "قيادة المنتج",
          subtitle: "اتجاه المنصة",
          description: "صياغة كيف يجب أن يرتبط المساعد ومساحة العمل والوثائق العامة بقصة تجارية واحدة واضحة.",
        },
        {
          icon: Code2,
          title: "القيادة التقنية",
          subtitle: "بنية قابلة للتوسع",
          description: "بناء الطبقة التقنية التي تجعل التكاملات والبيانات والأسطح التشغيلية تعمل كوحدة واحدة.",
        },
      ],
      join: "إذا كنت تحب تحويل الفوضى التجارية والتقنية إلى نظام واضح، يسعدنا التعرف عليك.",
      cta: "تحدث معنا",
    },
    en: {
      title: "The team building",
      accent: "commercial and technical clarity",
      body: "Anan brings together market understanding, operating design, and technical execution to build infrastructure real estate teams can actually use.",
      roles: [
        {
          icon: User,
          title: "Product leadership",
          subtitle: "Platform direction",
          description: "Defining how the assistant, workspace, and public surfaces should connect into one commercial story.",
        },
        {
          icon: Code2,
          title: "Technical leadership",
          subtitle: "Scalable systems",
          description: "Building the technical layer that keeps integrations, data, and operating surfaces working as one system.",
        },
      ],
      join: "If you enjoy turning commercial and technical mess into a usable system, we would love to hear from you.",
      cta: "Talk to us",
    },
    fr: {
      title: "L'equipe qui construit",
      accent: "la clarte commerciale et technique",
      body: "Anan rassemble la lecture du marche, le design operatoire et l'execution technique pour construire une infrastructure vraiment utile aux equipes immobilieres.",
      roles: [
        {
          icon: User,
          title: "Leadership produit",
          subtitle: "Direction plateforme",
          description: "Definir comment l'assistant, le workspace et les surfaces publiques s'unissent dans une seule histoire commerciale.",
        },
        {
          icon: Code2,
          title: "Leadership technique",
          subtitle: "Systemes extensibles",
          description: "Construire la couche technique qui relie integrations, donnees et surfaces operatoires dans un seul systeme.",
        },
      ],
      join: "Si vous aimez transformer le desordre commercial et technique en systeme utile, parlons-en.",
      cta: "Parler avec nous",
    },
  }[locale];

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="mx-auto max-w-4xl space-y-12 text-right"
          badge={
            <SectionLabel
              icon={Briefcase}
              className="inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-600/10 px-4 py-2"
              iconClassName="h-5 w-5 text-blue-600"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
            >
              {locale === "ar" ? "فريق عنان" : locale === "fr" ? "Equipe Anan" : "Anan team"}
            </SectionLabel>
          }
          title={<>{copy.title} <br /><span className="text-blue-600">{copy.accent}</span></>}
          titleClassName="text-6xl font-black uppercase text-slate-900 dark:text-slate-100"
          description={<p>{copy.body}</p>}
          descriptionClassName="max-w-2xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
        />
      </Section>

      <Section className="py-32">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-16 md:grid-cols-2">
          {copy.roles.map((role) => (
            <TeamRoleCard key={role.title} {...role} />
          ))}
        </div>
      </Section>

      <Section className="border-t border-slate-100 py-24 text-center dark:border-slate-800">
        <div className="mx-auto max-w-2xl space-y-8">
          <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">{copy.join}</p>
          <ButtonLink href={withLocale(locale, "/contact")} variant="primary">{copy.cta}</ButtonLink>
        </div>
      </Section>
    </main>
  );
}
