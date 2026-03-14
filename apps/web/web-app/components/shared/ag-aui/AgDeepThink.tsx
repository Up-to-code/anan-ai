import { Terminal, Cpu, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgDeepThink() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 bg-slate-900 border-slate-900 text-blue-400">
                    <Terminal className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-4">
                    <div className="inline-block w-full p-8 bg-slate-950 border-2 border-slate-800 text-right font-mono">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-none bg-blue-500 animate-pulse shrink-0" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">الاستنتاج الداخلي للذكاء الاصطناعي</span>
                            </div>
                            <Activity className="h-4 w-4 text-slate-700" />
                        </div>

                        <ul className="space-y-3">
                            {[
                                { label: "تحليل مستوى الطلب في المنطقة (الملقا)", status: "done" },
                                { label: "مطابقة مؤشرات أسعار السوق الحالية", status: "done" },
                                { label: "تقييم سرعة بيع الوحدات المماثلة", status: "active" },
                                { label: "حساب العائد المتوقع للفترة القادمة", status: "pending" },
                                { label: "اعتماد توصية السعر النهائي", status: "pending" }
                            ].map((step, i) => (
                                <li key={i} className="flex items-center gap-3 text-[11px]">
                                    {step.status === "done" && <Zap className="h-3 w-3 text-emerald-500" />}
                                    {step.status === "active" && <Cpu className="h-3 w-3 text-blue-500 animate-spin" />}
                                    {step.status === "pending" && <div className="h-3 w-3 border border-slate-700" />}
                                    <span className={cn(
                                        step.status === "done" ? "text-slate-400 line-through" : "text-slate-300",
                                        step.status === "active" && "text-blue-400 font-bold"
                                    )}>
                                        {step.label}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] text-slate-500">
                            نظام.سجل: تم تحسين استعلام البحث للوحدات الفاخرة
                        </div>
                    </div>

                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        محرك أنان للتفكير العميق
                    </div>
                </div>
            </div>
        </div>
    );
}
