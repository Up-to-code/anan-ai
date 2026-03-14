import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgApprovalCardProps {
    title: string;
    description: string;
    type?: "info" | "warning" | "success";
    onApprove?: () => void;
    onReject?: () => void;
}

export default function AgApprovalCard({
    title,
    description,
    type = "info",
}: AgApprovalCardProps) {
    return (
        <div className="w-full bg-white p-6 flex flex-col gap-6">
            <div className="flex items-start gap-4">
                <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center border-2",
                    type === "info" && "bg-blue-50 border-blue-100 text-blue-600",
                    type === "warning" && "bg-amber-50 border-amber-100 text-amber-600",
                    type === "success" && "bg-emerald-50 border-emerald-100 text-emerald-600"
                )}>
                    {type === "info" && <AlertCircle className="h-5 w-5" />}
                    {type === "warning" && <AlertCircle className="h-5 w-5" />}
                    {type === "success" && <CheckCircle2 className="h-5 w-5" />}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">مطلوب موافقتك الرسمية</div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">{title}</h3>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed">{description}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-100">
                <button className="flex items-center justify-center gap-2   bg-slate-900 py-3 px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-600 hover:border-blue-600 transition rounded-none">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    تأكيد الموافقة
                </button>
                <button className="flex items-center justify-center gap-2   bg-white py-3 px-6 text-xs font-black uppercase tracking-widest text-slate-900 hover:border-red-600 hover:text-red-600 transition rounded-none">
                    <XCircle className="h-3.5 w-3.5" />
                    رفض الطلب
                </button>
            </div>
        </div>
    );
}
