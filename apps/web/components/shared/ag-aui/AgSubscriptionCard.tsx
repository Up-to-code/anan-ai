import { CreditCard, ShieldCheck, Zap, ArrowRight, Package } from "lucide-react";

interface AgSubscriptionCardProps {
    plan?: string;
    price?: string;
    features?: string[];
}

export default function AgSubscriptionCard({
    plan = "المؤسسات (Enterprise)",
    price = "9,999 ر.س",
    features = [
        "وصول كامل لمحرك الذكاء الاصطناعي",
        "تقارير استخبارات السوق اللحظية",
        "إدارة غير محدودة للمشاريع",
        "تكامل مباشر مع أنظمة CRM"
    ]
}: AgSubscriptionCardProps) {
    return (
        <div className="w-full bg-white overflow-hidden shadow-none">
            <div className="bg-slate-950 p-10 text-center relative border-b-2 border-slate-900">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                <div className="h-16 w-16 bg-blue-600 flex items-center justify-center mx-auto mb-6">
                    <Package className="h-8 w-8 text-white" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">توصية الترقية الذكية</div>
                <h3 className="text-3xl font-black tracking-tight text-white mb-4 italic uppercase italic">{plan}</h3>
                <div className="text-xl font-bold text-white/50">{price} <span className="text-xs uppercase tracking-widest">/ شهر</span></div>
            </div>

            <div className="p-10 flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-4 text-right" dir="rtl">
                            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-xs font-bold text-slate-700 leading-tight">{feature}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-50   p-6 flex flex-col gap-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">نظام الدفع المختار</div>
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        <span>الفاتورة الشهرية</span>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </div>
                </div>

                <button className="w-full bg-blue-600 py-5 text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-slate-950 transition-all flex items-center justify-center gap-4 group">
                    ترقية الحساب الآن
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </button>
            </div>
        </div>
    );
}
