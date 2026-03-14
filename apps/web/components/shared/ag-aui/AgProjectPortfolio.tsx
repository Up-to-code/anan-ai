import { Briefcase, Map, BarChart3, ArrowUpRight, Building2 } from "lucide-react";

export default function AgProjectPortfolio() {
    return (
        <div className="w-full bg-white overflow-hidden shadow-none">
            <div className="bg-slate-950 p-8 text-white relative">
                <div className="absolute right-0 top-0 h-full w-1 border-r-4 border-blue-600" />
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-1">المحفظة العقارية</div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase italic">محفظة المطور</h3>
                    </div>
                    <Building2 className="h-10 w-10 text-white/20" />
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <div>
                        <div className="text-[9px] font-black uppercase text-slate-500 mb-1">المشاريع الحالية</div>
                        <div className="text-2xl font-black">24</div>
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase text-slate-500 mb-1">القيمة الإجمالية</div>
                        <div className="text-2xl font-black">1.2B <span className="text-xs text-blue-500">ر.س</span></div>
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase text-slate-500 mb-1">معدل النمو</div>
                        <div className="text-2xl font-black text-emerald-400">+18%</div>
                    </div>
                </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { name: "أعالي الملقا", type: "سكني فاخر", units: 48, status: "82%" },
                    { name: "بوابة بنبان", type: "مكاتب إدارية", units: 120, status: "45%" }
                ].map((project, i) => (
                    <div key={i} className="  p-6 flex flex-col gap-4 hover:border-slate-900 transition-all bg-slate-50/50">
                        <div className="flex justify-between items-start">
                            <div className="text-right">
                                <h4 className="font-black text-slate-900 text-lg mb-1">{project.name}</h4>
                                <div className="text-[9px] font-black uppercase tracking-widest text-blue-600">{project.type}</div>
                            </div>
                            <div className="h-8 w-8 bg-white   flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-slate-900" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>إنجاز {project.status}</span>
                                <span>{project.units} وحدة</span>
                            </div>
                            <div className="h-1 w-full bg-slate-200">
                                <div className="h-full bg-blue-600" style={{ width: project.status }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full bg-slate-900 py-4 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition flex items-center justify-center gap-4">
                عرض واجهة الإدارة الكاملة
                <Map className="h-4 w-4" />
            </button>
        </div>
    );
}
