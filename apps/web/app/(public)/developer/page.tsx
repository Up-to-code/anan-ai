"use client";

import { BarChart3, LayoutGrid, Globe, ShieldCheck } from "lucide-react";
import ActionRow from "@/components/shared/ActionRow";
import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import FeatureCardGrid from "@/components/shared/FeatureCardGrid";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

export default function DeveloperPage() {
    return (
        <main>
            <Section bg="slate" className="pt-40 relative overflow-hidden">
                {/* Background SVG Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img src="/vectors/landing/hero_grid.svg" className="w-full h-full object-cover" alt="" />
                </div>
                <PageHero
                    className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10"
                    contentClassName="space-y-12 text-right"
                    badge={
                        <SectionLabel
                            icon={ShieldCheck}
                            className="inline-flex items-center gap-3 bg-blue-600/10 px-4 py-2 border-r-4 border-blue-600"
                            iconClassName="h-5 w-5 text-blue-600"
                            textClassName="text-xs font-black uppercase tracking-widest text-blue-900"
                        >
                            بوابة المطورين - المملكة العربية السعودية
                        </SectionLabel>
                    }
                    title={<>استخبارات <br /><span className="text-blue-600">السوق المؤسسي السعودي</span></>}
                    titleClassName="text-6xl font-black text-slate-900 leading-tight"
                    description={
                        <p>
                            قم بتوزيع مشاريعك عبر البنية التحتية لعنان. احصل على بيانات حية، مؤشرات الطلب في الرياض وجدة، والتحليلات السلوكية للمشترين في الوقت الفعلي.
                        </p>
                    }
                    descriptionClassName="text-xl text-slate-500 font-bold leading-relaxed max-w-xl"
                    actions={
                        <ActionRow className="flex flex-col sm:flex-row gap-8 pt-6">
                            <Button href="/signin" variant="primary" className="px-12 py-5">تسجيل مشروع جديد</Button>
                            <Button variant="outline" className="px-12 py-5 border-slate-200">طلب البيانات التاريخية</Button>
                        </ActionRow>
                    }
                    visual={
                        <div className="grid grid-cols-2 gap-8">
                            <Card title="مؤشر الطلب لعام ٢٠٢٥" description="٩٨.٤ (+٢.٤٪) - نمو قوي في القطاع السكني." variant="accent" />
                            <Card title="متوسط أسعار الصفقات" description="٤.٥M ريال - بناءً على بيانات السوق الحالية." />
                            <Card title="المشاريع النشطة" description="١,٢٤٠ مشروع مسجل في البنية التحتية." />
                            <Card title="نسبة التحويل" description="١٢.٥٪ - فعالية عالية في ربط الوسطاء بالوحدات." variant="accent" />
                        </div>
                    }
                />
            </Section>

            <Section className="py-32">
                <FeatureCardGrid
                    className="grid grid-cols-1 lg:grid-cols-3 gap-16 text-right"
                    items={[
                        {
                            icon: BarChart3,
                            title: "التوزيع الفوري عبر AI",
                            description: "بمجرد رفع بيانات المشروع، تقوم منظومة عنان بربط الوحدات مع الطلبات النشطة للوسطاء والمستثمرين في المملكة فوراً.",
                        },
                        {
                            icon: Globe,
                            title: "خرائط الطلب اللحظية",
                            description: "شاهد أين يتركز اهتمام المستثمرين الآن في الرياض وجدة ومناطق النمو الكبرى في المملكة.",
                        },
                        {
                            icon: LayoutGrid,
                            title: "تحليلات السعر العادل",
                            description: "احصل على توصيات تسعير تعتمد على التوازن بين العرض والطلب الحقيقي المتوقع في السوق السعودي.",
                        },
                    ]}
                />
            </Section>

            <Section bg="dark" className="py-40">
                <div className="max-w-4xl mx-auto space-y-24 text-right">
                    <div className="space-y-6">
                        <SectionLabel
                            className="inline-flex"
                            textClassName="text-xs font-black text-blue-500 uppercase tracking-widest"
                        >
                            التكامل المؤسسي
                        </SectionLabel>
                        <h2 className="text-4xl font-black text-white uppercase">متوافق مع الأنظمة <br /> واللوائح السعودية</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="p-10 border border-slate-800 space-y-6">
                            <ShieldCheck className="h-8 w-8 text-blue-500" />
                            <h3 className="text-xl font-black text-white uppercase">رخص الهيئة العامة للعقار</h3>
                            <p className="font-bold text-slate-400">نظامنا مهيأ للربط المباشر مع منصات الهيئة لضمان موثوقية المعلومة وحماية الأصول.</p>
                        </div>
                        <div className="p-10 border border-slate-800 space-y-6">
                            <Globe className="h-8 w-8 text-blue-500" />
                            <h3 className="text-xl font-black text-white uppercase">الفواتير الإلكترونية ZATCA</h3>
                            <p className="font-bold text-slate-400">تكامل آلي مع أنظمة هيئة الزكاة والضريبة والجمارك لضمان سلاسة العمليات المالية.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section bg="primary" className="py-48 text-center overflow-hidden relative border-none">
                <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <h2 className="text-6xl font-black uppercase leading-tight text-white">ابدأ رحلة التحول <br /> الرقمي لمشاريعك</h2>
                    <p className="text-xl font-bold opacity-80 max-w-xl mx-auto leading-relaxed text-white">
                        ارفع مشاريعك العقارية في بنية عنان التحتية اليوم وابدأ في رؤية نتائج الربط الفوري.
                    </p>
                    <ActionRow className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                        <Button href="/signin" variant="white" className="border-none">تسجيل كمطور</Button>
                        <Button href="/about" variant="outline" className="border-white text-white hover:bg-white/10">تواصل مع الخبراء</Button>
                    </ActionRow>
                </div>
            </Section>
        </main>
    );
}
