import { Map, TrendingUp, BarChart3, Globe, ArrowUpRight } from "lucide-react";

export default function AgMarketIntelligence() {
    return (
        <div className="w-full bg-white overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-64 bg-slate-50 border-b-2 md:border-b-0 md:border-l-2 border-slate-100 p-6 flex flex-col gap-8">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">موقع الأصل</div>
                    <div className="mt-2 text-sm font-black text-slate-900">الملقا، الرياض</div>
                </div>

                <div className="flex-1 min-h-[140px] bg-slate-200 border-2 border-slate-300 flex items-center justify-center relative">
                    <Map className="h-10 w-10 text-slate-400" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-blue-600 border-2 border-white" />
                </div>

                <button className="w-full   bg-slate-900 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-600 hover:border-blue-600 transition">
                    عرض الموقع على الخريطة
                </button>
            </div>

            <div className="flex-1 p-8 flex flex-col gap-8">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
                            <Globe className="h-3.5 w-3.5" />
                            تقرير ذكاء السوق
                        </div>
                        <h3 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">تحليل العرض والطلب</h3>
                    </div>
                    <div className="bg-emerald-50 px-3 py-1 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        طلب مرتفع
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400">متوسط سعر المتر</span>
                            <span className="text-sm font-black text-slate-900">10,500 ر.س</span>
                        </div>
                        <div className="flex items-end gap-1 h-12">
                            {[0.4, 0.6, 0.5, 0.8, 0.9, 0.7].map((h, i) => (
                                <div key={i} className="flex-1 bg-slate-100 hover:bg-blue-600 transition" style={{ height: `${h * 100}%` }} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400">العائد المتوقع</span>
                            <span className="text-sm font-black text-emerald-600">+8.5%</span>
                        </div>
                        <div className="flex items-end gap-1 h-12">
                            {[0.3, 0.4, 0.6, 0.5, 0.7, 1].map((h, i) => (
                                <div key={i} className="flex-1 bg-emerald-100 hover:bg-emerald-600 transition" style={{ height: `${h * 100}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6   flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-500">الأسعار في نمو مستمر منذ بداية العام</p>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 hover:underline">
                        التقرير الكامل
                        <ArrowUpRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
