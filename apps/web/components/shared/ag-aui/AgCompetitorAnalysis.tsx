import { Target, BarChart, TrendingUp, AlertCircle, CheckCircle2, Zap } from "lucide-react";

/**
 * WHY:   Developers need competitive context to decide pricing and positioning without leaving the workspace.
 * WHAT:  Renders a mock competitor analysis panel with headline metrics, competitor rows, and a recommendation.
 * HOW:   Uses static placeholder arrays and dense UI styling; no data fetching or side effects.
 */
export default function AgCompetitorAnalysis() {
    return (
        <div className="w-full bg-white overflow-hidden shadow-none">
            <div className="bg-slate-950 p-8 flex justify-between items-center">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-white flex items-center justify-center">
                        <Target className="h-6 w-6 text-slate-950" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">رؤى تنافسية</div>
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic">تحليل المنافسين اللحظي</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-black uppercase text-slate-500 mb-1">مستوى التنافسية</div>
                    <div className="px-3 py-1 bg-amber-50 border-2 border-amber-500 text-xs font-black text-amber-600 uppercase">مرتفع جداً</div>
                </div>
            </div>

            <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: "تموضع السعر", value: "متوازن", icon: TrendingUp },
                        { label: "الحصة السوقية", value: "12.4%", icon: BarChart },
                        { label: "سرعة البيع", value: "فوق المعدل", icon: Zap }
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className="bg-slate-50   p-5 space-y-3">
                                <Icon className="h-5 w-5 text-blue-600" />
                                <div>
                                    <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</div>
                                    <div className="text-lg font-black text-slate-900">{stat.value}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">مقارنة المنافسين الرئيسيين</div>
                    <div className="space-y-3">
                        {[
                            { name: "شركة رتال", price: "4,200 ر.س/م", status: "فاخر" },
                            { name: "دار وحوار", price: "3,850 ر.س/م", status: "منافس" },
                            { name: "أريج العقارية", price: "4,100 ر.س/م", status: "متوازن" }
                        ].map((comp, i) => (
                            <div key={i} className="flex items-center justify-between p-4   hover:border-slate-200 transition bg-white">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 bg-blue-600" />
                                    <span className="text-sm font-bold text-slate-900">{comp.name}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-xs font-black text-slate-900">{comp.price}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500  ">
                                        {comp.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-100 p-6 flex items-start gap-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[10px] font-black uppercase text-emerald-700 mb-1">قرار التسعير الاستراتيجي</div>
                        <p className="text-xs font-bold text-emerald-900 leading-relaxed italic">
                            &quot;استراتيجية التسعير الحالية منافسة جداً في نطاق الملقا (المرحلة الثانية)، ننصح بالتمسك بالسعر الحالي لزيادة سرعة التدفق النقدي.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
