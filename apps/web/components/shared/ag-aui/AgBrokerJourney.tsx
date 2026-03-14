import { User, ArrowRight, Clock, MapPin, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JourneyStep {
    label: string;
    status: "cold" | "warm" | "hot";
    description: string;
    active?: boolean;
}

export default function AgBrokerJourney() {
    const steps: JourneyStep[] = [
        {
            label: "في قائمة الانتظار",
            status: "cold",
            description: "العميل ينتظر تخصيص وسيط متاح.",
        },
        {
            label: "تم تخصيص الوسيط",
            status: "warm",
            description: "الوسيط أحمد استلم الملف وجاري المراجعة.",
        },
        {
            label: "جاري التواصل",
            status: "warm",
            description: "الوسيط يتناقش مع العميل حول المتطلبات.",
            active: true
        },
        {
            label: "زيارة ميدانية",
            status: "hot",
            description: "تم حجز موعد لزيارة العقار غداً 4 عصراً.",
        },
        {
            label: "مرحلة الإغلاق",
            status: "hot",
            description: "تجهيز أوراق التعاقد النهائية.",
        }
    ];

    const getStatusColor = (status: string, active?: boolean) => {
        if (active) return "border-blue-600 bg-blue-600 text-white";
        switch (status) {
            case "hot": return "border-emerald-500 text-emerald-600 bg-emerald-50";
            case "warm": return "border-blue-400 text-blue-600 bg-blue-50";
            default: return "border-slate-200 text-slate-400 bg-slate-50";
        }
    };

    const getIndicatorColor = (status: string) => {
        switch (status) {
            case "hot": return "bg-emerald-500";
            case "warm": return "bg-blue-500";
            default: return "bg-slate-300";
        }
    };

    return (
        <div className="w-full bg-white p-6 flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-950 flex items-center justify-center text-white">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">تتبع رحلة العميل</div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight uppercase">مسار الوسيط مع العميل</h3>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-none bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">مراقب الآن</span>
                </div>
            </div>

            <div className="relative flex flex-col gap-6">
                {/* Vertical Line */}
                <div className="absolute right-[19px] top-4 bottom-4 w-1 bg-slate-100" />

                {steps.map((step, i) => (
                    <div key={i} className="relative flex items-start gap-8 mr-12 transition-all group">
                        {/* Step Description Card */}
                        <div className={cn(
                            "flex-1 p-5 border-2 transition-all hover:bg-slate-50 cursor-default",
                            step.active ? "border-blue-600 bg-white" : "border-slate-100 bg-slate-50"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 border",
                                    step.status === "hot" ? "border-emerald-200 bg-emerald-100 text-emerald-700" :
                                        step.status === "warm" ? "border-blue-200 bg-blue-100 text-blue-700" :
                                            "border-slate-200 bg-slate-100 text-slate-500"
                                )}>
                                    {step.status === "hot" ? "ساخن" : step.status === "warm" ? "دافئ" : "بارد"}
                                </span>
                                <span className={cn(
                                    "text-xs font-black uppercase",
                                    step.active ? "text-blue-600" : "text-slate-900"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 leading-normal">{step.description}</p>

                            {step.active && (
                                <div className="mt-4 flex gap-2">
                                    <button className="flex-1 bg-blue-600 py-2   text-[9px] font-black uppercase text-white hover:bg-blue-700 hover:border-blue-700 transition">
                                        تحدث مع الوسيط
                                    </button>
                                    <button className="px-3   text-slate-400 hover:text-slate-900 hover:border-slate-900 transition">
                                        <MapPin className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Indicator Circle */}
                        <div className={cn(
                            "absolute -right-[40px] top-5 h-10 w-10 shrink-0 flex items-center justify-center bg-white border-2 transition-all z-10",
                            step.active ? "border-blue-600 scale-110" : "border-slate-100"
                        )}>
                            <div className={cn(
                                "h-3 w-3 transition-all",
                                getIndicatorColor(step.status)
                            )} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6   flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 border-2 border-emerald-100 bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500">تم تحديث الحالة قبل 3 دقائق بواسطة النظام</p>
                </div>
                <button className="text-[10px] font-black uppercase text-blue-600 hover:underline flex items-center gap-2">
                    عرض السجل الكامل
                    <ArrowRight className="h-3 w-3 -rotate-180" />
                </button>
            </div>
        </div>
    );
}
