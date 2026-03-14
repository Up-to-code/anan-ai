"use client";

import LegalArticle from "@/components/shared/LegalArticle";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

export default function PolicyPage() {
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
                    title={<>سياسة الخصوصية <br /><span className="text-blue-600 text-3xl">وحماية البيانات العقارية</span></>}
                    titleClassName="text-6xl font-black text-slate-900 uppercase leading-tight"
                />
            </Section>

            <Section className="py-24">
                <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
                    <div className="space-y-16 text-slate-700 font-bold leading-relaxed">
                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="١. الامتثال لنظام حماية البيانات الشخصية KSA"
                        >
                            <p>
                                تلتزم منصة عنان (المشار إليها بـ &quot;النظام&quot;) بأعلى معايير الأمن السيبراني ونظام حماية البيانات الشخصية الصادر في المملكة العربية السعودية. يتم التعامل مع جميع البيانات المرفوعة من قبل المطورين والوسطاء بمعايير تشفير مؤسسية.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٢. البيانات التي نجمعها"
                        >
                            <ul className="list-square space-y-4 pr-6">
                                <li>بيانات الاعتماد المؤسسي (السجل التجاري، رخصة الهيئة العامة للعقار).</li>
                                <li>بيانات المشاريع العقارية والوحدات المتاحة.</li>
                                <li>إحصاءات الطلب والبحث المدخلة من قبل مستخدمي المحادثة الذكية.</li>
                            </ul>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٣. مشاركة البيانات"
                        >
                            <p>
                                لا يتم بيع البيانات لأطراف ثالثة. يتم استخدام البيانات فقط لتحسين محرك الربط بين العرض والطلب العقاري داخل حدود المملكة العربية السعودية.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٥. مدة الاحتفاظ بالبيانات"
                        >
                            <p>
                                نحتفظ بالبيانات العقارية والاقتصادية للمدة اللازمة لتحقيق الأغراض الموضحة في هذه السياسة، أو وفقاً لمتطلبات القوانين والأنظمة السعودية ذات الصلة بالأرشفة وحفظ السجلات التجارية.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٦. التدابير الأمنية"
                        >
                            <p>
                                نطبق بروتوكولات أمنية صارمة تشمل جدران الحماية المتقدمة، وأنظمة كشف الاختراق، والتشفير الشامل عند النقل والتخزين، لضمان أعلى مستويات الحماية للبنية التحتية العقارية.
                            </p>
                        </LegalArticle>

                        <LegalArticle
                            className="space-y-6"
                            titleClassName="text-3xl font-black text-slate-900 border-r-8 border-blue-600 pr-6"
                            title="٤. حقوق المستخدم"
                        >
                            <p>
                                يحق للمشترك (المطور أو الوسيط) طلب نسخة من بياناته المسجلة أو طلب حذفها نهائياً من سجلات البنية التحتية لعنان، مع مراعاة فترات الحفظ القانونية المطلوبة من الجهات التشريعية.
                            </p>
                        </LegalArticle>
                    </div>
                </div>
            </Section>
        </main>
    );
}
