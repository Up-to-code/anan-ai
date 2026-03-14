"use client";

import { Target, Shield, Users } from "lucide-react";
import FeatureCardGrid from "@/components/shared/FeatureCardGrid";
import MetricGrid from "@/components/shared/MetricGrid";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";

export default function AboutPage() {
    return (
        <main>
            <Section bg="slate" className="pt-40 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                    <img src="/vectors/landing/ecosystem_hub.svg" className="w-[800px] h-[800px]" alt="" />
                </div>
                <PageHero
                    className="relative z-10"
                    contentClassName="max-w-4xl mx-auto space-y-12 text-center"
                    title={<>عن عنان <br /><span className="text-blue-600">رؤية عقارية تقنية</span></>}
                    titleClassName="text-6xl font-black text-slate-900 uppercase"
                    description={
                        <div className="space-y-8 text-xl text-slate-500 font-bold leading-relaxed max-w-3xl mx-auto">
                            <p>
                                نحن نبني البنية التحتية الرقمية لمستقبل العقار في المملكة العربية السعودية، متمشين مع رؤية ٢٠٣٠ لتحويل القطاع إلى منظومة ذكية وشفافة.
                            </p>
                            <p className="text-lg opacity-80">
                                من الرياض، ننطلق لإعادة تعريف كيفية تفاعل المطورين والوسطاء والمستثمرين مع السوق. عنان ليست مجرد منصة، بل هي محرك سيادي يضمن تدفق البيانات العقارية بدقة متناهية وسرعة لم يسبق لها مثيل.
                            </p>
                        </div>
                    }
                />
            </Section>

            <Section className="py-32">
                <FeatureCardGrid
                    className="grid grid-cols-1 lg:grid-cols-3 gap-16"
                    items={[
                        {
                            icon: Target,
                            title: "مهمتنا",
                            description: "تمكين المطورين والوسطاء من خلال أدوات استخبارات سوقية تعتمد على الذكاء الاصطناعي والمحاكاة اللحظية للطلب.",
                        },
                        {
                            icon: Shield,
                            title: "قيمنا",
                            description: "الشفافية المطلقة، السرية المؤسسية، والامتثال الكامل للأنظمة التشريعية لالهيئة العامة للعقار.",
                        },
                        {
                            icon: Users,
                            title: "النظام البيئي",
                            description: "ربط جميع أطراف العملية العقارية في منصة واحدة تضمن كفاءة التنفيذ وسرعة الإغلاق.",
                        },
                    ]}
                />
            </Section>

            <Section bg="slate" className="py-32">
                <div className="max-w-3xl mx-auto space-y-12">
                    <h2 className="text-4xl font-black text-slate-900 uppercase underline decoration-blue-600 decoration-8 underline-offset-8">رؤية عام ٢٠٣٠</h2>
                    <div className="space-y-8 text-slate-500 font-bold leading-relaxed text-lg">
                        <p>
                            تساهم عنان في تسريع التحول الرقمي للقطاع العقاري السعودي من خلال أتمتة عمليات البحث والتمويل والتعاقد. نحن لا نوفر مجرد تطبيق، بل نبني بروتوكولاً للتعاملات الكبرى.
                        </p>
                        <p>
                            من خلال مكاتبنا في الرياض، نعمل جنباً إلى جنب مع شركائنا لضمان توفير تدفقات بيانات دقيقة تساعد في استقرار السوق ونموه.
                        </p>
                    </div>
                </div>
            </Section>

            <Section className="py-32 border-t border-slate-100">
                <MetricGrid
                    className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center"
                    itemClassName="space-y-2"
                    valueClassName="text-4xl font-black text-blue-600"
                    labelClassName="block text-[10px] font-black uppercase tracking-widest text-slate-400"
                    items={[
                        { value: "٢٠٣٠", label: "رؤية التحول" },
                        { value: "٩٩.٩٪", label: "دقة البيانات" },
                        { value: "٢٤/٧", label: "ذكاء تشغيلي" },
                        { value: "١٠٠٪", label: "امتثال سعودي" },
                    ]}
                />
            </Section>

            <Section bg="dark" className="py-40">
                <div className="max-w-4xl mx-auto space-y-16 text-right">
                    <h2 className="text-4xl font-black text-white uppercase border-r-4 border-blue-600 pr-8">الالتزام بالرؤية</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-slate-400 font-bold leading-relaxed">
                        <p>
                            نحن في عنان لسنا مجرد مزود للخدمات التقنية، نحن شريك استراتيجي في رحلة التحول الرقمي للقطاع العقاري. نؤمن بأن الشفافية هي مفتاح النمو، ولذلك نوفر أدوات تضمن وصول المعلومة الصحيحة في الوقت المناسب لكل طرف.
                        </p>
                        <p>
                            بحلول عام ٢٠٣٠، نهدف لأن تكون بنية عنان التحتية هي المعيار الذهبي لجميع عمليات الربط والتعاقد العقاري المؤسسي في المملكة العربية السعودية، مدعومة بأحدث ما توصل إليه العلم في مجال الذكاء الاصطناعي السيادي.
                        </p>
                    </div>
                </div>
            </Section>
        </main>
    );
}
