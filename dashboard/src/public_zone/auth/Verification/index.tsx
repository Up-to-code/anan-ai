import { ShieldAlert, Upload, FileText, CheckCircle2 } from "lucide-react";

/**
 * WHY:   Creates a secure holding area for users who need administrative verification before accessing platform tools.
 * WHAT:  Displays the verification status and a document upload mock-form for restricted accounts.
 * HOW:   Designed as a static view waiting for backend role/verification status updates.
 */
export default function Verification() {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-amber-50/50 blur-[120px]" />

            <div className="relative z-10 mx-auto w-full max-w-2xl space-y-8">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-amber-50 flex items-center justify-center rounded-xl border border-amber-100">
                        <ShieldAlert className="w-8 h-8 text-amber-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">توثيق الحساب</h1>
                        <p className="text-slate-500 max-w-md mx-auto">
                            حسابك التجاري قيد المراجعة حالياً أو يتطلب رفع مستندات التوثيق الرسمية للبدء.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <h3>حالة الطلب</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">نوع الحساب</span>
                                <span className="font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded-md">حساب تجاري</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">الحالة</span>
                                <span className="font-bold text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-md">بانتظار المستندات</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                            لضمان أمان المنصة، يجب توثيق جميع الوسطاء والمطورين العقاريين من قبل الإدارة قبل الوصول الكامل للمميزات.
                        </p>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-center gap-2 text-slate-900 font-bold">
                            <Upload className="h-5 w-5 text-blue-600" />
                            <h3>رفع المستندات</h3>
                        </div>
                        <div className="group cursor-pointer border-2 border-dashed border-slate-200 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center space-y-2">
                            <div className="h-10 w-10 bg-slate-50 rounded-md flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                                <FileText className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <div className="text-xs font-bold text-slate-900">السجل التجاري / الهوية</div>
                            <div className="text-[10px] text-slate-400">PDF, JPG (أقصى حجم 5MB)</div>
                        </div>
                        <button className="w-full h-10 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors">
                            إرسال للمراجعة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
