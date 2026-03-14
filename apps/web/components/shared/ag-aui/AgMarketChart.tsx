import { TrendingUp, ArrowUpRight, Target } from "lucide-react";

interface AgMarketChartProps {
    title: string;
    trend: string;
    data: number[];
}

export default function AgMarketChart({ title, trend, data }: AgMarketChartProps) {
    const max = Math.max(...data);

    return (
        <div className="w-full bg-white p-6 rounded-none">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center bg-blue-50 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">تحليل السوق</div>
                        <h3 className="text-sm font-black uppercase tracking-normal text-slate-900">{title}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-blue-600">
                    <ArrowUpRight className="h-4 w-4" />
                    {trend}
                </div>
            </div>

            <div className="flex items-end gap-1.5 h-32 w-full">
                {data.map((v, i) => (
                    <div
                        key={i}
                        className="flex-1 bg-slate-100 hover:bg-blue-600 transition group relative"
                        style={{ height: `${(v / max) * 100}%` }}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-[10px] font-black bg-slate-900 text-white px-2 py-1">
                            {v}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 border-t-2 border-slate-100 pt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-slate-300" />
                    <span className="text-xs font-bold text-slate-400">توقعات الربع القادم: إيجابي</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline transition">
                    تحميل التقرير الكامل PDF
                </button>
            </div>
        </div>
    );
}
