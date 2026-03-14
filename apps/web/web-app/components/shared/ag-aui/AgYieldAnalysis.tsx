import { TrendingUp, PieChart, ArrowUpRight, ShieldCheck, Wallet, Landmark } from "lucide-react";

/**
 * WHY:   Developer dashboards need a fast, executive summary view of investment yield signals.
 * WHAT:  Renders a mock yield analysis panel with IRR headline, distribution breakdown, and CTA.
 * HOW:   Uses static placeholder values and layout-only composition; no calculations beyond display formatting.
 */
export default function AgYieldAnalysis() {
    return (
        <div className="w-full bg-white overflow-hidden group">
            <div className="bg-emerald-600 p-8 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-100">تحليل العوائد المتقدم</div>
                        <h3 className="text-2xl font-black tracking-tight uppercase">ملف تحليل العوائد (Yield)</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-emerald-200">معدل العائد الداخلي (IRR)</div>
                    <div className="text-3xl font-black text-white leading-none mt-1">14.8%</div>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">توزيع التدفقات النقدية</div>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: "عوائد إيجارية", value: "45%", color: "bg-blue-600" },
                                { label: "ارتفاع القيمة", value: "35%", color: "bg-emerald-500" },
                                { label: "عوائد تشغيلية", value: "20%", color: "bg-slate-900" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`h-2 w-2 rounded-none ${item.color}`} />
                                    <span className="text-[10px] font-bold text-slate-600 flex-1">{item.label}</span>
                                    <span className="text-[10px] font-black text-slate-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                        <div className="h-32 w-full bg-slate-50   relative flex items-end p-2 gap-1">
                            {[40, 60, 45, 80, 55, 95].map((h, i) => (
                                <div key={i} className="flex-1 bg-emerald-500 border-x border-emerald-600" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                        <div className="text-[8px] font-black uppercase text-slate-300 text-center tracking-[0.3em]">نمو العائد التاريخي (5 سنوات)</div>
                    </div>
                </div>

                <div className="bg-slate-50   p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-blue-600">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">ضمانات الاستثمار أنان</span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                        &quot;يتم احتساب العوائد بناءً على بيانات السوق اللحظية ونسب الإشغال الفعلية لحي الملقا، مع هامش خطأ لا يتجاوز 2.5%.&quot;
                    </p>
                </div>
            </div>

            <div className="flex border-t-2 border-slate-900">
                <div className="flex-1 p-6 border-r-2 border-slate-900 bg-white">
                    <div className="flex items-center gap-3 mb-1">
                        <Landmark className="h-4 w-4 text-slate-400" />
                        <span className="text-[8px] font-black uppercase text-slate-400">القيمة الرأسمالية النهائية</span>
                    </div>
                    <div className="text-xl font-black text-slate-900 leading-none">12.5M ر.س</div>
                </div>
                <button className="flex-1 bg-slate-950 py-4 text-[11px] font-black uppercase tracking-[0.4em] text-white hover:bg-emerald-600 transition flex items-center justify-center gap-3">
                    توليد تقرير العوائد
                    <ArrowUpRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
