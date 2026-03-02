import { Building2, Plus, ListFilter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useZoneProperties } from "@/red_zone/api/useREDData";
import { PropertyCard } from "@/shared_logic/properties/components/PropertyCard";
import { useState } from "react";

const MOCK_PROPERTIES = [
    {
        _id: "mock-1",
        title: "فيلا النرجس الفاخرة",
        address: "حي النرجس، الرياض",
        price: 3500000,
        beds: 5,
        baths: 6,
        status: "available",
        imageIds: [],
    },
    {
        _id: "mock-2",
        title: "شقة العارض الذكية",
        address: "حي العارض، الرياض",
        price: 850000,
        beds: 3,
        baths: 3,
        status: "reserved",
        imageIds: [],
    },
    {
        _id: "mock-3",
        title: "أرض تجارية الياسمين",
        address: "حي الياسمين، الرياض",
        price: 5200000,
        beds: 0,
        baths: 0,
        status: "available",
        imageIds: [],
    }
] as any[];


/**
 * WHY:   Allows developers to manage their property portfolio and track individual project status.
 * WHAT:  Renders a grid of property cards with a filtering/search capability.
 * HOW:   Designed as an Orchestrator. Fetches data via `useZoneProperties` and delegates rendering to `PropertyCard`.
 */
export default function Projects() {
    const { properties, role } = useZoneProperties();
    const [search, setSearch] = useState("");

    const propertiesData = properties && properties.length > 0 ? properties : MOCK_PROPERTIES;

    const filtered = propertiesData?.filter(p =>
        p.title.includes(search) || p.address.includes(search)
    ) || [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">العقارات</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        إدارة عقاراتك ومشاريعك الحالية في مكان واحد
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to={`/dashboard/${role}/properties/create`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-bold whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" />
                        إضافة عقار جديد
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث عن عقار..."
                        className="pr-10 pl-4 py-2 bg-slate-50 border-none rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                        <ListFilter className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {!properties ? (
                <div className="bg-white rounded-xl border border-slate-200 min-h-[300px] flex items-center justify-center">
                    <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((property) => (
                        <PropertyCard
                            key={property._id}
                            property={property}
                            href={`/dashboard/${role}/properties/${property._id}`}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[500px] flex flex-col items-center justify-center text-center p-12">
                    <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                        <Building2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">لا توجد عقارات حالياً</h3>
                    <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">
                        ابدأ بإضافة أول عقار لك للوصول إلى شبكة واسعة من العملاء والوسطاء العقاريين.
                    </p>
                    <div className="mt-8">
                        <Link
                            to={`/dashboard/${role}/properties/create`}
                            className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-bold"
                        >
                            <Plus className="h-4 w-4" />
                            إضافة عقارك الأول
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
