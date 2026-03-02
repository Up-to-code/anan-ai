import { useBrokerOffers } from "@/broker_zone/api/useBrokerData";
import { useRole } from "@/_core/hooks/useRole";
import { Link } from "react-router-dom";
import {
    Tag,
    Plus,
    Loader2,
    Clock,
    CheckCircle2,
    XCircle,
    Globe,
    Lock,
    ArrowUpRight,
} from "lucide-react";
import { cn } from "@/_core/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { useUserData } from "@/_core/hooks/useUserData";

/**
 * WHY:   Allows brokers to interact with the platform-wide P2P offers marketplace.
 * WHAT:  Renders tabs for managing personal sent offers versus browsing public offers.
 * HOW:   Acts as the Orchestrator for the Offers view. Uses `useBrokerOffers` for all marketplace interactions.
 */
export default function Offers() {
    const role = useRole();
    const { sentOffers, publicOffers, applyToOffer, publishOffer } = useBrokerOffers();
    const { isVerified } = useUserData();
    const [activeTab, setActiveTab] = useState<"my" | "public">("my");
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [publishingId, setPublishingId] = useState<string | null>(null);

    // Mock fallback
    const MOCK_SENT = [
        {
            _id: "mock-o1",
            propertyId: "mock-1",
            property: { title: "فيلا النرجس الفاخرة", address: "الرياض", price: 3500000 },
            price: 3400000,
            status: "pending",
            publicationState: "draft",
            visibility: "private",
            message: "عرض جاد للشراء كاش",
        },
        {
            _id: "mock-o2",
            propertyId: "mock-2",
            property: { title: "شقة العارض الذكية", address: "الرياض", price: 850000 },
            price: 850000,
            status: "accepted",
            publicationState: "published",
            visibility: "public",
            message: "",
        },
    ] as any[];

    const MOCK_PUBLIC = [
        {
            _id: "mock-pub1",
            property: { title: "فيلا حي السفارات", address: "الرياض", price: 4800000 },
            price: 4800000,
            status: "pending",
            publicationState: "published",
            visibility: "public",
            senderName: "شركة التطوير المتقدم",
            description: "نبحث عن وسيط لتسويق هذا المشروع السكني الفاخر",
        },
    ] as any[];

    const sentData = sentOffers === undefined ? undefined : (sentOffers.length > 0 ? sentOffers : MOCK_SENT);
    const publicData = publicOffers === undefined ? undefined : (publicOffers.length > 0 ? publicOffers : MOCK_PUBLIC);

    const handleApply = async (offerId: string) => {
        if (offerId.startsWith("mock-")) {
            toast.success("تم التقديم بنجاح (بيانات تجريبية)");
            return;
        }
        setApplyingId(offerId);
        try {
            await applyToOffer({ offerId: offerId as any, message: "أرغب في العمل على هذا العرض" });
            toast.success("تم التقديم بنجاح");
        } catch {
            toast.error("فشل التقديم");
        } finally {
            setApplyingId(null);
        }
    };

    const handlePublish = async (offerId: string) => {
        if (offerId.startsWith("mock-")) {
            toast.success("تم نشر المسودة (بيانات تجريبية)");
            return;
        }
        setPublishingId(offerId);
        try {
            await publishOffer({ id: offerId as any });
            toast.success("تم نشر العرض");
        } catch {
            toast.error("يتطلب نشر العرض توثيق الحساب");
        } finally {
            setPublishingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">العروض</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        أنشئ عروضاً عامة أو خاصة وتابع حالتها
                    </p>
                </div>
                <Link
                    to={`/dashboard/${role}/offers/create`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-bold whitespace-nowrap"
                >
                    <Plus className="h-4 w-4" />
                    إنشاء عرض جديد
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab("my")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === "my"
                            ? "bg-blue-600 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                    )}
                >
                    <Tag className="h-4 w-4" />
                    عروضي
                </button>
                <button
                    onClick={() => setActiveTab("public")}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all",
                        activeTab === "public"
                            ? "bg-blue-600 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                    )}
                >
                    <Globe className="h-4 w-4" />
                    العروض العامة
                </button>
            </div>

            {/* My Offers */}
            {activeTab === "my" && (
                <div>
                    {!sentData ? (
                        <LoadingState />
                    ) : sentData.length > 0 ? (
                        <div className="space-y-3">
                            {sentData.map((offer: any) => (
                                <div
                                    key={offer._id}
                                    className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <StatusBadge status={offer.status} />
                                            <VisibilityBadge visibility={offer.visibility} />
                                            <PublicationBadge state={offer.publicationState} />
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm">
                                            {offer.property?.title ?? "عقار"}
                                        </h3>
                                        {offer.message && (
                                            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                                                {offer.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-left shrink-0">
                                        {(offer.publicationState ?? "published") !== "published" && (
                                            <button
                                                onClick={() => handlePublish(offer._id)}
                                                disabled={!isVerified || publishingId === offer._id}
                                                className={cn(
                                                    "mb-2 w-full px-3 py-2 rounded-md text-[11px] font-bold transition-colors",
                                                    isVerified
                                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                )}
                                            >
                                                {publishingId === offer._id ? "جاري النشر..." : "نشر العرض"}
                                            </button>
                                        )}
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            قيمة العرض
                                        </div>
                                        <div className="text-lg font-black text-blue-600">
                                            {offer.price?.toLocaleString("ar-SA")} ر.س
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="لم تقم بإنشاء أي عروض بعد" />
                    )}
                </div>
            )}

            {/* Public Offers */}
            {activeTab === "public" && (
                <div>
                    {!publicData ? (
                        <LoadingState />
                    ) : publicData.length > 0 ? (
                        <div className="space-y-3">
                            {publicData.map((offer: any) => (
                                <div
                                    key={offer._id}
                                    className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-4"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <VisibilityBadge visibility="public" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                من: {offer.senderName}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm">
                                            {offer.property?.title ?? "عقار"}
                                        </h3>
                                        {offer.description && (
                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                {offer.description}
                                            </p>
                                        )}
                                        <div className="text-lg font-black text-blue-600">
                                            {offer.price?.toLocaleString("ar-SA")} ر.س
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col gap-2 shrink-0 items-start">
                                        <button
                                            onClick={() => handleApply(offer._id)}
                                            disabled={applyingId === offer._id}
                                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {applyingId === offer._id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            )}
                                            تقديم على العرض
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="لا يوجد عروض عامة حالياً" />
                    )}
                </div>
            )}
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 mb-4 animate-spin opacity-20" />
            <p className="text-sm font-bold tracking-tight">جاري التحميل...</p>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Tag className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-sm font-bold text-slate-400 tracking-tight">{message}</p>
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
        <div className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border", config.bg, config.text)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </div>
    );
}

function VisibilityBadge({ visibility }: { visibility?: string }) {
    if (visibility === "public") {
        return (
            <div className="px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border bg-blue-50 border-blue-200 text-blue-600">
                <Globe className="h-3 w-3" />
                عام
            </div>
        );
    }
    return (
        <div className="px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border bg-slate-50 border-slate-200 text-slate-500">
            <Lock className="h-3 w-3" />
            خاص
        </div>
    );
}

function PublicationBadge({ state }: { state?: string }) {
    const normalized = state ?? "published";
    if (normalized === "published") {
        return (
            <div className="px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border bg-emerald-50 border-emerald-200 text-emerald-600">
                منشور
            </div>
        );
    }
    return (
        <div className="px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 border bg-amber-50 border-amber-200 text-amber-700">
            مسودة
        </div>
    );
}
