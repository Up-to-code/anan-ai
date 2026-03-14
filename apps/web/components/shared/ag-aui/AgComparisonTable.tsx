import { Check, X, Building2, Ruler, BedDouble, Bath, TrendingUp } from "lucide-react";

interface PropertyData {
    name: string;
    price: string;
    area: string;
    beds: number;
    baths: number;
    isBestValue?: boolean;
}

interface AgComparisonTableProps {
    properties: PropertyData[];
}

export default function AgComparisonTable({ properties }: AgComparisonTableProps) {
    return (
        <div className="w-full bg-white overflow-hidden">
            <div className="flex bg-slate-50 border-b-2 border-slate-100">
                <div className="w-1/4 p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">المواصفات الفنية</div>
                {properties.map((p, i) => (
                    <div key={i} className="flex-1 p-4 text-center border-r-2 border-slate-100 last:border-r-0 relative">
                        {p.isBestValue && (
                            <div className="absolute top-0 left-0 right-0 bg-blue-600 px-2 py-0.5 text-[8px] font-black uppercase text-white">
                                أفضل قيمة
                            </div>
                        )}
                        <div className="text-xs font-black text-slate-900 mt-2 uppercase tracking-tight">{p.name}</div>
                    </div>
                ))}
            </div>

            <div className="divide-y-2 divide-slate-100">
                <div className="flex items-center">
                    <div className="w-1/4 p-4 flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-[10px] font-black uppercase text-slate-500">السعر الإجمالي</span>
                    </div>
                    {properties.map((p, i) => (
                        <div key={i} className="flex-1 p-4 text-center text-sm font-black text-blue-600 border-r-2 border-slate-100 last:border-r-0">
                            {p.price}
                        </div>
                    ))}
                </div>

                <div className="flex items-center">
                    <div className="w-1/4 p-4 flex items-center gap-2">
                        <Ruler className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-[10px] font-black uppercase text-slate-500">المساحة الصافية</span>
                    </div>
                    {properties.map((p, i) => (
                        <div key={i} className="flex-1 p-4 text-center text-[11px] font-bold text-slate-700 border-r-2 border-slate-100 last:border-r-0">
                            {p.area}
                        </div>
                    ))}
                </div>

                <div className="flex items-center">
                    <div className="w-1/4 p-4 flex items-center gap-2">
                        <BedDouble className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-[10px] font-black uppercase text-slate-500">غرف النوم</span>
                    </div>
                    {properties.map((p, i) => (
                        <div key={i} className="flex-1 p-4 text-center text-[11px] font-bold text-slate-700 border-r-2 border-slate-100 last:border-r-0">
                            {p.beds}
                        </div>
                    ))}
                </div>

                <div className="flex items-center">
                    <div className="w-1/4 p-4 flex items-center gap-2">
                        <Bath className="h-3.5 w-3.5 text-slate-300" />
                        <span className="text-[10px] font-black uppercase text-slate-500">دورات المياه</span>
                    </div>
                    {properties.map((p, i) => (
                        <div key={i} className="flex-1 p-4 text-center text-[11px] font-bold text-slate-700 border-r-2 border-slate-100 last:border-r-0">
                            {p.baths}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex bg-slate-50 p-4 gap-4">
                <div className="w-1/4" />
                {properties.map((p, i) => (
                    <button key={i} className="flex-1   bg-slate-900 py-3 px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-600 hover:border-blue-600 transition rounded-none">
                        اختيار هذا العقار
                    </button>
                ))}
            </div>
        </div>
    );
}
