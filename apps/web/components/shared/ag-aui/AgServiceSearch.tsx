import { Search, MapPin, Building2, UserCheck, Briefcase, ChevronLeft, Star } from "lucide-react";

export default function AgServiceSearch() {
    return (
        <div className="w-full bg-white overflow-hidden">
            <div className="bg-slate-50 p-8 border-b-2 border-slate-100">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
                    <Search className="h-4 w-4" />
                    الباحث الشامل عن الخدمات والوحدات
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="ابحث عن وسيط، خدمة صيانة، أو وحدة معينة..."
                            className="w-full bg-white   px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 transition"
                        />
                    </div>
                    <button className="bg-slate-950 px-10 border-2 border-slate-950 font-black uppercase tracking-widest text-[10px] text-white hover:bg-blue-600 hover:border-blue-600 transition">
                        بحث
                    </button>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "وسطاء معتمدون", count: 142, icon: UserCheck },
                        { label: "وحدات متاحة", count: "3.2K", icon: Building2 },
                        { label: "مزودي خدمات", count: 28, icon: Briefcase },
                        { label: "مواقع نشطة", count: 12, icon: MapPin }
                    ].map((category, i) => (
                        <div key={i} className="p-4   bg-slate-50/50 hover:border-blue-400 transition cursor-pointer group text-center">
                            <category.icon className="h-5 w-5 text-slate-300 group-hover:text-blue-600 mx-auto mb-2" />
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-tight">{category.label}</div>
                            <div className="text-lg font-black text-slate-900">{category.count}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">نتائج مقترحة</div>
                    {[
                        { name: "أحمد الفهد", role: "وسيط عقاري - متخصص الملقا", rating: 4.9, active: "نشط الآن" },
                        { name: "شركة النظافة المتميزة", role: "خدمات صيانة ونظافة", rating: 4.7, active: "متاح للحجز" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-5   hover:border-blue-600 transition group cursor-pointer bg-white">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-slate-100 flex items-center justify-center text-slate-400  ">
                                    <Star className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition">{item.name}</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{item.role}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1.5 text-xs font-black text-slate-900">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {item.rating}
                                </div>
                                <div className="text-[8px] font-black uppercase text-emerald-600 mt-0.5">{item.active}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button className="w-full bg-slate-50 border-t-2 border-slate-100 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2">
                عرض جميع الفئات والخدمات
                <ChevronLeft className="h-4 w-4" />
            </button>
        </div>
    );
}
