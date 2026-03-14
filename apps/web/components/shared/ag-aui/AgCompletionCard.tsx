import { CheckCircle2, Star, Rocket, Shield, ArrowRight, Share2 } from "lucide-react";

export default function AgCompletionCard() {
    return (
        <div className="border-4 border-slate-900 bg-white p-10 flex flex-col gap-10 relative overflow-hidden group">
            <div className="relative flex flex-col items-center text-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center border-2 border-slate-950 bg-slate-950 text-white rounded-none">
                    <Rocket className="h-10 w-10 text-blue-400" />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-600">اكتملت المهمة</div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase">تم استعراض المنظومة بنجاح</h2>
                    <p className="text-sm font-bold text-slate-500 max-w-md mx-auto leading-relaxed">
                        لقد أكملت الجولة الشاملة في نظام أنان برو. محركك الآن مجهز بأحدث أدوات الذكاء الاصطناعي العقاري لإدارة، تحليل، وإغلاق الصفقات بكفاءة غير مسبوقة.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {[
                    { label: "مكون ذكي", value: "35+", icon: Star },
                    { label: "دقة البيانات", value: "99.9%", icon: Shield },
                    { label: "جاهزية النظام", value: "100%", icon: CheckCircle2 }
                ].map((stat, i) => (
                    <div key={i} className="  p-6 flex flex-col items-center gap-3 bg-slate-50">
                        <stat.icon className="h-5 w-5 text-blue-600" />
                        <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-6">
                <button className="flex-1 border-2 border-slate-950 bg-slate-950 py-4 px-8 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-600 hover:border-blue-600 transition flex items-center justify-center gap-4 rounded-none">
                    <span>تفعيل المنظومة الآن</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
                <button className="flex-1   py-4 px-8 text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition flex items-center justify-center gap-4 rounded-none">
                    <Share2 className="h-4 w-4" />
                    <span>مشاركة التقرير النهائي</span>
                </button>
            </div>

            <div className="text-center">
                <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] border-2 border-emerald-100">
                    أنت الآن تستخدم أقوى بنية تحتية عقارية في المنطقة
                </div>
            </div>
        </div>
    );
}
