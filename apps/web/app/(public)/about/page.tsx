"use client";

import { motion } from "framer-motion";
import { Target, Shield, Users, ArrowRight } from "lucide-react";
import { ButtonLink, FeatureCardGrid, MetricGrid, Section } from "@/app/(public)/public";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const
        }
    }
};

/**
 * WHY:   Public marketing routes explain Anan’s mission and context for partners and users.
 * WHAT:  Renders the About page narrative with feature/value blocks and headline metrics.
 * HOW:   Uses framer-motion for premium entrance animations and refined layouts.
 */
export default function AboutPage() {
    return (
        <main className="overflow-x-hidden">
            <Section bg="none" className="pt-48 pb-32 relative overflow-hidden bg-white">
                {/* Dynamic Background Patterns */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] bg-blue-50/50 blur-[120px]" />
                    <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] bg-blue-50/50 blur-[120px]" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/vectors/landing/ecosystem_hub.svg"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-[0.03] animate-pulse"
                        alt=""
                    />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-12 text-center"
                    >
                        <motion.div variants={itemVariants} className="flex justify-center">
                            <span className="px-4 py-1.5 border border-blue-100 bg-blue-50 text-blue-600 text-sm font-black tracking-widest uppercase">
                                من نحن
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight"
                        >
                            عن عنان <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                                رؤية عقارية تقنية
                            </span>
                        </motion.h1>

                        <motion.div
                            variants={itemVariants}
                            className="space-y-8 text-xl md:text-2xl text-slate-500 font-bold leading-relaxed max-w-3xl mx-auto"
                        >
                            <p>
                                نحن نبني البنية التحتية الرقمية لمستقبل العقار في المملكة العربية السعودية، متمشين مع رؤية ٢٠٣٠ لتحويل القطاع إلى منظومة ذكية وشفافة.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-4">
                            <ButtonLink href="/contact" variant="primary" className="px-10 py-5 text-lg">
                                تواصل معنا <ArrowRight className="mr-2 h-5 w-5 rotate-180" />
                            </ButtonLink>
                        </motion.div>
                    </motion.div>
                </div>
            </Section>

            <Section bg="gradient" className="py-32">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <FeatureCardGrid
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        items={[
                            {
                                icon: Target,
                                title: "مهمتنا",
                                description: "تمكين المطورين والوسطاء من خلال أدوات استخبارات سوقية تعتمد على الذكاء الاصطناعي والمحاكاة اللحظية للطلب.",
                                className: "hover:scale-[1.02] transition-transform duration-500"
                            },
                            {
                                icon: Shield,
                                title: "قيمنا",
                                description: "الشفافية المطلقة، السرية المؤسسية، والامتثال الكامل للأنظمة التشريعية لالهيئة العامة للعقار.",
                                className: "hover:scale-[1.02] transition-transform duration-500"
                            },
                            {
                                icon: Users,
                                title: "النظام البيئي",
                                description: "ربط جميع أطراف العملية العقارية في منصة واحدة تضمن كفاءة التنفيذ وسرعة الإغلاق.",
                                className: "hover:scale-[1.02] transition-transform duration-500"
                            },
                        ]}
                    />
                </motion.div>
            </Section>

            <Section className="py-32 bg-white relative">
                <div className="absolute top-0 right-0 w-32 h-full bg-slate-50/50 -skew-x-12 translate-x-16" />

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10"
                >
                    <div className="space-y-8">
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            رؤية عام <br />
                            <span className="text-blue-600">٢٠٣٠</span>
                        </h2>
                        <div className="w-20 h-2 bg-blue-600" />
                    </div>
                    <div className="space-y-8 text-slate-500 font-bold leading-relaxed text-xl">
                        <p>
                            تساهم عنان في تسريع التحول الرقمي للقطاع العقاري السعودي من خلال أتمتة عمليات البحث والتمويل والتعاقد. نحن لا نوفر مجرد تطبيق، بل نبني بروتوكولاً للتعاملات الكبرى.
                        </p>
                        <p className="text-lg opacity-80">
                            من خلال مكاتبنا في الرياض، نعمل جنباً إلى جنب مع شركائنا لضمان توفير تدفقات بيانات دقيقة تساعد في استقرار السوق ونموه.
                        </p>
                    </div>
                </motion.div>
            </Section>

            <Section bg="slate" className="py-32 border-y border-slate-100">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    <MetricGrid
                        className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center"
                        itemClassName="space-y-4"
                        valueClassName="text-6xl font-black text-blue-600 tracking-tighter"
                        labelClassName="block text-xs font-black uppercase tracking-[0.2em] text-slate-400"
                        items={[
                            { value: "٢٠٣٠", label: "رؤية التحول" },
                            { value: "٩٩.٩٪", label: "دقة البيانات" },
                            { value: "٢٤/٧", label: "ذكاء تشغيلي" },
                            { value: "١٠٠٪", label: "امتثال سعودي" },
                        ]}
                    />
                </motion.div>
            </Section>

            <Section bg="dark" className="py-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay" />
                <div className="absolute top-0 right-1/4 h-[500px] w-[500px] bg-blue-600/10 blur-[100px]" />

                <div className="max-w-5xl mx-auto space-y-20 text-right relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black text-white leading-tight"
                    >
                        الالتزام <br />
                        <span className="text-blue-500">بالرؤية الوطنية</span>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-slate-400 font-bold leading-relaxed text-xl">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            نحن في عنان لسنا مجرد مزود للخدمات التقنية، نحن شريك استراتيجي في رحلة التحول الرقمي للقطاع العقاري. نؤمن بأن الشفافية هي مفتاح النمو، ولذلك نوفر أدوات تضمن وصول المعلومة الصحيحة في الوقت المناسب لكل طرف.
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            بحلول عام ٢٠٣٠، نهدف لأن تكون بنية عنان التحتية هي المعيار الذهبي لجميع عمليات الربط والتعاقد العقاري المؤسسي في المملكة العربية السعودية، مدعومة بأحدث ما توصل إليه العلم في مجال الذكاء الاصطناعي السيادي.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="pt-16 mt-16 border-t border-slate-800/50 flex flex-wrap justify-start gap-6"
                    >
                        <ButtonLink href="/contact" variant="primary" className="px-12 py-4">
                            ابدأ الشراكة
                        </ButtonLink>
                        <ButtonLink href="/developer" variant="outline" className="px-8 py-4 border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 transition-colors !bg-transparent">
                            المطورون
                        </ButtonLink>
                    </motion.div>
                </div>
            </Section>
        </main>
    );
}
