import { Search, MapPin, Filter, ArrowRight, Home } from "lucide-react";

export default function AgMarketSearch() {
    return (
        <div className="w-full bg-white overflow-hidden shadow-none">
            <div className="p-8 flex flex-col gap-8">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">محرك البحث الاستخباراتي</div>
                        <h3 className="text-3xl font-black tracking-tighter text-slate-950 uppercase italic">البحث في السوق</h3>
                    </div>
                    <div className="h-14 w-14 bg-slate-950 flex items-center justify-center">
                        <Search className="h-6 w-6 text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">النطاق الجغرافي</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <input
                                type="text"
                                placeholder="شمال الرياض، الملقا..."
                                className="w-full bg-slate-50   p-4 pl-12 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-right"
                                dir="rtl"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">نوع الاستثمار</label>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                            <select className="w-full bg-slate-50   p-4 pl-12 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition-all text-right appearance-none" dir="rtl">
                                <option>سكني فاخر</option>
                                <option>تجاري استثماري</option>
                                <option>أراضي خام</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {["نشط جداً", "فرصة ذهبية", "طلب مرتفع"].map((tag, i) => (
                        <div key={i} className="px-4 py-2   bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {tag}
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full bg-blue-600 py-6 text-white text-[11px] font-black uppercase tracking-[0.5em] hover:bg-slate-950 transition-all flex items-center justify-center gap-4 group">
                إطلاق الاستعلام المتقدم
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
        </div>
    );
}
