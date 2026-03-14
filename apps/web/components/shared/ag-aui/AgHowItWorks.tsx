import { HelpCircle, ArrowRight, Shield, Zap, Search, MessageSquare } from "lucide-react";

export default function AgHowItWorks() {
    const steps = [
        {
            icon: Search,
            title: "البحث والتحليل",
            description: "يقوم النظام بمسح آلاف الوحدات العقارية وتحليل بيانات السوق اللحظية في جميع أحياء الرياض."
        },
        {
            icon: Zap,
            title: "المطابقة الذكية",
            description: "يتم ربط طلبات العملاء بالمخزون المباشر وتحديد أفضل الوسطاء لإغلاق الصفقة بناءً على الأداء."
        },
        {
            icon: MessageSquare,
            title: "التفاوض المباشر",
            description: "توفير قنوات اتصال آمنة ومركز تفاوض رقمي لتحديد الشروطCommission وخطط الدفع."
        },
        {
            icon: Shield,
            title: "التوثيق القانوني",
            description: "توليد العقود والمستندات الرسمية وتجهيزها للتوقيع الرقمي لضمان حقوق كافة الأطراف."
        }
    ];

    return (
        <div className="w-full bg-white p-8 flex flex-col gap-10 group">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">كيف يعمل النظام</div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight uppercase">مسار عمل المنتج</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {steps.map((step, i) => (
                    <div key={i} className="flex gap-5 group/item">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center   bg-slate-50 text-slate-400 group-hover/item:bg-blue-600 group-hover/item:border-blue-600 group-hover/item:text-white transition-all">
                            <step.icon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{step.title}</h4>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-8  ">
                <button className="flex items-center gap-4 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] hover:gap-6 transition-all group/btn">
                    <span>ابدأ رحلتك العقارية الآن</span>
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
