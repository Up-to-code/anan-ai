"use client";

import LegalArticle from "@/components/shared/LegalArticle";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

export default function TermsPage() {
    const lastUpdated = "٧ مارس ٢٠٢٥";

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
                            تحديث: {lastUpdated}
                        </SectionLabel>
                    }
                    title={<>اتفاقية الاستخدام <br /><span className="text-blue-600 text-3xl">واللوائح التنظيمية</span></>}
                    titleClassName="text-6xl font-black text-slate-900 uppercase leading-tight"
                />
            </Section>

            <Section className="py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-16 text-slate-700 font-bold leading-relaxed">
                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6 uppercase"
                            title="١. الأهلية القانونية"
                        >
                            <p>
                                هذا النظام مخصص للمؤسسات العقارية والوسطاء المرخصين من الهيئة العامة للعقار في المملكة العربية السعودية. يجب أن يكون لدى المستخدم سجل تجاري سارٍ ورخص عقارية معتمدة لاستخدام أدوات الربط والذكاء الاصطناعي.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6 uppercase"
                            title="٢. دقة المعلومات"
                        >
                            <p>
                                يتقيد المطورون والوسطاء برفع بيانات دقيقة وصحيحة للوحدات المتاحة. منصة عنان ليست طرفاً في التعاقد النهائي بل هي وسيط تقني يوفر الربط واحصائيات الطلب.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6 uppercase"
                            title="٣. الرسوم والخدمات"
                        >
                            <p>
                                يخضع استخدام البنية التحتية لعنان لاتفاقيات رسوم اشتراك أو عمولات ربط يتم تفصيلها في العقود المنفصلة مع كل جهة مؤسسية. يتم إصدار جميع الفواتير وفقاً لأنظمة هيئة الزكاة والضريبة والجمارك (ZATCA).
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6 uppercase"
                            title="٤. حدود المسؤولية"
                        >
                            <p>
                                منظومة عنان لا تضمن صحة الصكوك أو الحالة الإنشائية للعقارات المرفوعة، وتقع مسؤولية التحقق النهائي من أهلية الأطراف وصحة الأصول على عاتق مستخدم النظام وفقاً للأعراف والأنظمة العقارية المعمول بها.
                            </p>
                        </LegalArticle>
                    </div>
                </div>
            </Section>
        </main>
    );
}
