import { Loader2, Inbox as InboxIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/_core/lib/utils";
import { toast } from "sonner";
import { useSharedGeneralInbox } from "../hooks/useSharedGeneral";

const MOCK_RECEIVED_OFFERS = [
    {
        _id: "mock-ro1",
        propertyId: "mock-p1",
        property: { title: "أرض تجارية بالياسمين", address: "الرياض", price: 5200000, beds: 0, baths: 0, status: "available" },
        senderName: "عبدالله السالم",
        price: 5200000,
        message: "مستعدون للتوقيع غداً للمشتري مع سعي",
        status: "pending",
    },
    {
        _id: "mock-ro2",
        propertyId: "mock-p2",
        property: { title: "شقة دوبلكس العقيق", address: "الرياض", price: 1100000, beds: 4, baths: 4, status: "reserved" },
        senderName: "شركة الرمال",
        price: 1100000,
        message: "",
        status: "accepted",
    }
] as any[];

export default function Inbox() {
    const { receivedOffers, updateStatus } = useSharedGeneralInbox();

    const receivedOffersData = receivedOffers === undefined ? undefined : (receivedOffers.length > 0 ? receivedOffers : MOCK_RECEIVED_OFFERS);

    const handleStatusUpdate = async (id: any, status: "accepted" | "rejected") => {
        try {
            await updateStatus({ id, status });
            toast.success(status === "accepted" ? "تم قبول العرض" : "تم رفض العرض");
        } catch {
            toast.error("فشل تحديث حالة العرض");
        }
    };

    return (
        <div className="space-y-8">
            <div className="px-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">صندوق الوارد</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    العروض المستلمة من الوسطاء والمطورين — قم بالقبول أو الرفض
                </p>
            </div>

            {!receivedOffersData ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="h-8 w-8 mb-4 animate-spin opacity-20" />
                    <p className="text-sm font-bold tracking-tight">جاري التحميل...</p>
                </div>
            ) : receivedOffersData.length > 0 ? (
                <div className="space-y-4">
                    {receivedOffersData.map((offer) => (
                        <div key={offer._id} className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                {/* Left: Offer Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <StatusBadge status={offer.status} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            من: {offer.senderName}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900">
                                        عرض على: <span className="text-blue-600">{offer.property?.title || "عقار"}</span>
                                    </h3>
                                    <div className="flex items-center gap-6 flex-wrap">
                                        <div>
                                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">قيمة العرض</div>
                                            <div className="text-xl font-black text-blue-600 mt-0.5">{offer.price.toLocaleString("ar-SA")} ر.س</div>
                                        </div>
                                    </div>
                                    {offer.message && (
                                        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg italic">"{offer.message}"</p>
                                    )}
                                </div>

                                {/* Right: Actions */}
                                {offer.status === "pending" && (
                                    <div className="flex sm:flex-col gap-2 shrink-0">
                                        <button
                                            onClick={() => handleStatusUpdate(offer._id, "accepted")}
                                            className="flex-1 sm:w-32 py-2.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            قبول
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(offer._id, "rejected")}
                                            className="flex-1 sm:w-32 py-2.5 bg-white text-rose-500 border border-rose-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            رفض
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <InboxIcon className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 tracking-tight">لا يوجد عروض مستلمة حالياً</p>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs: Record<string, { bg: string; text: string; icon: any; label: string }> = {
        pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", icon: Clock, label: "بانتظار الرد" },
        accepted: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-600", icon: CheckCircle2, label: "مقبول" },
        rejected: { bg: "bg-rose-50 border-rose-200", text: "text-rose-600", icon: XCircle, label: "مرفوض" },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
        <div className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border", config.bg, config.text)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </div>
    );
}
