import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "convex/_generated/dataModel";
import { Loader2, ArrowRight, Bed, Bath, Square, MapPin, Edit, Trash2, ChevronRight, ChevronLeft, Building2, Tag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/_core/lib/utils";
import { OfferModal } from "@/shared_logic/offers/components/OfferModal";
import { useSharedProperties } from "@/shared_logic/hooks/useSharedProperties";
import { useUserData } from "@/_core/hooks/useUserData";

export default function PropertyDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { deleteProperty, publishProperty, getPropertyDetail, role } = useSharedProperties();
    const { isVerified } = useUserData();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    const property = getPropertyDetail(id);

    const handleDelete = async () => {
        if (!id || !window.confirm("هل أنت متأكد من حذف هذا العقار؟")) return;
        try {
            await deleteProperty(id);
            toast.success("تم حذف العقار بنجاح");
            navigate(`/dashboard/${role}/properties`);
        } catch (error) {
            toast.error("فشل في حذف العقار");
        }
    };

    const handlePublish = async () => {
        if (!id) return;
        try {
            await publishProperty(id);
            toast.success("تم نشر العقار");
        } catch {
            toast.error("يتطلب نشر العقار توثيق الحساب");
        }
    };

    if (!property) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const images = property.imageIds || (property.imageId ? [property.imageId] : []);

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        to={`/dashboard/${role}/properties`}
                        className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{property.title}</h1>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-0.5 font-medium">
                            <MapPin className="h-3.5 w-3.5" />
                            {property.address}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {property.isOwner ? (
                        <>
                            {(property.publicationState ?? "published") !== "published" && (
                                <button
                                    onClick={handlePublish}
                                    disabled={!isVerified}
                                    className={cn(
                                        "px-4 py-2 rounded-md text-xs font-bold transition-colors flex items-center gap-2",
                                        isVerified
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed",
                                    )}
                                >
                                    نشر
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-md text-xs font-bold transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                حذف
                            </button>
                            <Link
                                to={`/dashboard/${role}/properties/${id}/edit`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-200"
                            >
                                <Edit className="h-4 w-4" />
                                تعديل البيانات
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsOfferModalOpen(true)}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <Tag className="h-4 w-4" />
                            إرسال عرض مالي
                        </button>
                    )}
                </div>
            </div>

            <OfferModal
                property={property as any}
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Images & Description */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                            {images.length > 0 ? (
                                <ImageLoader id={images[activeImageIndex]} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                    <span className="text-xs font-bold uppercase tracking-widest">لا توجد صور</span>
                                </div>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                                        className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-700 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                                        className="absolute top-1/2 -translate-y-1/2 left-4 p-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-slate-700 hover:bg-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {images.map((imgId, idx) => (
                                    <button
                                        key={imgId}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={cn(
                                            "relative h-20 w-32 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all",
                                            activeImageIndex === idx ? "border-blue-600 ring-2 ring-blue-500/10" : "border-transparent hover:border-slate-300"
                                        )}
                                    >
                                        <ImageLoader id={imgId} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            عن العقار
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                            {property.description}
                        </p>
                    </div>
                </div>

                {/* Right Column: Key Details & Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">السعر المطلـوب</label>
                            <div className="text-3xl font-black text-blue-600">
                                {property.price.toLocaleString("ar-SA")} <span className="text-sm font-bold text-slate-400 mr-1">ر.س</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400">
                                    <Bed className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900">{property.beds}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">غرف نوم</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
                                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400">
                                    <Bath className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-900">{property.baths}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">دورات مياه</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-400">
                                <Square className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900">{property.sqft?.toLocaleString() || "—"} <span className="text-[10px] font-bold text-slate-400 mr-1">م²</span></div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">المساحة الإجمالية</div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <div className={cn(
                                "w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider",
                                property.status === "available" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    property.status === "reserved" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                        "bg-slate-100 text-slate-500 border border-slate-200"
                            )}>
                                <div className={cn("h-2 w-2 rounded-full",
                                    property.status === "available" ? "bg-emerald-500 animate-pulse" :
                                        property.status === "reserved" ? "bg-amber-500" : "bg-slate-400"
                                )} />
                                {property.status === "available" ? "متـاح حالياً" :
                                    property.status === "reserved" ? "محجـوز" : "تم البيع"}
                            </div>
                            <div className="mt-2 text-[11px] font-bold text-slate-500">
                                حالة النشر: {(property.publicationState ?? "published") === "published" ? "منشور" : "مسودة"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ImageLoader({ id, className }: { id: Id<"_storage">; className?: string }) {
    const { utils } = useSharedProperties();
    const url = utils.getImageUrl(id);
    if (!url) return <div className={cn("bg-slate-100 animate-pulse", className)} />;
    return <img src={url} alt="" className={className} />;
}

function ImageIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    );
}
