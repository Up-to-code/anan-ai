"use client";

import { Zap, Shield, Globe, Cpu } from "lucide-react";
import FeatureCardGrid from "@/components/shared/FeatureCardGrid";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

export default function ThemePage() {
    return (
        <main>
            <Section bg="slate" className="pt-40">
                <PageHero
                    contentClassName="max-w-4xl mx-auto space-y-12 text-center text-right"
                    badge={
                        <SectionLabel
                            icon={Zap}
                            className="inline-flex items-center gap-3 bg-blue-600/10 px-4 py-2 border-r-4 border-blue-600"
                            iconClassName="h-5 w-5 text-blue-600"
                            textClassName="text-xs font-black uppercase tracking-widest text-blue-900"
                        >
                            فلسفة عنان - البنية التحتية
                        </SectionLabel>
                    }
                    title={<>عن النهج <br /><span className="text-blue-600">المؤسسي والتقني</span></>}
                    titleClassName="text-6xl font-black text-slate-900 uppercase"
                    description={<p>نحن نؤمن بأن العقار ليس مجرد وسيلة بيع وشراء، بل هو بنية تحتية رقمية تتطلب دقة هندسية وذكاءً اصطناعياً متكاملاً لخدمة اقتصاد المملكة.</p>}
                    descriptionClassName="text-xl text-slate-500 font-bold leading-relaxed"
                />
            </Section>

            <Section className="py-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="space-y-12 text-right">
                        <h2 className="text-4xl font-black text-slate-900 uppercase underline decoration-blue-600 decoration-8 underline-offset-8">دقة التصميم</h2>
                        <p className="text-lg text-slate-500 font-bold leading-relaxed">
                            تصميم عنان يتبع فلسفة الحد الأدنى (Minimalism) - لا وجود للظلال أو الحواف المستديرة. نحن نستخدم الزوايا الحادة لتعكس الصلابة المؤسسية والدقة الرياضية في معالجة البيانات.
                        </p>
                        <FeatureCardGrid
                            className="grid grid-cols-1 gap-8"
                            items={[
                                { icon: Shield, title: "أمن مؤسسي", description: "تشفير كامل للبيانات وفقاً لمعايير الأمن السيبراني السعودية." },
                                { icon: Cpu, title: "ذكاء سيادي", description: "أنظمة ذكاء اصطناعي مطورة خصيصاً لتحليل السوق المحلي." },
                            ]}
                        />
                    </div>
                    <div className="relative border-2 border-slate-100 p-12 bg-slate-50 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rotate-45 transform translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10 space-y-8 uppercase font-black text-[10px] tracking-[0.2em] text-slate-300">
                            <div className="flex justify-between border-b border-slate-200 pb-4">
                                <span>Architectural Grid</span>
                                <span>0px Radius</span>
                            </div>
                            <div className="h-48 border-2 border-blue-600 flex items-center justify-center">
                                <Globe className="h-12 w-12 text-blue-600/20" />
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-4">
                                <span>Contrast Ratio: Max</span>
                                <span>Standard: Institutional</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <Section className="py-24 border-y border-slate-100">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                    <div className="space-y-6 text-right">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">01. الوحدات</span>
                        <p className="font-bold text-slate-600">تصميم برمجي يعتمد على الوحدات المستقلة والقابلة للتطوير المستقبلي دون انقطاع.</p>
                    </div>
                    <div className="space-y-6 text-right">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">02. التوازن</span>
                        <p className="font-bold text-slate-600">تحقيق التوازن المثالي بين كثافة البيانات وسهولة الاستخدام عبر واجهات محادثة ذكية.</p>
                    </div>
                    <div className="space-y-6 text-right">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">03. الهوية</span>
                        <p className="font-bold text-slate-600">لغة بصرية موحدة تعبر عن الهوية السعودية الحديثة والطموحة في المجال التقني المؤسسي.</p>
                    </div>
                </div>
            </Section>

            <Section bg="slate" className="py-40">
                <div className="max-w-4xl mx-auto space-y-16 text-right">
                    <h2 className="text-4xl font-black text-slate-900 uppercase">القيم المؤسسية</h2>
                    <div className="grid grid-cols-1 gap-12">
                        {[
                            { t: "الجدية المطلقة", d: "كل بكسل في واجهتنا يخدم غرضاً وظيفياً ويدعم قراراً استثمارياً." },
                            { t: "الابتكار السيادي", d: "حلول تقنية نابعة من فهم عميق لخصوصية السوق السعودي وأنظمته." },
                            { t: "الثقة المتبادلة", d: "نبني جسوراً من الثقة الرقمية بين المطورين والوسطاء عبر بروتوكولات صارمة." }
                        ].map((v, i) => (
                            <div key={i} className="flex items-start gap-8 border-r-4 border-slate-200 pr-8 group hover:border-blue-600 transition-colors">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">{v.t}</h3>
                                    <p className="font-bold text-slate-500 leading-relaxed">{v.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
        </main>
    );
}
