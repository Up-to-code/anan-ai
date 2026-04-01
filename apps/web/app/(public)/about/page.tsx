"use client";

import { motion } from "framer-motion";
import { Target, Shield, Users, ArrowRight } from "lucide-react";
import { ButtonLink, FeatureCardGrid, MetricGrid, Section } from "@/app/(public)/public";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { cn } from "@/lib/utils";

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
    const { locale, dictionary, direction, isRtl } = useWebLocale();

    return (
        <main className="overflow-x-hidden" dir={direction}>
            <Section bg="none" className="relative overflow-hidden bg-white pt-48 pb-32 dark:bg-slate-950">
                {/* Dynamic Background Patterns */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] bg-blue-50/50 blur-[120px] dark:bg-blue-500/10" />
                    <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] bg-blue-50/50 blur-[120px] dark:bg-blue-500/10" />
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
                            <span className="px-4 py-1.5 border border-blue-100 bg-blue-50 text-blue-600 text-sm font-black tracking-widest uppercase dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                                {dictionary.about.badge}
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-slate-100"
                        >
                            {dictionary.about.title} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                                {dictionary.about.titleAccent}
                            </span>
                        </motion.h1>

                        <motion.div
                            variants={itemVariants}
                            className="max-w-3xl mx-auto space-y-8 text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300 md:text-2xl"
                        >
                            <p>
                                {dictionary.about.description}
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-4">
                            <ButtonLink href="/contact" variant="primary" className="px-10 py-5 text-lg">
                                {dictionary.about.contact}
                                <ArrowRight className={cn("h-5 w-5", isRtl ? "mr-2 rotate-180" : "ml-2")} />
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
                                title: dictionary.about.missionTitle,
                                description: dictionary.about.missionDescription,
                                className: "hover:scale-[1.02] transition-transform duration-500"
                            },
                            {
                                icon: Shield,
                                title: dictionary.about.valuesTitle,
                                description: dictionary.about.valuesDescription,
                                className: "hover:scale-[1.02] transition-transform duration-500"
                            },
                            {
                                icon: Users,
                                title: dictionary.about.workStyleTitle,
                                description: dictionary.about.workStyleDescription,
                                className: "hover:scale-[1.02] transition-transform duration-500"
                            },
                        ]}
                    />
                </motion.div>
            </Section>

            <Section className="relative bg-white py-32 dark:bg-slate-950">
                <div className="absolute top-0 right-0 h-full w-32 -skew-x-12 translate-x-16 bg-slate-50/50 dark:bg-slate-900/70" />

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10"
                >
                    <div className="space-y-8">
                        <h2 className="text-5xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100">
                            {dictionary.about.whyTitle} <br />
                            <span className="text-blue-600">{dictionary.about.whyAccent}</span>
                        </h2>
                        <div className="w-20 h-2 bg-blue-600" />
                    </div>
                    <div className="space-y-8 text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
                        <p>
                            {dictionary.about.whyDescriptionPrimary}
                        </p>
                        <p className="text-lg opacity-80">
                            {dictionary.about.whyDescriptionSecondary}
                        </p>
                    </div>
                </motion.div>
            </Section>

            <Section bg="slate" className="border-y border-slate-100 py-32 dark:border-slate-800">
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
                            { value: "1", label: dictionary.about.metricsUnified },
                            { value: "2", label: dictionary.about.metricsAudience },
                            { value: "24/7", label: dictionary.about.metricsAvailability },
                            { value: locale === "fr" ? "Clair" : locale === "en" ? "Clear" : "واضح", label: dictionary.about.metricsClarity },
                        ]}
                    />
                </motion.div>
            </Section>

            <Section bg="dark" className="py-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay" />
                <div className="absolute top-0 right-1/4 h-[500px] w-[500px] bg-blue-600/10 blur-[100px]" />

                <div className={cn("max-w-5xl mx-auto space-y-20 relative z-10", isRtl ? "text-right" : "text-left")}>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-black text-white leading-tight"
                    >
                        {dictionary.about.identityTitle} <br />
                        <span className="text-blue-500">{dictionary.about.identityAccent}</span>
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-slate-400 font-bold leading-relaxed text-xl">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            {dictionary.about.identityDescriptionPrimary}
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            {dictionary.about.identityDescriptionSecondary}
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
                            {dictionary.about.talkToTeam}
                        </ButtonLink>
                        <ButtonLink href="/developer" variant="outline" className="px-8 py-4 border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 transition-colors !bg-transparent">
                            {dictionary.about.developerSpace}
                        </ButtonLink>
                    </motion.div>
                </div>
            </Section>
        </main>
    );
}
