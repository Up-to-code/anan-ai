import { ShieldAlert, AlertTriangle, ShieldCheck, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY:   Institutional workflows often require a quick risk snapshot before taking commercial actions.
 * WHAT:  Renders a mock risk assessment panel with category scores and a committee recommendation.
 * HOW:   Uses a fixed local array to compute bars and status tones, keeping the component pure and presentational.
 */
export default function AgRiskAssessment() {
    const risks = [
        { label: "المخاطر السوقية", score: 24, status: "منخفضة" },
        { label: "المخاطر القانونية", score: 15, status: "آمنة" },
        { label: "المخاطر التشغيلية", score: 68, status: "حرجة" },
    ];

    return (
        <div className="w-full bg-white overflow-hidden shadow-none">
            <div className="bg-slate-950 p-8 flex justify-between items-center border-b-2 border-slate-900">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-amber-500 flex items-center justify-center">
                        <ShieldAlert className="h-6 w-6 text-slate-950" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">تقييم المخاطر</div>
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic">نطاق تحليل المخاطر</h3>
                    </div>
                </div>
                <Activity className="h-8 w-8 text-white/10" />
            </div>

            <div className="p-8 flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {risks.map((risk, i) => (
                        <div key={i} className="  p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{risk.label}</div>
                                <div className={cn(
                                    "text-[8px] font-black px-2 py-0.5 border-2 uppercase",
                                    risk.status === "آمنة" && "text-emerald-600 border-emerald-100 bg-emerald-50",
                                    risk.status === "منخفضة" && "text-blue-600 border-blue-100 bg-blue-50",
                                    risk.status === "حرجة" && "text-rose-600 border-rose-100 bg-rose-50 animate-pulse"
                                )}>
                                    {risk.status}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="text-3xl font-black text-slate-900">{risk.score}%</div>
                                <div className="h-1.5 w-full bg-slate-100">
                                    <div className={cn(
                                        "h-full transition-all duration-1000",
                                        risk.score > 60 ? "bg-rose-500" : risk.score > 30 ? "bg-blue-500" : "bg-emerald-500"
                                    )} style={{ width: `${risk.score}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-950 p-6 flex items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                    <div dir="rtl">
                        <div className="text-[10px] font-black uppercase text-white mb-2 tracking-[0.2em]">توصية لجنة المخاطر</div>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                            &quot;المخاطر التشغيلية مرتفعة بسبب تأخر توريد المواد الأولية للموقع (أ). ننصح بزيادة وتيرة المتابعة الأسبوعية وتفعيل خطة الطوارئ البديلة.&quot;
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-8 flex gap-4">
                <button className="flex-1   bg-blue-600 py-3 px-6 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-950 hover:border-slate-950 transition rounded-none">
                    عرض تقرير المخاطر الكامل
                </button>
                <button className="flex-1   py-3 px-6 text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition rounded-none">
                    التواصل مع الامتثال
                </button>
            </div>
        </div>
    );
}
