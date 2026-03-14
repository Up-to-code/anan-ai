import { Handshake, MessageSquare, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Percent, RussianRuble as SaudiRiyal } from "lucide-react";
import { cn } from "@/lib/utils";

interface NegotiationStep {
    role: string;
    action: string;
    details: string;
    time: string;
    status: "pending" | "accepted" | "countered";
}

export default function AgNegotiationHub() {
    const history: NegotiationStep[] = [
        {
            role: "الوسيط أحمد",
            action: "عرض أولي",
            details: "سعر الشراء: 4.1M ر.س، دفعة أولى 15%",
            time: "10:30 ص",
            status: "countered"
        },
        {
            role: "المطور (دار الأركان)",
            action: "عرض مقابل",
            details: "سعر الشراء: 4.2M ر.س، دفعة أولى 20%، جدول دفعات مرن",
            time: "02:15 م",
            status: "pending"
        }
    ];

    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-slate-950 text-white">
                        <Handshake className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">مركز التفاوض المباشر</div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">مركز التفاوض</h3>
                    </div>
                </div>
                <div className="bg-amber-50   px-4 py-2 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-none bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">تحت المراجعة</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5   bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Percent className="h-3.5 w-3.5 text-blue-600" />
                        <div className="text-[9px] font-black uppercase text-slate-400">عمولة الإغلاق</div>
                    </div>
                    <div className="text-lg font-black text-slate-900">2.75% متفق عليها</div>
                </div>
                <div className="p-5   bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <div className="text-[9px] font-black uppercase text-slate-400">تاريخ انتهاء العرض</div>
                    </div>
                    <div className="text-lg font-black text-slate-900">بعد 48 ساعة</div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">تاريخ سجل التفاوض</div>
                <div className="flex flex-col gap-4 relative">
                    <div className="absolute right-[21px] top-6 bottom-6 w-0.5 bg-slate-100" />

                    {history.map((step, i) => (
                        <div key={i} className="relative pr-12">
                            <div className={cn(
                                "absolute right-0 top-1 h-11 w-11 border-2 bg-white flex items-center justify-center z-10",
                                step.status === "countered" ? "border-slate-100" : "border-blue-600"
                            )}>
                                {step.status === "countered" ? (
                                    <AlertCircle className="h-4 w-4 text-slate-300" />
                                ) : (
                                    <MessageSquare className="h-4 w-4 text-blue-600" />
                                )}
                            </div>
                            <div className={cn(
                                "p-6 border-2 transition-all",
                                step.status === "pending" ? "border-blue-600 bg-white" : "border-slate-50 bg-slate-50/50"
                            )}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-[10px] font-black uppercase text-slate-900">{step.role} - {step.action}</div>
                                    <div className="text-[9px] font-bold text-slate-400">{step.time}</div>
                                </div>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed">{step.details}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                <button className="flex-1 bg-slate-900 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-emerald-600 transition flex items-center justify-center gap-3">
                    <CheckCircle2 className="h-4 w-4" />
                    قبول الشروط
                </button>
                <button className="flex-1   bg-white py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 hover:bg-slate-50 transition flex items-center justify-center gap-3">
                    إرسال عرض مقابل
                    <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
