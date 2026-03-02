import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/public_zone/ui/accordion";
import { Check, Zap, Shield, BarChart2, MessageSquare, Target, Search, Globe, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/public_zone/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/_core/lib/utils";

export function MeshGradient({ color = "blue", className }: { color?: "blue" | "emerald" | "orange", className?: string }) {
    const gradients = {
        blue: "from-blue-600/30 via-indigo-500/15 to-transparent",
        emerald: "from-emerald-600/30 via-teal-500/15 to-transparent",
        orange: "from-orange-600/30 via-amber-500/15 to-transparent",
    };

    return (
        <div className={cn("absolute inset-0 -z-10 pointer-events-none overflow-hidden select-none", className)}>
            <div className={cn("absolute -top-[10%] -right-[5%] w-[80%] h-[80%] rounded-full bg-gradient-to-br blur-[140px] animate-pulse opacity-60", gradients[color])} />
            <div className={cn("absolute top-[20%] left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr blur-[120px] animate-pulse delay-500 opacity-40", gradients[color])} />
            <div className={cn("absolute -bottom-[10%] right-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-t blur-[110px] animate-pulse delay-1000 opacity-50", gradients[color])} />
        </div>
    );
}

export function ValueMetric({ label, value, trend, icon: Icon }: { label: string, value: string, trend?: string, icon: any }) {
    return (
        <div className="flex items-center gap-4 p-5 rounded-[2rem] border border-border/40 bg-white/40 backdrop-blur-3xl transition-all hover:scale-[1.02] hover:bg-white/60">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-6 w-6" />
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 italic">{label}</p>
                <div className="flex items-baseline gap-2 justify-end">
                    {trend && <span className="text-[10px] font-bold text-emerald-600 leading-none">{trend}</span>}
                    <span className="text-2xl font-bold text-slate-900 leading-none">{value}</span>
                </div>
            </div>
        </div>
    );
}

export function PartnerMarquee() {
    return (
        <div className="w-full overflow-hidden py-12 border-y border-border/10 mask-fade-edges relative">
            <div className="flex items-center gap-24 animate-marquee whitespace-nowrap opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                {["REMAX", "COLLIERS", "JLL", "DAMAC", "EMAAR", "AL-KHOBAR", "RIYADH-ESTATE", "NEOM-PARTNER"].map((p) => (
                    <span key={p} className="text-2xl font-bold tracking-tighter transition-all hover:opacity-100 hover:scale-110 cursor-default">{p}</span>
                ))}
                {/* Duplicate for seamless loop */}
                {["REMAX", "COLLIERS", "JLL", "DAMAC", "EMAAR", "AL-KHOBAR", "RIYADH-ESTATE", "NEOM-PARTNER"].map((p) => (
                    <span key={`${p}-2`} className="text-2xl font-bold tracking-tighter transition-all hover:opacity-100 hover:scale-110 cursor-default">{p}</span>
                ))}
            </div>
        </div>
    );
}

