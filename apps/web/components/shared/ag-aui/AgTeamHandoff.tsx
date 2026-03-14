import { Repeat, User, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export default function AgTeamHandoff() {
    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center bg-emerald-100 text-emerald-600  ">
                    <Repeat className="h-5 w-5" />
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">تعاون ذكي</div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">مقترح نقل المهمة</h3>
                </div>
            </div>

            <div className="flex items-center justify-between p-6   bg-slate-50/50 relative overflow-hidden">
                <div className="z-10 flex items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 bg-slate-900 flex items-center justify-center text-white">
                            <User className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-900">نظام الـ AI الحاضر</span>
                    </div>

                    <ArrowRight className="h-6 w-6 text-slate-300" />

                    <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 bg-blue-600 flex items-center justify-center text-white border-2 border-blue-100">
                            <User className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-blue-600">الوكيل خالد</span>
                    </div>
                </div>

                <div className="text-right z-10">
                    <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        متاح الآن
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400">زمن الاستجابة: أقل من دقيقتين</div>
                </div>

                <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-20" />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-300" />
                    <p className="text-xs font-bold text-slate-500">تم تجهيز ملف العميل وجاهز للنقل الفوري</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-3   bg-slate-900 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-600 hover:border-emerald-600 transition">
                    <CheckCircle2 className="h-4 w-4" />
                    تأكيد النقل
                </button>
                <button className="w-full bg-white py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 hover:border-slate-900 transition">
                    إرسال تنبيه للفريق
                </button>
            </div>
        </div>
    );
}
