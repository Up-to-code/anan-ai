import { Banknote, TrendingUp, Clock, ShieldCheck, ArrowRight, Wallet, Percent } from "lucide-react";

interface AgDealCardProps {
    title?: string;
    value?: string;
    commission?: string;
    closingProb?: number;
    daysActive?: number;
}

export default function AgDealCard({
    title = "بيع مجمع سكني - حي النرجس",
    value = "12,500,000 ر.س",
    commission = "2.5% (312.5K)",
    closingProb = 85,
    daysActive = 4
}: AgDealCardProps) {
    return (
        <div className="w-full bg-white overflow-hidden group">
            <div className="bg-slate-950 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-emerald-500 flex items-center justify-center">
                        <Banknote className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <div className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400">فرصة إغلاق نشطة</div>
                        <h4 className="text-sm font-black tracking-tight">{title}</h4>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[8px] font-black uppercase text-slate-500">القيمة التقديرية</div>
                    <div className="text-sm font-black text-emerald-400 leading-none">{value}</div>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4   bg-slate-50">
                        <div className="flex items-center gap-2 mb-1">
                            <Percent className="h-3 w-3 text-blue-600" />
                            <div className="text-[8px] font-black uppercase text-slate-400">العمولة المتوقعة</div>
                        </div>
                        <div className="text-xs font-black text-slate-900">{commission}</div>
                    </div>
                    <div className="p-4   bg-slate-50">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <div className="text-[8px] font-black uppercase text-slate-400">العمر في النظام</div>
                        </div>
                        <div className="text-xs font-black text-slate-900">{daysActive} أيام</div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <div className="text-[9px] font-black uppercase text-slate-400">احتمالية الإغلاق</div>
                        <div className="text-lg font-black text-slate-900">{closingProb}%</div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${closingProb}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-100">
                    <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                    <p className="text-[10px] font-bold text-blue-800 leading-tight">
                        تم التحقق من الملاءة المالية للمشتري وجاهز للتعاقد الفوري.
                    </p>
                </div>
            </div>

            <div className="flex border-t-2 border-slate-900">
                <button className="flex-1 bg-white py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:bg-slate-50 transition border-r-2 border-slate-900">
                    تبادل المستندات
                </button>
                <button className="flex-1 bg-slate-900 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                    إغلاق الصفقة
                    <ArrowRight className="h-4 w-4 -rotate-180" />
                </button>
            </div>
        </div>
    );
}
