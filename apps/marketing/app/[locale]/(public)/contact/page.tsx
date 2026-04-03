import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ButtonLink, PageHero, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { withLocale } from "@/lib/routes";
import { createPageMetadata, getDocsUrl, getReferenceLinks } from "@/lib/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.contact;
  return createPageMetadata(locale, "/contact", seo.title, seo.description);
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const referenceLinks = getReferenceLinks();
  const docsUrl = getDocsUrl();
  const emailAddress = referenceLinks.contact.email;
  const phoneNumber = referenceLinks.contact.phone;
  const copy = {
    ar: {
      eyebrow: "تواصل مع عنان",
      title: "ابدأ محادثة حول",
      accent: "النمو العقاري الأوضح",
      description:
        "إذا كنت تريد فهم كيف يعمل المساعد أو مساحة العمل أو التكاملات العامة داخل شركتك العقارية، فهذه هي نقطة البداية المناسبة.",
      officeTitle: "نقطة التشغيل",
      officeBody: "نعمل مع الفرق والشركاء عبر مساحة العمل الرقمية وقنوات التواصل المباشر مع الفريق.",
      emailTitle: "البريد الإلكتروني",
      emailBody: "للاستفسارات العامة، العروض التعريفية، والشراكات.",
      phoneTitle: "الهاتف",
      phoneBody: "للمحادثات السريعة وترتيب عرض تعريفي مع الفريق.",
      cardTitle: "ابدأ من القناة المناسبة",
      cardBody:
        "هذه الواجهة مخصصة للتعريف بالشركة والمنتج. نقاط الدخول الفعلية واضحة: المساعد لتجربة القناة الذكية، ومساحة العمل للفرق التي تدير عملياتها داخل عنان.",
      workspaceCta: "اقرأ الوثائق",
      assistantCta: "اعرف المزيد عن عنان",
      emailCta: "أرسل بريداً للفريق",
      bottom: "إذا كنت تفكر في تطبيق عنان داخل شركتك، يمكننا البدء بمكالمة تعريفية ثم توجيهك إلى المسار المناسب.",
    },
    en: {
      eyebrow: "Contact Anan",
      title: "Start a conversation about",
      accent: "clearer real estate growth",
      description:
        "If you want to understand how the assistant, workspace, or public integrations can fit your real estate business, this is the right starting point.",
      officeTitle: "Operating point",
      officeBody: "We work with teams and partners through the digital workspace and direct channels with the Anan team.",
      emailTitle: "Email",
      emailBody: "For general inquiries, product introductions, and partnership conversations.",
      phoneTitle: "Phone",
      phoneBody: "For quick conversations and scheduling an introduction with the team.",
      cardTitle: "Use the right channel",
      cardBody:
        "This public surface is for the company and the product story. The live entry points are clear: the assistant for the AI experience, and the workspace for teams already operating inside Anan.",
      workspaceCta: "Read the docs",
      assistantCta: "Learn about Anan",
      emailCta: "Email the team",
      bottom: "If you are exploring Anan for your company, we can start with an intro call and guide you to the right operating path afterward.",
    },
    fr: {
      eyebrow: "Contacter Anan",
      title: "Lancez une conversation sur",
      accent: "une croissance immobiliere plus claire",
      description:
        "Si vous voulez comprendre comment l'assistant, le workspace ou les integrations publiques s'integrent dans votre entreprise immobiliere, c'est le bon point de depart.",
      officeTitle: "Point operatoire",
      officeBody: "Nous travaillons avec equipes et partenaires via le workspace digital et les canaux directs avec l'equipe Anan.",
      emailTitle: "Email",
      emailBody: "Pour les demandes generales, les presentations produit et les partenariats.",
      phoneTitle: "Telephone",
      phoneBody: "Pour une conversation rapide et l'organisation d'une presentation avec l'equipe.",
      cardTitle: "Choisissez le bon canal",
      cardBody:
        "Cette surface publique presente l'entreprise et le produit. Les vrais points d'entree sont clairs: l'assistant pour l'experience IA et le workspace pour les equipes deja actives dans Anan.",
      workspaceCta: "Lire les docs",
      assistantCta: "Decouvrir Anan",
      emailCta: "Envoyer un email",
      bottom: "Si vous etudiez Anan pour votre entreprise, nous pouvons commencer par un appel d'introduction puis vous guider vers le bon parcours.",
    },
  }[locale];

  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="mx-auto max-w-4xl space-y-8 text-center"
          badge={
            <SectionLabel
              className="inline-flex"
              textClassName="text-xs font-black uppercase tracking-widest text-blue-600"
            >
              {copy.eyebrow}
            </SectionLabel>
          }
          title={<>{copy.title} <br /><span className="text-blue-600 text-3xl">{copy.accent}</span></>}
          titleClassName="text-6xl font-black uppercase leading-tight text-slate-900 dark:text-slate-100"
          description={<p className="mx-auto max-w-2xl">{copy.description}</p>}
          descriptionClassName="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
        />
      </Section>

      <Section className="py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-24 lg:grid-cols-2">
          <div className="space-y-12">
            <h2 className="border-r-8 border-blue-600 pr-6 text-3xl font-black uppercase text-slate-900 dark:text-slate-100">
              {locale === "ar" ? "تفاصيل التواصل" : locale === "fr" ? "Coordonnees" : "Contact details"}
            </h2>
            <div className="space-y-8 font-bold text-slate-700 dark:text-slate-200">
              <div className="flex items-start gap-6 border-b border-slate-100 pb-8 dark:border-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">{copy.officeTitle}</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">{copy.officeBody}</p>
                </div>
              </div>
              <div className="flex items-start gap-6 border-b border-slate-100 pb-8 dark:border-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">{copy.emailTitle}</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">{copy.emailBody}</p>
                  <a href={`mailto:${emailAddress}`} className="mt-1 block text-blue-600 hover:underline">{emailAddress}</a>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 dark:text-slate-100">{copy.phoneTitle}</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-300">{copy.phoneBody}</p>
                  <a href={`tel:${phoneNumber}`} className="mt-1 block text-right text-blue-600 hover:underline" dir="ltr">{phoneNumber}</a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-slate-100 bg-slate-50 p-12 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="mb-8 text-2xl font-black uppercase text-slate-900 dark:text-slate-100">{copy.cardTitle}</h2>
            <div className="space-y-6 text-right">
              <p className="text-base font-bold leading-8 text-slate-500 dark:text-slate-300">{copy.cardBody}</p>
              <div className="grid gap-4">
                <ButtonLink href={docsUrl} variant="primary" className="w-full justify-center py-4">{copy.workspaceCta}</ButtonLink>
                <ButtonLink href={withLocale(locale, "/about")} variant="outline" className="w-full justify-center px-8 py-4">{copy.assistantCta}</ButtonLink>
                <ButtonLink href={`mailto:${emailAddress}`} variant="ghost" className="w-full justify-center border border-slate-200 px-8 py-4 dark:border-slate-700">
                  {copy.emailCta}
                </ButtonLink>
              </div>
              <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
                <p className="text-sm font-bold leading-7 text-slate-500 dark:text-slate-300">{copy.bottom}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
