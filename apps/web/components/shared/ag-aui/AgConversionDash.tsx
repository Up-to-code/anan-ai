import { TrendingUp, Users, Target, Zap, ArrowUpRight, BarChart3 } from "lucide-react";

export default function AgConversionDash() {
    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-emerald-100   flex items-center justify-center text-emerald-600">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">ذكاء إدارة العملاء</div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">لوحة مؤشرات التحويل</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-slate-400">النتيجة</div>
                    <div className="text-2xl font-black text-emerald-600 tracking-tighter">9.2 / 10</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {[
                    { label: "تحويل العملاء", value: "24%", trend: "+5.2%", icon: Target },
                    { label: "سرعة الاستجابة", value: "1.2m", trend: "-15s", icon: Zap },
                    { label: "إغلاق الصفقات", value: "8", trend: "+2", icon: BarChart3 }
                ].map((stat, i) => (
                    <div key={i} className="p-5   bg-slate-50/50 flex flex-col gap-1">
                        <stat.icon className="h-4 w-4 text-emerald-600 mb-2" />
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</div>
                        <div className="flex items-end gap-2">
                            <div className="text-xl font-black text-slate-900 leading-none">{stat.value}</div>
                            <div className="text-[8px] font-black text-emerald-600 mb-0.5">{stat.trend}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">تحليل مسار البيع</div>
                <div className="h-4 w-full bg-slate-100 group relative">
                    <div className="absolute top-0 left-0 h-full w-[85%] bg-emerald-500 border-r-2 border-white" />
                    <div className="absolute top-0 left-[85%] h-full w-[10%] bg-emerald-300 border-r-2 border-white" />
                    <div className="absolute top-0 left-[95%] h-full w-[5%] bg-slate-200" />

                    <div className="absolute -top-6 left-0 text-[8px] font-black uppercase text-slate-400">تدفق العملاء</div>
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                    <span>تواصل أولى (85%)</span>
                    <span>معاينة ميدانية (10%)</span>
                    <span>تفاوض (5%)</span>
                </div>
            </div>

            <button className="w-full   py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 hover:bg-slate-900 hover:text-white transition flex items-center justify-center gap-2">
                تحميل تقرير الأداء التفصيلي
                <ArrowUpRight className="h-4 w-4" />
            </button>
        </div>
    );
}
