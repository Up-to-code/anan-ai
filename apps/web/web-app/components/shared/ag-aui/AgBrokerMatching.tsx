import { Users, Target, Link2, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrokerMatch {
    brokerName: string;
    requirement: string;
    matchScore: number;
    commission: string;
}

export default function AgBrokerMatching() {
    const matches: BrokerMatch[] = [
        {
            brokerName: "الوسيط فهد العتيبي",
            requirement: "عميل يبحث عن فيلا 450م في الملقا",
            matchScore: 98,
            commission: "2.5% مقسومة"
        },
        {
            brokerName: "سارة المنصور (عقارات النخبة)",
            requirement: "طلب استثمار فندقي - ميزانية 40M",
            matchScore: 85,
            commission: "اتفاق خاص"
        }
    ];

    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center bg-emerald-600 text-white">
                        <Zap className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">الربط الذكي للوسطاء</div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">مطابقة وسيط لوسيط</h3>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600">
                        <ShieldCheck className="h-4 w-4" />
                        نظام موثوق
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-400">2 مطابقة نشطة</div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">فرص التعاون المتاحة لمخزونك</div>

                {matches.map((match, i) => (
                    <div key={i} className="group relative   hover:border-emerald-500 transition-all p-6 bg-white cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-[2px] bg-emerald-500" />
                                <span className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition">
                                    {match.brokerName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">تطابق</span>
                                <span className="text-xl font-black text-emerald-600">%{match.matchScore}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50   border-l-emerald-500 flex flex-col gap-2">
                            <div className="text-[9px] font-black uppercase text-slate-400">متطلبات العميل لدى الوسيط</div>
                            <p className="text-xs font-bold text-slate-700 leading-relaxed">{match.requirement}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                <Link2 className="h-4 w-4" />
                                {match.commission}
                            </div>
                            <button className="flex items-center gap-2 bg-slate-950 px-6 py-3 text-[9px] font-black uppercase text-white hover:bg-emerald-600 transition tracking-widest">
                                طلب ربط الصفقة
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6   bg-slate-50/30 p-4 -mx-8 -mb-8 flex items-center justify-center gap-3">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase text-slate-400">يوجد 12 وسيطاً آخرين بطلبات مشابهة في المنطقة</span>
            </div>
        </div>
    );
}
