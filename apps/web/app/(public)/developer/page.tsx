import { BarChart3, LayoutGrid, Globe, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import {
  ActionRow,
  ButtonLink,
  Card,
  FeatureCardGrid,
  PageHero,
  Section,
  SectionLabel,
} from "@/app/(public)/public";

export const metadata: Metadata = {
  title: "مساحة المطورين | عنان",
  description: "تعرف على مساحة المطورين في عنان: متابعة المشاريع، وضوح البيانات، والتعاون اليومي داخل مساحة عمل واحدة.",
};

/**
 * WHY:   Developers (RED) need a public entry page describing the data/analytics and distribution value.
 * WHAT:  Renders the developer-focused narrative plus CTAs into the sign-in and contact flows.
 * HOW:   Uses SSR-only presentational components to reduce client bundle size.
 */
export default function DeveloperPage() {
    return (
        <main>
            <Section bg="slate" className="pt-40 relative overflow-hidden">
                {/* Background SVG Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                            textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
                        >
                            مساحة المطورين
                        </SectionLabel>
                    }
                    title={<>مساحة تساعد <br /><span className="text-blue-600">فريق التطوير على المتابعة</span></>}
                    titleClassName="text-6xl font-black leading-tight text-slate-900 dark:text-slate-100"
                    description={
                        <p>
                            في هذه الصفحة نشرح كيف يستخدم المطورون عنان كمساحة عمل: تنظيم المشاريع، مراجعة البيانات، التنسيق مع الوسطاء، وفهم ما يحتاجه الفريق في مكان واحد.
                        </p>
                    }
                    descriptionClassName="max-w-xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300"
                    actions={
                        <ActionRow className="flex flex-col sm:flex-row gap-8 pt-6">
                            <ButtonLink href="/signin" variant="primary" className="px-12 py-5">دخول مساحة المطورين</ButtonLink>
                            <ButtonLink href="/contact" variant="outline" className="border-slate-200 px-12 py-5 dark:border-slate-700">تواصل مع الفريق</ButtonLink>
                        </ActionRow>
                    }
                    visual={
                        <div className="grid grid-cols-2 gap-8">
                            <Card title="نظرة سريعة" description="واجهة تعرف الفريق بما هو نشط وما الذي يحتاج متابعة." variant="accent" />
                            <Card title="بيانات المشروع" description="مراجعة أوضح للبيانات الأساسية داخل المساحة نفسها." />
                            <Card title="التنسيق مع الوسطاء" description="ربط أسهل بين ما ينشره المطور وما يحتاجه الوسيط." />
                            <Card title="سياق موحد" description="كل شيء يظهر ضمن تجربة واحدة بدلاً من أدوات متفرقة." variant="accent" />
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
                            title: "متابعة أوضح",
                            description: "عرض منظم لما يحتاج انتباه الفريق دون إغراق في واجهات أو تقارير مبالغ فيها.",
                        },
                        {
                            icon: Globe,
                            title: "رؤية مشتركة",
                            description: "المطورون والوسطاء يتحركون من نفس السياق، مما يقلل الالتباس ويقرب الخطوة التالية.",
                        },
                        {
                            icon: LayoutGrid,
                            title: "تنظيم يومي",
                            description: "مساحة العمل تعطي بنية أوضح للمهام، البيانات، وأجزاء المنتج التي يتعامل معها الفريق كل يوم.",
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
                            لماذا هذه المساحة
                        </SectionLabel>
                        <h2 className="text-4xl font-black text-white uppercase">المطور يحتاج <br /> وضوحاً قابلاً للاستخدام</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="p-10 border border-slate-800 space-y-6">
                            <ShieldCheck className="h-8 w-8 text-blue-500" />
                            <h3 className="text-xl font-black text-white uppercase">وضوح في البيانات</h3>
                            <p className="font-bold text-slate-400">كل ما يحتاجه الفريق يظهر بلغة أبسط ومسار أوضح داخل تجربة واحدة متماسكة.</p>
                        </div>
                        <div className="p-10 border border-slate-800 space-y-6">
                            <Globe className="h-8 w-8 text-blue-500" />
                            <h3 className="text-xl font-black text-white uppercase">تعاون أسهل</h3>
                            <p className="font-bold text-slate-400">المنصة تساعد الفريق على العمل مع الوسطاء من دون ضياع التفاصيل بين القنوات المختلفة.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section bg="primary" className="py-48 text-center overflow-hidden relative border-none">
                <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                    <h2 className="text-6xl font-black uppercase leading-tight text-white">ادخل إلى مساحة <br /> المطورين</h2>
                    <p className="text-xl font-bold opacity-80 max-w-xl mx-auto leading-relaxed text-white">
                        إذا كنت تريد بيئة أوضح لإدارة العمل والتنسيق، فهذه هي نقطة البداية المناسبة.
                    </p>
                    <ActionRow className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                        <ButtonLink href="/signin" variant="white" className="border-none">دخول المساحة</ButtonLink>
                        <ButtonLink href="/about" variant="outline" className="border-white text-white hover:bg-white/10">تعرف على الشركة</ButtonLink>
                    </ActionRow>
                </div>
            </Section>
        </main>
    );
}
