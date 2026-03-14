import { Calculator, TrendingUp, DollarSign, Percent, PieChart } from "lucide-react";

export default function AgInvestmentCalculator() {
    return (
        <div className="w-full bg-white p-6 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center bg-blue-600 text-white">
                        <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">رؤى مالية ذكية</div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">حاسبة الاستثمار</h3>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black uppercase text-slate-400">العائد المتوقع</div>
                    <div className="text-2xl font-black text-emerald-600">8.4%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                            <span>سعر الشراء</span>
                            <span className="text-slate-900">4,200,000 ر.س</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 relative">
                            <div className="absolute top-0 left-0 h-full w-[60%] bg-blue-600" />
                            <div className="absolute top-1/2 left-[60%] -translate-y-1/2 h-4 w-4   bg-white" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                            <span>الدفعة الأولى (20%)</span>
                            <span className="text-slate-900">840,000 ر.س</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 relative">
                            <div className="absolute top-0 left-0 h-full w-[20%] bg-blue-600" />
                            <div className="absolute top-1/2 left-[20%] -translate-y-1/2 h-4 w-4   bg-white" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                            <span>نسبة الفائدة</span>
                            <span className="text-slate-900">4.5%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 relative">
                            <div className="absolute top-0 left-0 h-full w-[45%] bg-blue-600" />
                            <div className="absolute top-1/2 left-[45%] -translate-y-1/2 h-4 w-4   bg-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50   p-8 flex flex-col justify-between">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PieChart className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase text-slate-500 font-black">القسط الشهري</span>
                            </div>
                            <div className="text-xl font-black text-slate-900">17,400 ر.س</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase text-slate-500 font-black">تقدير زيادة القيمة</span>
                            </div>
                            <div className="text-xl font-black text-emerald-600">+12% / سنوياً</div>
                        </div>
                    </div>

                    <button className="mt-6 w-full   bg-blue-600 py-3 px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-700 hover:border-blue-700 transition rounded-none">
                        توليد تقرير تفصيلي
                    </button>
                </div>
            </div>
        </div>
    );
}
