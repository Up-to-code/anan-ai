import { Link } from "react-router-dom";
import { Plus, Building2, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/_core/lib/utils";
import { PropertyCard } from "@/shared_logic/properties/components/PropertyCard";
import { useSharedProperties } from "@/shared_logic/hooks/useSharedProperties";

export default function PropertyList() {
    const { properties, role, isLoading, isBootstrap } = useSharedProperties();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStatus, setActiveStatus] = useState<string>("all");

    const filteredProperties = properties.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = activeStatus === "all" || p.status === activeStatus;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }
    if (isBootstrap) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <p className="text-sm font-medium">جارٍ تهيئة الجلسة، أعد المحاولة إذا استمر الانتظار.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إدارة العقارات</h1>
                    <p className="text-sm text-slate-500 mt-0.5 font-medium">قائمة بجميع الوحدات العقارية الخاصة بك في المنصة</p>
                </div>
                <Link
                    to={`/dashboard/${role}/properties/create`}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                >
                    <Plus className="h-4 w-4" />
                    إضافة عقار جديد
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Filters Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="البحث بالاسم أو العنوان..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                        {["all", "available", "reserved", "sold"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveStatus(status)}
                                className={cn(
                                    "px-4 py-1.5 text-[10px] font-bold rounded-md border transition-all whitespace-nowrap uppercase tracking-wider",
                                    activeStatus === status
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-100"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                )}
                            >
                                {status === "all" ? "الكل" : status === "available" ? "متاح" : status === "reserved" ? "محجوز" : "تم البيع"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Property Grid */}
                <div className="p-6">
                    {filteredProperties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties.map((property) => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    href={`/dashboard/${role}/properties/${property._id}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Building2 className="h-16 w-16 mb-4 opacity-10" />
                            <p className="text-sm font-bold tracking-tight">لا توجد عقارات تتطابق مع بحثك</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
