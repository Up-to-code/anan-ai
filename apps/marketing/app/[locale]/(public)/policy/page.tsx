import type { Metadata } from "next";
import { LegalArticle, PageHero, Section, SectionLabel } from "@/app/[locale]/(public)/public";
import { getMarketingContent } from "@/lib/marketing-content";
import type { AppLocale } from "@/lib/locale";
import { createPageMetadata } from "@/lib/site";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
  const seo = getMarketingContent(locale).seo.policy;
  return createPageMetadata(locale, "/policy", seo.title, seo.description);
}

/**
 * WHY:   Users and partners need a clear privacy policy aligned to the platform's public and workspace surfaces.
 * WHAT:  Renders the Privacy Policy as structured legal sections.
 * HOW:   Server-rendered static content for performance and accessibility.
 */
export default async function PolicyPage({ params }: PageProps) {
    const { locale: localeParam } = await params;
  const locale = localeParam as AppLocale;
    const copy = locale === "ar"
      ? { updated: "٧ مارس ٢٠٢٥", title: "سياسة الخصوصية", accent: "وحماية بيانات المنصة" }
      : locale === "fr"
        ? { updated: "7 mars 2025", title: "Politique de confidentialite", accent: "et protection des donnees" }
        : { updated: "March 7, 2025", title: "Privacy Policy", accent: "and platform data protection" };

    return (
        <main>
            <Section bg="slate" className="pt-40">
                <PageHero
                    contentClassName="max-w-4xl mx-auto space-y-8"
                    badge={
                        <SectionLabel
                            className="inline-flex"
                            textClassName="text-xs font-black uppercase tracking-widest text-blue-600"
                        >
                            {locale === "ar" ? "تحديث" : locale === "fr" ? "Mise a jour" : "Updated"}: {copy.updated}
                        </SectionLabel>
                    }
                    title={<>{copy.title} <br /><span className="text-blue-600 text-3xl">{copy.accent}</span></>}
                    titleClassName="text-6xl font-black text-slate-900 uppercase leading-tight"
                />
            </Section>

            <Section className="py-24">
                <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
                    <div className="space-y-16 text-slate-700 font-bold leading-relaxed">
                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="١. الالتزام بحماية البيانات"
                        >
                            <p>
                                تلتزم منصة عنان (المشار إليها بـ &quot;المنصة&quot;) بحماية البيانات الشخصية وبيانات الاستخدام المتعلقة بمساحات العمل والصفحات العامة. نتعامل مع البيانات وفق معايير أمنية وممارسات تشغيلية مناسبة لطبيعة الخدمة.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٢. البيانات التي نجمعها"
                        >
                            <ul className="list-square space-y-4 pr-6">
                                <li>بيانات الحساب والتواصل الأساسية للمطورين والوسطاء والجهات التي تتواصل معنا.</li>
                                <li>البيانات التي يضيفها المستخدم داخل مساحة العمل من أجل متابعة العمل أو تنظيم المحتوى.</li>
                                <li>بيانات تقنية وتشغيلية تساعدنا على تشغيل المنصة وتحسين الأداء وتجربة الاستخدام.</li>
                            </ul>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٣. مشاركة البيانات"
                        >
                            <p>
                                لا نقوم ببيع البيانات الشخصية. قد تتم مشاركة البيانات بالقدر اللازم لتشغيل الخدمة، دعم المستخدمين، أو الالتزام بالمتطلبات القانونية والتنظيمية المعمول بها.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٥. مدة الاحتفاظ بالبيانات"
                        >
                            <p>
                                نحتفظ بالبيانات للمدة اللازمة لتشغيل المنصة، تحسينها، أو الوفاء بالالتزامات القانونية والتنظيمية ذات الصلة، ثم نراجع الحاجة لاستمرار الاحتفاظ بها.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٦. التدابير الأمنية"
                        >
                            <p>
                                نطبق ضوابط فنية وتنظيمية مناسبة تشمل التحكم في الوصول، وسائل الحماية أثناء النقل والتخزين، ومراجعة الاستخدام للوصول إلى مستوى ملائم من الأمان.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٤. حقوق المستخدم"
                        >
                            <p>
                                يحق للمستخدم طلب الوصول إلى بياناته أو تحديثها أو طلب حذفها وفق ما تسمح به القوانين والالتزامات التشغيلية المعمول بها داخل المنصة.
                            </p>
                        </LegalArticle>
                    </div>
                </div>
            </Section>
        </main>
    );
}
