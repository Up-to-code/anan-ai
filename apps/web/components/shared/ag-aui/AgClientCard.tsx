import { User, Shield, Briefcase, TrendingUp, Mail, Phone, MessageSquare } from "lucide-react";

export default function AgClientCard() {
    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="h-24 w-24 shrink-0 bg-slate-950 flex items-center justify-center text-white relative">
                    <User className="h-12 w-12" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 text-white">
                        <Shield className="h-4 w-4" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">عبدالرحمن أحمد</h3>
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 text-[9px] font-black uppercase  ">
                                مستثمر VIP
                            </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs font-bold text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" />
                                رائد أعمال تقني
                            </div>
                            <span className="h-4 w-px bg-slate-100" />
                            <div>الرياض، المملكة العربية السعودية</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4   bg-slate-50/50">
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">القوة الاستثمارية</div>
                            <div className="mt-1 text-lg font-black text-slate-900">25M - 50M ر.س</div>
                        </div>
                        <div className="p-4   bg-slate-50/50">
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">مؤشر الثقة</div>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="h-2 w-full bg-slate-200">
                                    <div className="h-full w-[94%] bg-emerald-500" />
                                </div>
                                <span className="text-sm font-black text-emerald-600 text-right">94%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4  ">
                <button className="flex-1   bg-slate-950 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-blue-600 hover:border-blue-600 transition flex items-center justify-center gap-3">
                    <MessageSquare className="h-3.5 w-3.5" />
                    إدارة علاقات العملاء
                </button>
                <button className="p-4   text-slate-400 hover:border-blue-600 hover:text-blue-600 transition">
                    <Mail className="h-4 w-4" />
                </button>
                <button className="p-4   text-slate-400 hover:border-blue-600 hover:text-blue-600 transition">
                    <Phone className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
