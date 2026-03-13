import { Activity, Building2, House, MessagesSquare, ShoppingBag, Users, Waypoints } from "lucide-react";
import { getDashboardOverviewPageData } from "@/admin_zone/api/overview";
import EmptyState from "@/components/shared/EmptyState";
import InlineBarChart from "@/components/shared/InlineBarChart";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatDateTime, formatNumber } from "@/lib/format";

type DashboardPageProps = {
  tab?: "overview" | "entities" | "activity";
};

/**
 * WHY:   The dashboard section is now split into focused Arabic tabs instead of one overloaded overview page.
 * WHAT:  Renders the requested dashboard tab using the shared overview counters and compact activity feed.
 * HOW:   Loads one lightweight dashboard payload server-side, then projects different focused views per tab.
 */
export default async function DashboardPage({ tab = "overview" }: DashboardPageProps) {
  const data = await getDashboardOverviewPageData();

  if (tab === "entities") {
    return (
      <WorkspacePanel className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm font-black text-blue-600">المقارنة الرئيسية</div>
          <h2 className="text-2xl font-black text-slate-900">المستخدمون والوسطاء والمطورون</h2>
          <p className="text-sm font-semibold text-slate-600">مخطط بسيط يوضح حجم الكيانات الرئيسية داخل المنصة.</p>
        </div>
        <InlineBarChart
          items={[
            { label: "المستخدمون", value: data.stats.users, tone: "primary" },
            { label: "الوسطاء", value: data.stats.brokers, tone: "neutral" },
            { label: "المطورون", value: data.stats.developers, tone: "danger" },
          ]}
        />
      </WorkspacePanel>
    );
  }

  if (tab === "activity") {
    return (
      <WorkspacePanel className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-black text-blue-600">آخر النشاط</div>
          <h2 className="text-2xl font-black text-slate-900">أحدث الأحداث التشغيلية</h2>
        </div>
        {data.recentActivities.length > 0 ? (
          <div className="space-y-3">
            {data.recentActivities.map((item, index) => {
              const row = item as Record<string, unknown>;
              return (
                <div key={String(row.id ?? index)} className="border-2 border-slate-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-black text-slate-500">{String(row.title ?? row.type ?? "حدث")}</div>
                      <div className="text-sm font-semibold text-slate-700">{String(row.subtitle ?? row.query ?? "بدون وصف")}</div>
                      <div className="text-xs font-semibold text-slate-500">{formatDateTime(Number(row.createdAt ?? 0))}</div>
                    </div>
                    <StatusBadge value={String((row.metadata as Record<string, unknown> | undefined)?.status ?? row.source ?? "active")} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="لا يوجد نشاط" description="لم يتم العثور على أحداث تشغيلية حديثة في هذه اللحظة." />
        )}
      </WorkspacePanel>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="المستخدمون" value={formatNumber(data.stats.users)} icon={Users} hint="إجمالي المستخدمين المعروفين داخل النظام." />
      <StatCard label="الوسطاء" value={formatNumber(data.stats.brokers)} icon={Building2} hint="عدد الوسطاء المسجلين على المنصة." />
      <StatCard label="المطورون" value={formatNumber(data.stats.developers)} icon={House} hint="عدد المطورين المرتبطين بالمنصة." />
      <StatCard label="العقارات" value={formatNumber(data.stats.properties)} icon={Activity} hint="إجمالي الوحدات أو العقارات المتاحة للإدارة." />
      <StatCard label="العروض" value={formatNumber(data.stats.offers)} icon={ShoppingBag} hint="كل عروض التعاون أو البيع داخل المنصة." />
      <StatCard label="العروض المعلقة" value={formatNumber(data.stats.pendingOffers)} icon={ShoppingBag} hint="العروض التي لا تزال تنتظر ردًا أو اكتمالًا." />
      <StatCard label="المحادثات" value={formatNumber(data.stats.conversations)} icon={Waypoints} hint="كل المحادثات المباشرة الناتجة عن الربط والتعاون." />
      <StatCard label="الرسائل المباشرة" value={formatNumber(data.stats.directMessages)} icon={MessagesSquare} hint="كل رسائل الـ inbox المباشرة المسجلة." />
      <StatCard label="الصفقات" value={formatNumber(data.stats.deals)} icon={Activity} hint="عدد صفقات الـ CRM المرتبطة بالجهات." />
      <StatCard label="اشتراكات فعالة" value={formatNumber(data.stats.activeSubscriptions)} icon={Building2} hint="الجهات التي تملك اشتراكًا فعّالًا أو تجريبيًا." />
      <StatCard label="Action Mode" value={formatNumber(data.stats.actionEnabledOrganizations)} icon={Waypoints} hint="الجهات المؤهلة لاستخدام وضع التنفيذ التفاعلي." />
    </section>
  );
}
