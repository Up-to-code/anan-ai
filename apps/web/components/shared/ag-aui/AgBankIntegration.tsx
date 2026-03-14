import { CreditCard, Landmark, CheckCircle2, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY:   Broker/developer workspaces need quick visibility into banking connectivity and balances.
 * WHAT:  Renders a stylized "bank integration" status panel with mock-linked accounts and a CTA.
 * HOW:   Uses a static local array to render account cards and a security note, without calling backend services.
 */
export default function AgBankIntegration() {
    const accounts = [
        { name: "حساب الجاري - مصرف الراجحي", balance: "1,240,000", status: "نشط", lastSync: "منذ دقيقتين" },
        { name: "حساب الاستثمار - بنك الإنماء", balance: "3,500,000", status: "نشط", lastSync: "منذ ساعة" }
    ];

    return (
        <div className="w-full bg-white overflow-hidden shadow-none max-w-2xl">
            <div className="bg-slate-950 p-8 flex justify-between items-center border-b-2 border-slate-900">
                <div className="flex items-center gap-5">
                    <div className="h-12 w-12 bg-blue-600 flex items-center justify-center">
                        <Landmark className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">الربط البنكي</div>
                        <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic">التدفق المالي الموحد</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border-2 border-emerald-500">
                    <div className="h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">متصل الآن</span>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-8">
                <div className="grid grid-cols-1 gap-4">
                    {accounts.map((acc, i) => (
                        <div key={i} className="  p-6 flex justify-between items-center hover:border-blue-600 transition-all bg-slate-50/30">
                            <div className="flex items-center gap-6">
                                <div className="h-10 w-10 bg-white   flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-slate-900" />
                                </div>
                                <div className="text-right" dir="rtl">
                                    <div className="text-sm font-black text-slate-900 mb-1">{acc.name}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">آخر مزامنة: {acc.lastSync}</div>
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="text-xl font-black text-slate-950 tabular-nums">
                                    {acc.balance} <span className="text-[10px] text-blue-600">ر.س</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50/50 border-2 border-blue-100 p-6 flex items-start gap-4">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-slate-700 leading-relaxed italic" dir="rtl">
                        &quot;يتم تتبع التدفقات النقدية والتحقق من صحة المعاملات عبر بروتوكول المصرفية المفتوحة. جميع البيانات مشفرة وفق معايير المؤسسة.&quot;
                    </p>
                </div>
            </div>

            <button className="w-full bg-slate-950 py-5 text-white text-[10px] font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 group">
                إدارة الحسابات المربوطة
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
        </div>
    );
}
