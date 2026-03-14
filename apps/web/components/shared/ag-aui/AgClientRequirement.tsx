import { Target, MapPin, Wallet, Clock, Users, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";

/**
 * WHY:   The CRM layer needs compact, scan-friendly requirement cards for routing and matching.
 * WHAT:  Renders a mock "client requirement" card with budget/location/type and urgency context.
 * HOW:   Uses fixed placeholder values and simple layout primitives to keep this component presentational.
 */
export default function AgClientRequirement() {
    return (
        <div className="w-full bg-white p-6 flex flex-col gap-8 group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white relative">
                        <Target className="h-6 w-6" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 border-2 border-white rounded-none" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">طلب عميل نشط</div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">بطاقة &quot;طلب&quot; العميل</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-slate-400">مستوى الإلحاح</div>
                    <div className="text-xl font-black text-emerald-600 leading-none mt-1 italic">عالي جداً</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "الميزانية", value: "3.5M - 5M", icon: Wallet },
                    { label: "المنطقة", value: "شمال الرياض", icon: MapPin },
                    { label: "النوع", value: "فيلا سكنية", icon: Target }
                ].map((item, i) => (
                    <div key={i} className="p-4   bg-slate-50 flex flex-col gap-2 group-hover:border-blue-100 transition">
                        <item.icon className="h-4 w-4 text-blue-600" />
                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{item.label}</div>
                        <div className="text-xs font-black text-slate-900">{item.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">المتطلبات الإضافية</div>
                <div className="flex flex-wrap gap-2">
                    {["قرب من المترو", "شارع 20م+", "5 غرف نوم", "مسبح خاص"].map((tag, i) => (
                        <span key={i} className="px-3 py-1.5   text-xs font-bold text-slate-600 bg-slate-50 rounded-none">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-slate-950 p-6 flex items-center justify-between text-white border-2 border-slate-950">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 border-2 border-white/20 bg-white/5 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-[9px] font-black uppercase text-slate-500">الوسيط المسؤول</div>
                        <div className="text-sm font-black italic">أحمد السبيعي</div>
                    </div>
                </div>
                <button className="flex items-center gap-3 bg-blue-600 px-6 py-3 text-[9px] font-black uppercase hover:bg-blue-700 transition tracking-widest">
                    مطابقة الوحدات
                    <Zap className="h-4 w-4 -rotate-180" />
                </button>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-100">
                <Clock className="h-4 w-4 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400">تم البث قبل 14 دقيقة لـ 120 مطور ووسيط</p>
            </div>
        </div>
    );
}
