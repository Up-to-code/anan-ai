"use client";

import { Users2, Percent, Wallet, Zap } from "lucide-react";
import ActionRow from "@/components/shared/ActionRow";
import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import FeatureCardGrid from "@/components/shared/FeatureCardGrid";
import PageHero from "@/components/shared/PageHero";
import Section from "@/components/shared/Section";
import SectionLabel from "@/components/shared/SectionLabel";

export default function BrokerPage() {
    return (
        <main>
            <Section bg="slate">
                <PageHero
                    className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center"
                    contentClassName="space-y-12 text-right"
                    badge={
                        <SectionLabel
                            icon={Zap}
                            className="inline-flex items-center gap-3 bg-slate-900 px-4 py-2 border-r-4 border-blue-600"
                            iconClassName="h-5 w-5 text-blue-500"
                            textClassName="text-xs font-black uppercase tracking-widest text-white"
                        >
                            سوق تعاون الوسطاء - المملكة
                        </SectionLabel>
                    }
                    title={<>شارك العروض.. <br /><span className="text-blue-600">ضاعف صفقاتك في الرياض</span></>}
                    titleClassName="text-6xl font-black text-slate-900 leading-tight"
                    description={
                        <p>منصة الربط الموثوقة للوسطاء العقاريين المعتمدين في المملكة. اربط احتياجات عملائك بأفضل العروض المتاحة في السوق السعودي فوراً.</p>
                    }
                    descriptionClassName="text-xl text-slate-500 font-bold leading-relaxed max-w-xl"
                    actions={
                        <ActionRow className="flex flex-col sm:flex-row gap-8 pt-6">
                            <Button href="/signin" variant="dark">دخول لوحة التعاون</Button>
                            <Button variant="outline">عرض الشروط والأحكام</Button>
                        </ActionRow>
                    }
                    visual={
                        <div className="relative border-2 border-slate-100 p-8 bg-white uppercase">
                            <div className="bg-slate-50 border-2 border-slate-100 p-10 space-y-10">
                                <div className="flex items-center justify-between bg-white p-8 border-b-2 border-blue-600">
                                    <div className="flex items-center gap-6">
                                        <div className="h-12 w-12 bg-slate-100 flex items-center justify-center">
                                            <Users2 className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 leading-none">Broker RIYADH</span>
                                            <span className="block text-[10px] text-slate-400 mt-2 uppercase tracking-tight">Demand: Luxury Villa</span>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-600 flex items-center justify-center font-black text-white text-[10px]">
                                        KSA
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="h-12 w-12 bg-slate-100 flex items-center justify-center">
                                            <Users2 className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-black text-slate-900 leading-none">Broker JEDDAH</span>
                                            <span className="block text-[10px] text-slate-400 mt-2 uppercase tracking-tight">Offer: Available</span>
                                        </div>
                                    </div>
                                </div>
                                <Card
                                    title="الربط الفوري نشط"
                                    description="يتم الآن مطابقة العروض والطلبات في شبكة المملكة."
                                    variant="accent"
                                />
                            </div>
                        </div>
                    }
                />
            </Section>

            <Section className="space-y-40">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center text-right">
                    <div className="space-y-10">
                        <div className="h-16 w-16 bg-blue-600/10 flex items-center justify-center mr-auto ml-0">
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 leading-tight uppercase">محرك المطابقة السعودي</h2>
                        <p className="text-xl text-slate-500 font-bold leading-relaxed">
                            خوارزميات متجذرة في الذكاء الاصطناعي تقوم بتحليل طلباتك ومقارنتها فوراً بآلاف العروض المتاحة في السوق السعودي، لتوصلك بالشريك المناسب في ثوانٍ.
                        </p>
                        <Button variant="ghost">كيف يعمل النظام الموحد؟</Button>
                    </div>
                    <FeatureCardGrid
                        className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                        items={[
                            {
                                icon: Percent,
                                title: "عمولة مضمونة",
                                description: "نظام تقني يضمن حقوق جميع الأطراف في الصفقات المشتركة داخل المملكة.",
                            },
                            {
                                icon: Wallet,
                                title: "مشاريع حصرية",
                                description: "وصول مباشر لمشاريع كبار المطورين في الرياض وجدة غير المتاحة للعامة.",
                            },
                        ]}
                    />
                </div>
            </Section>

            <Section bg="slate" className="py-40 border-y border-slate-100">
                <div className="max-w-4xl mx-auto space-y-24 text-right">
                    <div className="space-y-6">
                        <SectionLabel
                            className="inline-flex"
                            textClassName="text-xs font-black text-blue-600 uppercase tracking-widest"
                        >
                            الثقة والالتزام
                        </SectionLabel>
                        <h2 className="text-4xl font-black text-slate-900 uppercase leading-snug">شبكة الوسطاء <br /> الموثقين في المملكة</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-right">
                        <div className="p-10 border-2 border-slate-100 space-y-6 bg-white">
                            <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center font-black text-xl">01</div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">توثيق الهوية العقارية</h3>
                            <p className="font-bold text-slate-500 leading-relaxed">لا يسمح بدخول النظام إلا للوسطاء المسجلين والمرخصين رسمياً، لضمان بيئة عمل احترافية وآمنة.</p>
                        </div>
                        <div className="p-10 border-2 border-slate-100 space-y-6 bg-white">
                            <div className="h-12 w-12 bg-blue-600 text-white flex items-center justify-center font-black text-xl">02</div>
                            <h3 className="text-xl font-black text-slate-900 uppercase">نظام السمعة التقني</h3>
                            <p className="font-bold text-slate-500 leading-relaxed">تقوم المنظومة بتقييم أداء الربط وسرعة الاستجابة لضمان جودة التعاملات داخل الشبكة.</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section bg="primary" className="py-48 text-center overflow-hidden relative border-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                {/* Gateway SVG background */}
                <div className="absolute -right-20 bottom-0 opacity-10 pointer-events-none">
                    <img src="/vectors/landing/portal_gateway.svg" className="w-[400px] h-[400px]" alt="" />
                </div>

                <div className="max-w-4xl mx-auto space-y-12 relative z-10 text-white">
                    <h2 className="text-6xl font-black uppercase leading-tight">انضم إلى مجتمع <br /> الوسطاء الأذكى</h2>
                    <p className="text-xl font-bold opacity-80 max-w-xl mx-auto leading-relaxed">
                        كن جزءاً من البنية التحتية لعنان وابدأ في توسيع نطاق صفقاتك العقارية في جميع مدن المملكة.
                    </p>
                    <ActionRow className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
                        <Button href="/signin" variant="white" className="border-none shadow-none px-12 py-5">انضم للشبكة</Button>
                        <Button href="/terms" variant="outline" className="border-white text-white hover:bg-white/10 px-12 py-5">شروط الاستخدام</Button>
                    </ActionRow>
                </div>
            </Section>
        </main>
    );
}
