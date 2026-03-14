import { Search, DollarSign, TrendingUp, Landmark, Calendar, Filter, ChevronLeft } from "lucide-react";

export default function AgInvestmentSearch() {
    return (
        <div className="w-full bg-white overflow-hidden">
            <div className="bg-slate-950 p-8 text-white">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                    <Search className="h-4 w-4" />
                    البحث الاستثماري المتقدم
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-tight uppercase">الاستثمار والتمويل العقاري</h3>

                <div className="mt-8 flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="بحث عن قروض، عوائد، أو صكوك..."
                            className="w-full bg-white/5 border-2 border-white/10 px-6 py-4 text-sm font-bold text-white outline-none focus:border-blue-600 transition"
                        />
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    </div>
                    <button className="bg-blue-600 px-8 font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition">
                        بحث
                    </button>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "نوع التمويل", value: "مرابحة سكنية", icon: Landmark },
                        { label: "العائد المستهدف", value: "+8.5%", icon: TrendingUp },
                        { label: "مدة التمويل", value: "25 سنة", icon: Calendar }
                    ].map((item, i) => (
                        <div key={i} className="p-4   bg-slate-50/50 flex flex-col gap-2">
                            <item.icon className="h-4 w-4 text-blue-600" />
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</div>
                            <div className="text-sm font-black text-slate-900">{item.value}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">أفضل العروض المتاحة</div>
                    {[
                        { title: "تمويل عقاري - بنك الراجحي", rate: "4.2%", desc: "متوافق مع الشريعة الإسلامية" },
                        { title: "صندوق استثماري - الملقا ريت", rate: "9.1%", desc: "توزيعات نصف سنوية مستقرة" }
                    ].map((offer, i) => (
                        <div key={i} className="flex items-center justify-between p-5   hover:border-blue-600 transition group cursor-pointer">
                            <div>
                                <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition">{offer.title}</div>
                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">{offer.desc}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-blue-600">{offer.rate}</div>
                                <div className="text-[8px] font-black uppercase text-slate-400">عائد سنوي</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full bg-slate-50 border-t-2 border-slate-100 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2">
                عرض جميع المنتجات المالية
                <ChevronLeft className="h-4 w-4" />
            </button>
        </div>
    );
}
