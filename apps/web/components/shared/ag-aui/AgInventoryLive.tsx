import { Grid3X3, CheckCircle2, XCircle, Clock, Info, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgInventoryLive() {
    const units = Array.from({ length: 12 }, (_, i) => ({
        id: `وحدة-${100 + i}`,
        status: i % 4 === 0 ? "reserved" : i % 5 === 0 ? "sold" : "available",
        price: `${(2.5 + (i * 0.1)).toFixed(1)} مليون`
    }));

    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white">
                        <Grid3X3 className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">المخزون المباشر</div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">خلاصة المخزون المباشر</h3>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-none bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">تحديث لحظي</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {units.map((unit, i) => (
                    <div key={i} className={cn(
                        "relative aspect-square border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group",
                        unit.status === "available" ? "border-slate-100 hover:border-blue-600 bg-white" :
                            unit.status === "reserved" ? "border-amber-100 bg-amber-50" :
                                "border-slate-100 bg-slate-100 opacity-60"
                    )}>
                        <div className="text-[10px] font-black text-slate-900">{unit.id}</div>
                        <div className="text-[8px] font-bold text-slate-400">{unit.price}</div>

                        {unit.status === "available" && (
                            <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-none bg-emerald-500" />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 scale-95 group-hover:scale-100 transition-all duration-300" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4  ">
                {[
                    { label: "متاح", count: 8, color: "bg-emerald-500", icon: CheckCircle2 },
                    { label: "محجوز", count: 3, color: "bg-amber-500", icon: Clock },
                    { label: "مباع", count: 1, color: "bg-slate-400", icon: XCircle }
                ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={cn("h-3 w-3", stat.color)} />
                        <div>
                            <div className="text-[9px] font-black uppercase text-slate-400">{stat.label}</div>
                            <div className="text-sm font-black text-slate-900">{stat.count} وحدات</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border-2 border-blue-100 p-6 flex items-start gap-4">
                <Info className="h-5 w-5 text-blue-600 shrink-0" />
                <div>
                    <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">تنبيه النظام</div>
                    <p className="text-xs font-bold text-blue-800 leading-relaxed">
                        مشروع أعالي الملقا يشهد طلباً عالياً. تم حجز 3 وحدات في آخر 60 دقيقة.
                    </p>
                </div>
            </div>

            <button className="w-full   py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 hover:bg-slate-900 hover:text-white transition flex items-center justify-center gap-3">
                فتح مخطط المشروع التفاعلي
                <ArrowUpRight className="h-4 w-4" />
            </button>
        </div>
    );
}
