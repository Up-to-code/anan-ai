import { Circle, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
    label: string;
    status: "complete" | "active" | "pending" | "warning";
    date?: string;
}

interface AgTimelineProps {
    steps: TimelineStep[];
}

export default function AgTimeline({ steps }: AgTimelineProps) {
    return (
        <div className="w-full bg-white p-6">
            <div className="flex items-center gap-4 mb-10">
                <div className="flex h-10 w-10 items-center justify-center bg-slate-950 text-white">
                    <Clock className="h-5 w-5" />
                </div>
                <div>
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">تقدم الصفقة</div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">الجدول الزمني والمعالم</h3>
                </div>
            </div>

            <div className="relative flex flex-col gap-8">
                <div className="absolute top-0 right-[15px] bottom-0 w-1 bg-slate-100" />

                {steps.map((step, i) => (
                    <div key={i} className="relative flex items-center justify-between gap-6 mr-10 group">
                        <div className={cn(
                            "flex-1 p-5 border-2 transition-all group-hover:bg-slate-50",
                            step.status === "complete" && "border-slate-100 bg-white",
                            step.status === "active" && "border-blue-600 bg-white",
                            step.status === "warning" && "border-amber-600 bg-white",
                            step.status === "pending" && "border-slate-100 bg-slate-50"
                        )}>
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-xs font-black uppercase tracking-tight",
                                    step.status === "active" ? "text-blue-600" : "text-slate-900",
                                    step.status === "pending" && "text-slate-400"
                                )}>
                                    {step.label}
                                </span>
                                {step.date && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{step.date}</span>}
                            </div>
                        </div>

                        <div className={cn(
                            "absolute -right-[32px] h-8 w-8 shrink-0 flex items-center justify-center bg-white border-2 transition-all z-10",
                            step.status === "complete" && "border-emerald-600 text-emerald-600",
                            step.status === "active" && "border-blue-600 text-blue-600 scale-110",
                            step.status === "warning" && "border-amber-600 text-amber-600",
                            step.status === "pending" && "border-slate-100 text-slate-200"
                        )}>
                            {step.status === "complete" && <CheckCircle2 className="h-4 w-4" />}
                            {step.status === "active" && <Circle className="h-4 w-4 fill-blue-600" />}
                            {step.status === "warning" && <AlertCircle className="h-4 w-4" />}
                            {step.status === "pending" && <Circle className="h-4 w-4" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 flex items-center justify-between border-t-2 border-slate-100 pt-6">
                <div className="text-[10px] font-black uppercase text-slate-400">تاريخ الإغلاق المتوقع</div>
                <div className="text-sm font-black text-slate-900">24 نوفمبر 2026</div>
            </div>
        </div>
    );
}
