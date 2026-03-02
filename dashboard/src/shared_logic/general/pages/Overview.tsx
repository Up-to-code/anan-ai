import { useUserData } from "@/_core/hooks/useUserData";
import { useRole } from "@/_core/hooks/useRole";
import { useSharedGeneralOverview } from "../hooks/useSharedGeneral";
import { getDashboardBasePath } from "@/_core/router/paths";
import {
    Building2,
    TrendingUp,
    Users,
    Tag,
    ArrowUpRight,
    Calendar,
    Bell,
    CheckCircle2,
    Clock,
    Inbox,
} from "lucide-react";
import { StatCard } from "@/admin_zone/components/StatCard";
import { Link } from "react-router-dom";

export default function Overview() {
    const { user, isVerified, isLoading } = useUserData();
    const role = useRole();

    const { propertiesBroker, propertiesRED, sentOffers, receivedOffers, deals } = useSharedGeneralOverview(role ?? null);

    const properties = role === "broker" ? propertiesBroker?.page : propertiesRED?.page;
    const propertiesCount = properties?.length ?? 0;
    const pendingOffers = sentOffers?.filter((o) => o.status === "pending")?.length ?? 0;
    const receivedCount = receivedOffers?.length ?? 0;
    const activeDeals = deals?.length ?? 0;

    const basePrefix = getDashboardBasePath(role);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 min-h-[400px]">
                <div className="h-8 w-8 rounded-full border-2 border-slate-100 border-t-blue-600 animate-spin" />
            </div>
        );
    }

    const stats = [
        {
            title: "العقارات النشطة",
            value: String(propertiesCount),
            icon: <Building2 className="h-5 w-5" />,
            trend: propertiesCount > 0 ? "فعّال" : "لا يوجد بعد",
        },
        {
            title: "العروض المعلّقة",
            value: String(pendingOffers),
            icon: <Tag className="h-5 w-5" />,
            trend: "بانتظار الرد",
        },
        {
            title: "العروض الواردة",
            value: String(receivedCount),
            icon: <Inbox className="h-5 w-5" />,
            trend: "في صندوق الوارد",
        },
        {
            title: "الصفقات النشطة",
            value: String(activeDeals),
            icon: <TrendingUp className="h-5 w-5" />,
            trend: "في CRM",
        },
    ];

    // Recent activity from offers
    const recentActivity = [
        ...(sentOffers ?? []).slice(0, 3).map((o) => ({
            type: "offer_sent" as const,
            title: `أرسلت عرضاً على "${o.property?.title ?? "عقار"}"`,
            status: o.status,
        })),
        ...(receivedOffers ?? []).slice(0, 3).map((o) => ({
            type: "offer_received" as const,
            title: `${o.senderName} أرسل عرضاً على "${o.property?.title ?? "عقار"}"`,
            status: o.status,
        })),
    ].slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-8 text-white">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                لوحة التحكم
                            </span>
                            {isVerified && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    حساب موثق
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            مرحباً بك مجدداً، {user?.name ?? "مستخدم أنان"}
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 max-w-lg leading-relaxed">
                            نظرة سريعة على أداء محفظتك العقارية ونشاط العملاء لهذا اليوم.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {!isVerified && (
                            <div className="px-4 py-2 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-md border border-amber-500/20 flex items-center gap-2">
                                <Bell className="h-4 w-4 animate-bounce" />
                                بانتظار التوثيق
                            </div>
                        )}
                        <div className="px-4 py-2 bg-white/5 text-white text-xs font-bold rounded-md border border-white/10 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-400" />
                            {new Date().toLocaleDateString("ar-SA", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                            })}
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard
                        key={i}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                        className="hover:border-blue-200 transition-all group"
                    />
                ))}
            </div>

            {/* Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Links */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900">إجراءات سريعة</h3>
                    <div className="space-y-2">
                        <Link
                            to={`${basePrefix}/properties/create`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-700">إضافة عقار</span>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </Link>
                        <Link
                            to={`${basePrefix}/offers/create`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Tag className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-700">إنشاء عرض</span>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </Link>
                        <Link
                            to={`${basePrefix}/brokers`}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-700">تصفح الوسطاء</span>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="text-base font-bold text-slate-900">آخر النشاطات</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">تحديثات فورية لحسابك</p>
                    </div>
                    {recentActivity.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {recentActivity.map((activity, i) => (
                                <div key={i} className="px-6 py-4 flex items-center gap-4">
                                    <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${activity.status === "accepted"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : activity.status === "rejected"
                                                ? "bg-rose-50 text-rose-600"
                                                : "bg-amber-50 text-amber-600"
                                            }`}
                                    >
                                        {activity.status === "accepted" ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Clock className="h-4 w-4" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium flex-1">{activity.title}</p>
                                    <span
                                        className={`text-[10px] font-bold uppercase tracking-widest ${activity.status === "accepted"
                                            ? "text-emerald-600"
                                            : activity.status === "rejected"
                                                ? "text-rose-600"
                                                : "text-amber-600"
                                            }`}
                                    >
                                        {activity.status === "accepted"
                                            ? "مقبول"
                                            : activity.status === "rejected"
                                                ? "مرفوض"
                                                : "معلّق"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 flex flex-col items-center justify-center flex-grow min-h-[200px] gap-4">
                            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">كل شيء هادئ هنا</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">
                                    عندما يحدث أي نشاط جديد ستجده مدرجاً هنا
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
