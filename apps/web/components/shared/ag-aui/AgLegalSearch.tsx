import { Search, FileText, Filter, ArrowRight, ShieldCheck, Database } from "lucide-react";

export default function AgLegalSearch() {
    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8 group">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white shadow-none">
                    <Database className="h-6 w-6" />
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">محرك البحث القانوني</div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">البحث في العقود والاتفاقيات</h3>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="ابحث في بنود العقود، اتفاقيات التمويل، أو المستندات القانونية..."
                    className="w-full   bg-slate-50 py-4 pr-12 pl-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all text-right"
                    dir="rtl"
                />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">آخر المستندات المفهرسة</div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
                        <Filter className="h-3 w-3" />
                        تصفية النتائج
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {[
                        { title: "اتفاقية تمويل عقاري - مصرف الراجحي", type: "تمويل", date: "منذ ساعتين" },
                        { title: "عقد بيع وحدة - مشروع أعالي الملقا", type: "قانوني", date: "أمس" },
                        { title: "خطاب نوايا استثماري - مجموعة بن لادن", type: "استثمار", date: "منذ 3 أيام" }
                    ].map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-4   hover:border-blue-100 hover:bg-blue-50/10 transition-all cursor-pointer group/item">
                            <div className="flex items-center gap-4">
                                <FileText className="h-5 w-5 text-slate-300 group-hover/item:text-blue-600 transition" />
                                <div>
                                    <div className="text-xs font-black text-slate-900">{doc.title}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400">{doc.type}</span>
                                        <div className="w-1 h-1 rounded-none bg-slate-200" />
                                        <span className="text-[9px] font-black uppercase text-slate-400">{doc.date}</span>
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-200 group-hover/item:text-blue-600 transition -rotate-180" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 p-6 text-white   flex items-center gap-4">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">حماية البيانات</div>
                    <p className="text-[11px] font-bold leading-relaxed">جميع عمليات البحث تتم عبر قنوات مشفرة وفقاً لمعايير الهيئة الوطنية للأمن السيبراني.</p>
                </div>
            </div>
        </div>
    );
}
