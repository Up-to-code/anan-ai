import type { Metadata } from "next";
import { LegalArticle, PageHero, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/site";

const TERMS_ARTICLES = [
  {
    title: "١. الأهلية القانونية",
    content:
      "تستخدم هذه المنصة من قبل الجهات أو المستخدمين المصرح لهم بالوصول إلى الصفحات العامة أو مساحات العمل وفق الصلاحيات الممنوحة لهم من عنان أو من الجهة التي يتبعون لها.",
  },
  {
    title: "٢. دقة المعلومات",
    content:
      "يلتزم المستخدم بتقديم معلومات صحيحة ومحدثة عند استخدام المنصة أو عند التواصل مع الفريق. كما يلتزم بعدم إدخال بيانات مضللة أو محتوى غير مصرح به داخل مساحة العمل.",
  },
  {
    title: "٣. الرسوم والخدمات",
    content:
      "قد تخضع بعض الخدمات أو مساحات العمل لرسوم اشتراك أو شروط تجارية مستقلة يتم الاتفاق عليها بشكل منفصل. لا تعد هذه الصفحة بحد ذاتها عرضاً نهائياً لأي أسعار أو خدمات مدفوعة.",
  },
  {
    title: "٤. حدود المسؤولية",
    content:
      "تقدم عنان المنصة كما هي بالحدود المتاحة تشغيلياً. يبقى المستخدم مسؤولاً عن قراراته التشغيلية وعن صحة ما يضيفه أو يعتمد عليه داخل مساحة العمل، وذلك في حدود ما يسمح به القانون.",
  },
] as const;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.terms;
  return createPageMetadata(locale, "/terms", seo.title, seo.description);
}

export default async function TermsPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const copy = locale === "ar"
    ? { updated: "٧ مارس ٢٠٢٥", title: "اتفاقية الاستخدام", accent: "لمنصة عنان" }
    : locale === "fr"
      ? { updated: "7 mars 2025", title: "Conditions d'utilisation", accent: "de la plateforme Anan" }
      : { updated: "March 7, 2025", title: "Terms of Use", accent: "for Anan platform" };
  return (
    <main>
      <Section bg="slate" className="pt-40">
        <PageHero
          contentClassName="max-w-4xl mx-auto space-y-8"
          badge={<SectionLabel className="inline-flex" textClassName="text-xs font-black uppercase tracking-widest text-blue-600">{locale === "ar" ? "تحديث" : locale === "fr" ? "Mise a jour" : "Updated"}: {copy.updated}</SectionLabel>}
          title={<>{copy.title} <br /><span className="text-blue-600 text-3xl">{copy.accent}</span></>}
          titleClassName="text-6xl font-black text-slate-900 uppercase leading-tight"
        />
      </Section>
      <Section className="py-24">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16 text-slate-700 font-bold leading-relaxed">
            {TERMS_ARTICLES.map((article) => (
              <LegalArticle key={article.title} className="space-y-6" titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6 uppercase" title={article.title}>
                <p>{article.content}</p>
              </LegalArticle>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
