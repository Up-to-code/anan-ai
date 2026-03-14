import { PieChart, TrendingUp, Building2, Wallet, ArrowUpRight } from "lucide-react";

export default function AgPortfolioSummary() {
    return (
        <div className="w-full bg-white p-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center bg-slate-950 text-white">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">إدارة الأصول</div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">نظرة عامة على المحفظة</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-slate-400">إجمالي قيمة الأصول</div>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter">12,450,000 ر.س</div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "الوحدات النشطة", value: "24", icon: Building2, color: "text-blue-600" },
                    { label: "نسبة الإشغال", value: "92%", icon: PieChart, color: "text-emerald-600" },
                    { label: "العائد السنوي", value: "8.4%", icon: TrendingUp, color: "text-blue-600" },
                    { label: "الدخل الشهري", value: "112K", icon: Wallet, color: "text-slate-950" }
                ].map((stat, i) => (
                    <div key={i} className="  bg-slate-50/50 p-5 flex flex-col gap-1">
                        <stat.icon className={cn("h-4 w-4 mb-2", stat.color)} />
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                        <div className="text-xl font-black text-slate-900">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="pt-6   flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">تم إضافة وحدة جديدة (فيلا الملقا) إلى المحفظة بالأمس</p>
                <button className="flex items-center gap-2   bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-blue-600 hover:border-blue-600 transition">
                    عرض جميع الأصول
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
