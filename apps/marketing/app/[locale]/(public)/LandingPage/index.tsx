import type { AppLocale } from "@/lib/locale";
import { ActionRow, ButtonLink, Card, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { createOrganizationStructuredData, getDocsUrl } from "@/lib/site";
import { withLocale } from "@/lib/routes";

export default function LandingPage({ locale }: { locale: AppLocale }) {
  const docsUrl = getDocsUrl();
  const localized = {
    ar: {
      badge: "عنان",
      title: "صفحات بسيطة تشرح الشركة فقط",
      description:
        "هذه الصفحة للتعريف بعنان فقط. إذا أردت معرفة الشركة أو المساعد أو الوثائق، ستصل إلى الصفحة المناسبة بسرعة ومن دون واجهة إضافية.",
      primaryCta: "عن الشركة",
      secondaryCta: "المساعد",
      cards: [
        {
          title: "الشركة",
          description: "من نحن وماذا نقدم ولماذا بُنيت عنان.",
          href: "/about",
        },
        {
          title: "المساعد",
          description: "فهم سريع لطريقة عمل المساعد مع العملاء.",
          href: "/assistant",
        },
        {
          title: "الوثائق",
          description: "انتقل إلى الوثائق الخارجية مباشرة.",
          href: docsUrl,
        },
        {
          title: "المدونة",
          description: "مقالات وتعريفات ومحتوى تسويقي.",
          href: "/blog",
        },
        {
          title: "تواصل معنا",
          description: "للتواصل مع الفريق أو طلب عرض.",
          href: "/contact",
        },
        {
          title: "الخصوصية والشروط",
          description: "الصفحات القانونية الأساسية.",
          href: "/policy",
        },
      ],
    },
    en: {
      badge: "Anan",
      title: "Simple pages that explain the company only",
      description:
        "This homepage is only for the company story. If someone wants the company, assistant, or docs, they can move to the right page quickly without extra UI.",
      primaryCta: "About the company",
      secondaryCta: "Assistant",
      cards: [
        {
          title: "Company",
          description: "Who we are, what we do, and why Anan exists.",
          href: "/about",
        },
        {
          title: "Assistant",
          description: "A clear explanation of how the assistant helps customers.",
          href: "/assistant",
        },
        {
          title: "Docs",
          description: "Go straight to the external docs.",
          href: docsUrl,
        },
        {
          title: "Blog",
          description: "Articles, updates, and marketing content.",
          href: "/blog",
        },
        {
          title: "Contact",
          description: "Talk to the team or request an intro.",
          href: "/contact",
        },
        {
          title: "Privacy and terms",
          description: "Core legal pages.",
          href: "/policy",
        },
      ],
    },
    fr: {
      badge: "Anan",
      title: "Des pages simples qui expliquent seulement l'entreprise",
      description:
        "Cette page d'accueil sert seulement a presenter l'entreprise. Pour l'assistant, la societe ou les docs, il y a un chemin direct sans interface en plus.",
      primaryCta: "A propos",
      secondaryCta: "Assistant",
      cards: [
        {
          title: "Entreprise",
          description: "Qui nous sommes, ce que nous faisons, et pourquoi Anan existe.",
          href: "/about",
        },
        {
          title: "Assistant",
          description: "Une explication simple de l'assistant.",
          href: "/assistant",
        },
        {
          title: "Docs",
          description: "Aller directement vers les docs externes.",
          href: docsUrl,
        },
        {
          title: "Blog",
          description: "Articles, mises a jour et contenu marketing.",
          href: "/blog",
        },
        {
          title: "Contact",
          description: "Parler a l'equipe ou demander une presentation.",
          href: "/contact",
        },
        {
          title: "Confidentialite et conditions",
          description: "Pages legales principales.",
          href: "/policy",
        },
      ],
    },
  }[locale];

  const structuredData = createOrganizationStructuredData(locale);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Section bg="white" className="pt-32 md:pt-36" border>
        <div className="mx-auto max-w-4xl space-y-8 text-right">
          <SectionLabel
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800"
            textClassName="text-sm text-slate-600 dark:text-slate-300"
          >
            {localized.badge}
          </SectionLabel>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-slate-950 dark:text-slate-50 md:text-5xl">
              {localized.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {localized.description}
            </p>
          </div>
          <ActionRow className="flex flex-col gap-4 sm:flex-row">
            <ButtonLink href={withLocale(locale, "/about")} variant="primary">
              {localized.primaryCta}
            </ButtonLink>
            <ButtonLink href={withLocale(locale, "/assistant")} variant="outline">
              {localized.secondaryCta}
            </ButtonLink>
          </ActionRow>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {localized.cards.map((card) => (
            <Card key={card.title} title={card.title} description={card.description}>
              <ButtonLink
                href={card.href.startsWith("/") ? withLocale(locale, card.href) : card.href}
                variant="ghost"
                className="px-0"
              >
                {locale === "ar" ? "افتح الصفحة" : locale === "fr" ? "Ouvrir la page" : "Open page"}
              </ButtonLink>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
