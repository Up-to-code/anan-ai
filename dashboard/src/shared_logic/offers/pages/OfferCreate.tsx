import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ArrowRight,
    Tag,
    Globe,
    Lock,
    Search,
    Building2,
    Loader2,
} from "lucide-react";
import { useSharedOffers } from "@/shared_logic/hooks/useSharedOffers";
import { useSharedProperties } from "@/shared_logic/hooks/useSharedProperties";
import { useUserData } from "@/_core/hooks/useUserData";

export default function OfferCreate() {
    const navigate = useNavigate();
    const { createOffer, publishOffer } = useSharedOffers();
    const { properties, role } = useSharedProperties();
    const { isVerified } = useUserData();

    // Form state
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">("private");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId) {
            toast.error("يرجى اختيار العقار");
            return;
        }
        if (!price) {
            toast.error("يرجى إدخال السعر");
            return;
        }

        setIsSubmitting(true);
        try {
            // Mock check
            if (selectedPropertyId.startsWith("mock-")) {
                await new Promise((r) => setTimeout(r, 800));
                toast.success("تم إنشاء العرض بنجاح (بيانات تجريبية)");
                navigate(`/dashboard/${role}/offers`);
                return;
            }

            const offerId = await createOffer({
                propertyId: selectedPropertyId as any,
                price: Number(price),
                description: description || undefined,
                message: message || undefined,
                visibility,
                recipientEmail: visibility === "private" ? recipientEmail || undefined : undefined,
                recipientPhone: visibility === "private" ? recipientPhone || undefined : undefined,
            });
            if (isVerified) {
                await publishOffer({ id: offerId as any });
                toast.success("تم إنشاء ونشر العرض بنجاح");
            } else {
                toast.success("تم حفظ العرض كمسودة. أكمل التوثيق للنشر.");
            }
            navigate(`/dashboard/${role}/offers`);
        } catch {
            toast.error("فشل إنشاء العرض");
        } finally {
            setIsSubmitting(false);
        }
    };

    const MOCK_PROPERTIES = [
        { _id: "mock-1", title: "فيلا النرجس الفاخرة", address: "حي النرجس، الرياض", price: 3500000 },
        { _id: "mock-2", title: "شقة العارض الذكية", address: "حي العارض، الرياض", price: 850000 },
        { _id: "mock-3", title: "أرض تجارية الياسمين", address: "حي الياسمين، الرياض", price: 5200000 },
    ] as any[];
    const propertiesList = properties && properties.length > 0 ? properties : MOCK_PROPERTIES;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/dashboard/${role}/offers`)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                    <ArrowRight className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إنشاء عرض جديد</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        أرسل عرضك العقاري لوسيط محدد أو انشره للجميع
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Property Selector */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        اختر العقار
                    </div>
                    {!propertiesList ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                        </div>
                    ) : (
                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                            {propertiesList.map((p: any) => (
                                <label
                                    key={p._id}
                                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${selectedPropertyId === p._id
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 hover:border-slate-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="propertyId"
                                        value={p._id}
                                        checked={selectedPropertyId === p._id}
                                        onChange={() => {
                                            setSelectedPropertyId(p._id);
                                            if (!price) setPrice(String(p.price));
                                        }}
                                        className="accent-blue-600"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-slate-900">{p.title}</div>
                                        <div className="text-xs text-slate-500">{p.address}</div>
                                    </div>
                                    <div className="text-sm font-black text-blue-600 whitespace-nowrap">
                                        {p.price?.toLocaleString("ar-SA")} ر.س
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                {/* Visibility Toggle */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <div className="text-sm font-bold text-slate-900">نوع العرض</div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setVisibility("public")}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${visibility === "public"
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                                }`}
                        >
                            <Globe className="h-6 w-6" />
                            <span className="text-xs font-bold">عام</span>
                            <span className="text-[10px] text-slate-400 leading-tight text-center">
                                يظهر لجميع الوسطاء
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setVisibility("private")}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${visibility === "private"
                                ? "border-blue-500 bg-blue-50 text-blue-600"
                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                                }`}
                        >
                            <Lock className="h-6 w-6" />
                            <span className="text-xs font-bold">خاص</span>
                            <span className="text-[10px] text-slate-400 leading-tight text-center">
                                أرسل لوسيط محدد
                            </span>
                        </button>
                    </div>
                </div>

                {/* Recipient Search (Private only) */}
                {visibility === "private" && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                            <Search className="h-4 w-4 text-blue-600" />
                            ابحث عن المستلم
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            ابحث بالبريد الإلكتروني أو رقم الهاتف
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="البريد الإلكتروني"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                dir="ltr"
                            />
                            <input
                                type="tel"
                                value={recipientPhone}
                                onChange={(e) => setRecipientPhone(e.target.value)}
                                placeholder="رقم الهاتف"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                dir="ltr"
                            />
                        </div>
                    </div>
                )}

                {/* Price + Description */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Tag className="h-4 w-4 text-blue-600" />
                        تفاصيل العرض
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                            السعر (ر.س)
                        </label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                            وصف العرض
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="أضف وصفاً تفصيلياً للعرض (اختياري)..."
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                            رسالة للمستلم (اختياري)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="رسالة شخصية مختصرة..."
                            rows={2}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || !selectedPropertyId}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري الإرسال...
                        </>
                    ) : (
                        <>
                            <Tag className="h-4 w-4" />
                            {visibility === "public" ? "نشر العرض للجميع" : "إرسال العرض"}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
