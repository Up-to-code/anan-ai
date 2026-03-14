import { Building2, Users, CheckCircle2, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";

interface AgProjectUpdateProps {
    name?: string;
    completion?: number;
    activeBrokers?: number;
    lastMilestone?: string;
}

export default function AgProjectUpdate({
    name = "مشروع أعالي الملقا",
    completion = 75,
    activeBrokers = 12,
    lastMilestone = "تم الانتهاء من صب الخرسانة للدور الرابع"
}: AgProjectUpdateProps) {
    return (
        <div className="w-full bg-white p-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">تحديثات المطور</div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">{name}</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-slate-400">حالة الإنجاز</div>
                    <div className="text-3xl font-black text-blue-600">{completion}%</div>
                </div>
            </div>

            <div className="h-4 w-full bg-slate-100 relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000"
                    style={{ width: `${completion}%` }}
                />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50   text-slate-900 group">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase text-slate-400">الوسطاء النشطون</div>
                        <div className="text-xl font-black text-slate-900">{activeBrokers} وكيل</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 border-2 border-emerald-100 text-emerald-600">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase text-slate-400">معدل البيع</div>
                        <div className="text-xl font-black text-emerald-600">+12% / شهر</div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50   p-6 flex items-start gap-4">
                <div className="p-2 bg-white   text-blue-600 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2 mb-1">
                        <Calendar className="h-3 w-3" />
                        آخر إنجاز محقق
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{lastMilestone}</p>
                </div>
            </div>

            <button className="w-full   py-3 px-6 text-xs font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition flex items-center justify-center gap-3 rounded-none">
                فتح لوحة التحكم الكاملة للمطور
                <ArrowUpRight className="h-4 w-4" />
            </button>
        </div>
    );
}
