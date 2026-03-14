import { Wrench, Calendar, CheckCircle2, Clock, History, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgMaintenanceLog() {
    const logs = [
        { type: "وقائي", date: "15 مارس 2026", task: "فحص المصاعد والمولدات", status: "Done" },
        { type: "طارئ", date: "12 مارس 2026", task: "إصلاح تسرب مياه القبو", status: "Done" },
        { type: "مجدول", date: "20 مارس 2026", task: "تنظيف الواجهات الزجاجية", status: "Upcoming" }
    ];

    return (
        <div className="w-full bg-white overflow-hidden shadow-none max-w-2xl">
            <div className="p-8 border-b-2 border-slate-900 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-slate-950 flex items-center justify-center">
                        <Wrench className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">سجل الصيانة</div>
                        <h3 className="text-2xl font-black tracking-tighter text-slate-950 uppercase italic">صيانة المرافق</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-black uppercase text-slate-400 mb-1">نسبة كفاءة الأصول</div>
                    <div className="text-xl font-black text-blue-600">98.4%</div>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    {logs.map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-5   hover:border-slate-900 transition bg-white">
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "h-10 w-10 flex items-center justify-center",
                                    log.status === "Done" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                )}>
                                    {log.status === "Done" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5 animate-pulse" />}
                                </div>
                                <div dir="rtl">
                                    <div className="text-sm font-black text-slate-900 mb-1">{log.task}</div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-[9px] font-black uppercase px-2 py-0.5   text-slate-400">{log.type}</div>
                                        <div className="text-[9px] font-bold text-slate-400 italic">{log.date}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-3 py-1",
                                log.status === "Done" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"
                            )}>
                                {log.status === "Done" ? "مكتمل" : "قادم"}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center py-4 border-t-2 border-slate-100">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-emerald-500" />
                            <span className="text-[9px] font-black uppercase text-slate-400">أصول سليمة</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500" />
                            <span className="text-[9px] font-black uppercase text-slate-400">مجدول</span>
                        </div>
                    </div>
                    <button className="text-[9px] font-black uppercase text-blue-600 hover:underline tracking-widest">
                        تحميل السجل الكامل PDF
                    </button>
                </div>
            </div>

            <button className="w-full bg-slate-950 py-5 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 group">
                طلب صيانة طارئة
                <History className="h-4 w-4" />
            </button>
        </div>
    );
}
