import { useAdminBrokers } from "@/admin_zone/api/useAdminBrokers";
import { useRole } from "@/_core/hooks/useRole";
import { BrokerCard } from "@/broker_zone/components/BrokerCard";
import { REDCard } from "@/red_zone/components/REDCard";
import { Search, ListFilter, Users } from "lucide-react";
import { useState } from "react";

const MOCK_BROKERS = [
    { _id: "mock-b1", name: "خالد المحمد", company: "الرؤية العقارية", location: "الرياض", rating: 4.8, dealsCount: 24 },
    { _id: "mock-b2", name: "سعد السالم", company: "السالم للعقارات", location: "جدة", rating: 4.5, dealsCount: 18 },
    { _id: "mock-b3", name: "محمد العتيبي", company: "دار الوسطاء", location: "الدمام", rating: 4.9, dealsCount: 31 },
] as any[];

const MOCK_REDS = [
    { _id: "mock-r1", name: "شركة التطوير المتقدم", location: "الرياض", projectsCount: 8 },
    { _id: "mock-r2", name: "إعمار السعودية", location: "جدة", projectsCount: 15 },
] as any[];

export default function Brokers() {
    const role = useRole();
    const { brokers, reds } = useAdminBrokers();
    const isRED = role === "RED";

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"brokers" | "developers">("brokers");

    const brokersData = brokers === undefined ? undefined : (brokers.length > 0 ? brokers : MOCK_BROKERS);
    const redsData = reds === undefined ? undefined : (reds.length > 0 ? reds : MOCK_REDS);

    const filteredBrokers = brokersData?.filter((b: any) =>
        b.name?.includes(search) || b.company?.includes(search) || b.location?.includes(search)
    ) ?? [];

    const filteredREDs = redsData?.filter((r: any) =>
        r.name?.includes(search) || r.location?.includes(search)
    ) ?? [];

    return (
        <div className="space-y-8">
            <div className="px-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">الوسطاء والمطورون</h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                    تصفّح قائمة الوسطاء والمطورين وتواصل معهم
                </p>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث بالاسم أو الموقع..."
                        className="pr-10 pl-4 py-2 bg-slate-50 border-none rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                    />
                </div>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                    <ListFilter className="h-4 w-4" />
                </button>
            </div>

            {/* Tabs (only for Broker — they can see both. RED sees only Brokers) */}
            {!isRED && (
                <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("brokers")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === "brokers"
                                ? "bg-blue-600 text-white"
                                : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        الوسطاء
                    </button>
                    <button
                        onClick={() => setActiveTab("developers")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === "developers"
                                ? "bg-blue-600 text-white"
                                : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        المطورون
                    </button>
                </div>
            )}

            {/* Broker Cards */}
            {(isRED || activeTab === "brokers") && (
                <div>
                    {!brokersData ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredBrokers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredBrokers.map((broker: any) => (
                                <BrokerCard
                                    key={broker._id}
                                    broker={broker}
                                    href={`/dashboard/${role}/brokers/${broker._id}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                            <Users className="h-10 w-10 text-slate-200 mb-3" />
                            <p className="text-sm font-bold text-slate-400">لا يوجد وسطاء مطابقون للبحث</p>
                        </div>
                    )}
                </div>
            )}

            {/* Developer Cards (Broker only) */}
            {!isRED && activeTab === "developers" && (
                <div>
                    {!redsData ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredREDs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredREDs.map((red: any) => (
                                <REDCard
                                    key={red._id}
                                    developer={red}
                                    href={`/dashboard/${role}/developers/${red._id}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                            <Users className="h-10 w-10 text-slate-200 mb-3" />
                            <p className="text-sm font-bold text-slate-400">لا يوجد مطورون مطابقون للبحث</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