export function BentoFeatureGrid({ theme = "blue" }: { theme?: "blue" | "emerald" | "orange" }) {
    const colors = {
        blue: "text-blue-600 bg-blue-50/50 border-blue-100/50",
        emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-100/50",
        orange: "text-orange-600 bg-orange-50/50 border-orange-100/50",
    };

    const features = [
        {
            title: "تثمين عقاري ذكي",
            desc: "خوارزميات متجذرة في بيانات البورصة العقارية لتقدير دقيق لحظي.",
            icon: Zap,
            stats: "دقة ٩٩.٤٪",
            className: "md:col-span-2 md:row-span-1",
        },
        {
            title: "المطابقة",
            desc: "ربط المشتري الجاد بالعقار المثالي.",
            icon: Target,
            className: "md:col-span-1 md:row-span-1",
        },
        {
            title: "نشاط السوق",
            desc: "تتبع حركة المبايعات في كل حي.",
            icon: Activity,
            stats: "+١٢ ألف صفقة/يوم",
            className: "md:col-span-1 md:row-span-2",
        },
        {
            title: "تجربة دردشة استثنائية",
            desc: "مساعد رقمي يمتلك ذكاءً عمرانياً واستثمارياً واسعاً.",
            icon: MessageSquare,
            className: "md:col-span-2 md:row-span-1",
            preview: true
        },
        {
            title: "الأمان",
            desc: "خصوصية بياناتك أولويتنا القصوى.",
            icon: Shield,
            className: "md:col-span-1 md:row-span-1",
        },
        {
            title: "شبكة وطنية",
            desc: "تغطية شاملة لمدن المملكة.",
            icon: Globe,
            className: "md:col-span-1 md:row-span-1",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
            {features.map((f, i) => (
                <div
                    key={i}
                    className={cn(
                        "group relative p-8 rounded-[3rem] border border-border/40 bg-white/40 backdrop-blur-3xl hover:border-primary/40 transition-all duration-700 flex flex-col justify-end overflow-hidden cursor-default",
                        f.className
                    )}
                >
                    {/* Inner Glow Effect */}
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className={cn(
                        "absolute top-8 right-8 h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]",
                        colors[theme]
                    )}>
                        <f.icon className="h-6 w-6" />
                    </div>

                    {f.stats && (
                        <div className="absolute top-9 left-8 px-3 py-1 rounded-full border border-border/20 bg-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{f.stats}</span>
                        </div>
                    )}

                    <div className="relative z-10">
                        <h4 className="text-lg font-bold mb-2 tracking-tight text-slate-900 group-hover:text-primary transition-colors">{f.title}</h4>
                        <p className="text-muted-foreground leading-relaxed text-sm max-w-[220px] opacity-70 group-hover:opacity-100 transition-opacity">
                            {f.desc}
                        </p>
                    </div>

                    {/* Rich Visual Decorations */}
                    <div className="absolute -bottom-12 -left-12 h-32 w-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                </div>
            ))}
        </div>
    );
}

export function FeatureGrid({ theme = "blue" }: { theme?: "blue" | "emerald" | "orange" }) {
    const colors = {
        blue: "text-blue-600 bg-blue-50 border-blue-100/50",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100/50",
        orange: "text-orange-600 bg-orange-50 border-orange-100/50",
    };

    const features = [
        { title: "تثمين ذكي", desc: "تقدير القيمة بدقة فائقة.", icon: Zap },
        { title: "فلترة متقدمة", desc: "بحث مخصص حسب احتياجك.", icon: Search },
        { title: "تحليلات السوق", desc: "بيانات لحظية وموثوقة.", icon: BarChart2 },
        { title: "دردشة AI", desc: "مساعد رقمي متاح دائماً.", icon: MessageSquare },
        { title: "مطابقة آلياً", desc: "ربط المشتري بالعقار الأمثل.", icon: Target },
        { title: "أمن وخصوصية", desc: "تشفير كامل لكافة بياناتك.", icon: Shield },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
                <div key={i} className="group p-10 rounded-[2.5rem] border border-border/40 bg-white/40 backdrop-blur-xl hover:border-primary/30 hover:bg-white/60 transition-all duration-700 hover:scale-[1.02]">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${colors[theme]}`}>
                        <f.icon className="h-7 w-7" />
                    </div>
                    <h4 className="text-xl font-bold mb-4 tracking-tight text-slate-900">{f.title}</h4>
                    <p className="text-muted-foreground leading-relaxed text-base font-medium opacity-80">{f.desc}</p>
                    <div className="mt-8 pt-8 border-t border-border/10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-500">
                        <Link to="#" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary italic">
                            <span>اكتشف المزيد</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function PricingSection({ type = "broker", theme = "blue" }: { theme?: "blue" | "emerald" | "orange", type?: "broker" | "developer" }) {
    const themeColors = {
        blue: "border-blue-600/30 bg-blue-50/50 text-blue-600",
        emerald: "border-emerald-600/30 bg-emerald-50/50 text-emerald-600",
        orange: "border-orange-600/30 bg-orange-50/50 text-orange-600",
    };

    const plans = [
        {
            name: "الأساسية",
            price: "٠",
            features: ["إضافة ٥ عقارات", "دردشة ذكية محدودة", "دعم فني عبر البريد"],
            cta: "ابدأ مجاناً",
            highlight: false,
        },
        {
            name: "المحترفة",
            price: "٢٩٩",
            features: ["عقارات غير محدودة", "تحليلات أداء متقدمة", "أولوية ظهور للعملاء", "دعم مخصص ٢٤/٧"],
            cta: "اشترك الآن",
            highlight: true,
        },
        {
            name: "المؤسسات",
            price: "٩٩٩",
            features: ["إدارة فريق عمل", "ربط API مخصص", "تقارير سوق حصرية", "مدير حساب خاص"],
            cta: "تواصل معنا",
            highlight: false,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p, i) => (
                <div key={i} className={cn(
                    "relative flex flex-col p-12 rounded-[3.5rem] border transition-all duration-700 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.05)]",
                    p.highlight ? cn("scale-105 z-10 ring-1 ring-inset ring-white/20", themeColors[theme]) : "border-border/40 bg-white/40 backdrop-blur-3xl"
                )}>
                    {p.highlight && (
                        <div className={cn(
                            "absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black tracking-widest uppercase px-6 py-2 rounded-full",
                            theme === 'blue' ? 'bg-blue-600 shadow-blue-500/20' : theme === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-orange-600 shadow-orange-500/20'
                        )}>
                            الأكثر اختياراً
                        </div>
                    )}
                    <div className="mb-12">
                        <h4 className="text-xl font-bold mb-3 text-slate-900 uppercase tracking-tight">{p.name}</h4>
                        <div className="flex items-baseline gap-2 justify-end">
                            <span className="text-muted-foreground text-sm font-bold italic">ريال / شهر</span>
                            <span className="text-5xl font-bold text-slate-900 tracking-tighter">{p.price}</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-5 mb-12">
                        {p.features.map((f, j) => (
                            <div key={j} className="flex items-center gap-4 justify-end group/item">
                                <span className="text-base text-slate-600 font-bold group-hover/item:text-slate-900 transition-colors">{f}</span>
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center bg-white border border-border/20 transition-all duration-500 group-hover/item:scale-110",
                                    theme === 'blue' ? 'text-blue-600' : theme === 'emerald' ? 'text-emerald-600' : 'text-orange-600'
                                )}>
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button asChild
                        size="lg"
                        className={cn(
                            "rounded-2xl w-full py-8 text-lg font-bold transition-all transform active:scale-95",
                            p.highlight
                                ? (theme === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-none' : theme === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-none' : 'bg-orange-600 hover:bg-orange-700 shadow-none')
                                : "bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 shadow-none"
                        )}
                    >
                        <Link to={`/signin?type=${type}`}>{p.cta}</Link>
                    </Button>
                </div>
            ))}
        </div>
    );
}

export function FAQSection({ questions }: { questions: { q: string, a: string }[] }) {
    return (
        <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto space-y-5">
            {questions.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-none rounded-[2rem] px-10 bg-white/40 backdrop-blur-3xl hover:bg-white/60 transition-all duration-700 overflow-hidden">
                    <AccordionTrigger className="text-right py-10 font-bold text-lg hover:no-underline [&[data-state=open]]:text-primary transition-colors">
                        {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-right text-slate-500 text-lg leading-relaxed pb-10 font-medium opacity-80">
                        {item.a}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export function AIChatInput({ placeholder = "ابحث عن أي شيء...", theme = "blue" }: { placeholder?: string, theme?: "blue" | "emerald" | "orange" }) {
    const themeColors = {
        blue: "focus-within:ring-blue-600/10 bg-blue-600 hover:bg-blue-700",
        emerald: "focus-within:ring-emerald-600/10 bg-emerald-600 hover:bg-emerald-700",
        orange: "focus-within:ring-orange-600/10 bg-orange-600 hover:bg-orange-700",
    };

    return (
        <div className={cn(
            "relative flex flex-col w-full max-w-2xl mx-auto rounded-[2.5rem] border border-border/40 bg-white/80 backdrop-blur-3xl transition-all duration-700 focus-within:ring-[12px] focus-within:border-primary/20 group hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.05)]",
        )}>
            {/* Top Shine */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <textarea
                className="flex min-h-[120px] w-full resize-none border-0 bg-transparent px-8 py-7 text-right text-base font-bold placeholder:text-slate-400 focus:ring-0 focus:outline-none transition-all"
                placeholder={placeholder}
            />

            <div className="flex items-center gap-4 border-t border-border/5 p-4 bg-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <button className="h-11 w-11 flex items-center justify-center rounded-[1.25rem] border border-border/10 text-slate-400 hover:bg-white hover:text-slate-600 hover:scale-105 transition-all duration-500">
                        <Target className="h-5 w-5" />
                    </button>
                    <button className="h-11 w-11 flex items-center justify-center rounded-[1.25rem] border border-border/10 text-slate-400 hover:bg-white hover:text-slate-600 hover:scale-105 transition-all duration-500">
                        <Globe className="h-5 w-5" />
                    </button>
                </div>

                <div className="mr-auto flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest italic group-focus-within:text-primary transition-colors">
                        <Activity className="h-3 w-3 animate-pulse" />
                        <span>AI Cognitive Core Active</span>
                    </div>
                    <button className={cn(
                        "h-12 px-8 rounded-2xl text-white font-bold text-sm transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-black/5 hover:-translate-y-0.5",
                        themeColors[theme].split(' ')[1]
                    )}>
                        <span>إرسال</span>
                        <Zap className="h-4 w-4 fill-current" />
                    </button>
                </div>
            </div>
        </div>
    );
}
