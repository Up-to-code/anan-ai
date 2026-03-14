import { CheckCircle2, Circle, Clock, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
    label: string;
    status: "done" | "doing" | "pending";
}

interface AgPlanBoardProps {
    title?: string;
    tasks?: Task[];
}

export default function AgPlanBoard({
    title = "خطة العمل الاستراتيجية",
    tasks = [
        { label: "تحليل السوق والمنافسين", status: "done" },
        { label: "إعداد تقرير الجدوى", status: "doing" },
        { label: "مراجعة العقود القانونية", status: "pending" }
    ]
}: AgPlanBoardProps) {
    return (
        <div className="w-full bg-white overflow-hidden shadow-none">
            <div className="bg-slate-950 p-6 border-b-2 border-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-600 flex items-center justify-center">
                        <Layout className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">منظومة الإنجاز</div>
                        <h3 className="text-lg font-black tracking-tight text-white uppercase">{title}</h3>
                    </div>
                </div>
                <div className="bg-white/5 px-4 py-2 border-2 border-white/5">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">يعمل الآن</span>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    {tasks.map((task, i) => (
                        <div key={i} className={cn(
                            "flex items-center gap-6 p-5 border-2 transition-all",
                            task.status === "doing"
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-100 bg-slate-50"
                        )}>
                            <div className="shrink-0">
                                {task.status === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                                {task.status === "doing" && <Clock className="h-5 w-5 text-blue-600 animate-pulse" />}
                                {task.status === "pending" && <Circle className="h-5 w-5 text-slate-300" />}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-900 text-right">{task.label}</div>
                            </div>
                            <div className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-3 py-1 border-2",
                                task.status === "done" && "text-emerald-600 border-emerald-100 bg-white",
                                task.status === "doing" && "text-blue-600 border-blue-100 bg-white",
                                task.status === "pending" && "text-slate-400 border-slate-100 bg-white"
                            )}>
                                {task.status === "done" && "تم الإنجاز"}
                                {task.status === "doing" && "جاري التنفيذ"}
                                {task.status === "pending" && "بالانتظار"}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        إجمالي المهام: {tasks.length}
                    </div>
                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition">
                        عرض السجل التفصيلي ←
                    </button>
                </div>
            </div>
        </div>
    );
}
