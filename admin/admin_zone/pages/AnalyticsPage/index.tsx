import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import InlineBarChart from "@/components/shared/InlineBarChart";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getAnalyticsPageData } from "@/admin_zone/api/analytics";
import { labelForOwnerType } from "@/lib/adminLabels";
import { formatNumber } from "@/lib/format";

type AnalyticsPageProps = {
  tab: "messages" | "active-30d" | "brokers" | "developers" | "properties" | "offers" | "connections";
};

/**
 * WHY:   Deep analytics were intentionally moved out of overview into their own simpler tabbed workspace.
 * WHAT:  Renders one focused component per analytics tab with KPI cards, lightweight charts, and dense tables.
 * HOW:   Loads only the dataset required for the requested analytics tab and visualizes it with shared admin primitives.
 */
export default async function AnalyticsPage({ tab }: AnalyticsPageProps) {
  const payload = await getAnalyticsPageData(tab);

  if (tab === "messages") {
    const data = payload.data as {
      totals: { assistantMessages: number; inboxMessages: number; activatedMessages: number; combinedMessages: number };
      topUsers: Array<{ userId: string; name: string; assistantMessages: number; inboxMessages: number; activatedMessages: number; totalMessages: number }>;
      activatedTrend: Array<{ label: string; value: number }>;
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="الإجمالي" value={formatNumber(data.totals.combinedMessages)} hint="كل الرسائل المباشرة ورسائل المساعد." />
          <StatCard label="رسائل المساعد" value={formatNumber(data.totals.assistantMessages)} hint="كل الرسائل الناتجة من خيوط المساعد." />
          <StatCard label="الرسائل المباشرة" value={formatNumber(data.totals.inboxMessages)} hint="كل رسائل الـ inbox المباشرة." />
          <StatCard label="رسائل التفعيل" value={formatNumber(data.totals.activatedMessages)} hint="الرسائل التي جاءت في وضع action." />
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">اتجاه رسائل التفعيل</div>
            {data.activatedTrend.length > 0 ? (
              <InlineBarChart items={data.activatedTrend.map((item) => ({ ...item, tone: "primary" as const }))} />
            ) : (
              <EmptyState title="لا يوجد اتجاه" description="لا توجد رسائل action ضمن الفترة الحالية." />
            )}
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">الرسائل لكل مستخدم</div>
            <DataTable headers={["المستخدم", "الإجمالي", "المساعد", "المباشر", "المفعلة"]}>
              {data.topUsers.map((user) => (
                <tr key={user.userId} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-black text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(user.totalMessages)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(user.assistantMessages)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(user.inboxMessages)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(user.activatedMessages)}</td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  if (tab === "active-30d") {
    const data = payload.data as {
      totalDistinctUsers: number;
      trend: Array<{ label: string; value: number }>;
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2">
          <StatCard label="المستخدمون النشطون" value={formatNumber(data.totalDistinctUsers)} hint="عدد المستخدمين المميزين خلال آخر 30 يومًا." />
          <StatCard label="نقاط الاتجاه" value={formatNumber(data.trend.length)} hint="عدد الأيام التي سجلت نشاطًا فعليًا." />
        </section>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">اتجاه النشاط اليومي</div>
          {data.trend.length > 0 ? (
            <InlineBarChart items={data.trend.map((item) => ({ ...item, tone: "primary" as const }))} />
          ) : (
            <EmptyState title="لا يوجد نشاط" description="لم يتم تسجيل نشاط يومي ضمن الفترة المحددة." />
          )}
        </WorkspacePanel>
      </div>
    );
  }

  if (tab === "brokers" || tab === "developers") {
    const data = payload.data as {
      summary: { total: number; verified: number; pending: number };
      topByInventory: Array<{ id: string; name: string; status: string; isVerified: boolean; linkedProfilesCount: number; membersCount: number; inventoryCount: number }>;
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="الإجمالي" value={formatNumber(data.summary.total)} hint="إجمالي الجهات ضمن هذا التصنيف." />
          <StatCard label="المعتمد" value={formatNumber(data.summary.verified)} hint="عدد الجهات المعتمدة رسميًا." />
          <StatCard label="المعلق" value={formatNumber(data.summary.pending)} hint="عدد الجهات المنتظرة أو غير المكتملة." />
        </section>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">تفصيل الجهات</div>
          <DataTable headers={["الاسم", "المخزون", "الأعضاء", "الملفات", "الحالة"]}>
            {data.topByInventory.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 font-black text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.inventoryCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.membersCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.linkedProfilesCount)}</td>
                <td className="px-4 py-3"><StatusBadge value={item.isVerified ? "approved" : item.status} /></td>
              </tr>
            ))}
          </DataTable>
        </WorkspacePanel>
      </div>
    );
  }

  if (tab === "offers") {
    const data = payload.data as {
      summary: { total: number; pending: number; accepted: number; rejected: number; public: number; private: number };
      trend: Array<{ label: string; value: number }>;
      topSenders: Array<{ organizationKey: string; ownerType: "broker" | "red"; name: string; offersCount: number; acceptedCount: number; pendingCount: number }>;
      topRecipients: Array<{ organizationKey: string; ownerType: "broker" | "red" | "marketplace"; name: string; offersCount: number; acceptedCount: number; pendingCount: number }>;
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="إجمالي العروض" value={formatNumber(data.summary.total)} hint="كل العروض المخزنة في المنصة." />
          <StatCard label="قيد الانتظار" value={formatNumber(data.summary.pending)} hint="العروض المنتظرة لرد أو معالجة." />
          <StatCard label="مقبول" value={formatNumber(data.summary.accepted)} hint="العروض التي انتهت بحالة قبول." />
          <StatCard label="مرفوض" value={formatNumber(data.summary.rejected)} hint="العروض التي انتهت برفض." />
          <StatCard label="عام" value={formatNumber(data.summary.public)} hint="العروض المفتوحة على السوق العامة." />
          <StatCard label="خاص" value={formatNumber(data.summary.private)} hint="العروض الموجهة مباشرة لطرف محدد." />
        </section>
        <section className="grid gap-6 xl:grid-cols-3">
          <WorkspacePanel className="space-y-4 xl:col-span-1">
            <div className="text-sm font-black text-blue-600">اتجاه إنشاء العروض</div>
            {data.trend.length > 0 ? (
              <InlineBarChart items={data.trend.map((item) => ({ ...item, tone: "primary" as const }))} />
            ) : (
              <EmptyState title="لا يوجد اتجاه" description="لا توجد عروض جديدة ضمن الفترة المحددة." />
            )}
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4 xl:col-span-2">
            <div className="text-sm font-black text-blue-600">أكثر الجهات إرسالًا</div>
            <DataTable headers={["الجهة", "النوع", "الإجمالي", "المقبول", "المعلق"]}>
              {data.topSenders.map((item) => (
                <tr key={item.organizationKey} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-black text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForOwnerType(item.ownerType)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.offersCount)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.acceptedCount)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.pendingCount)}</td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">أكثر الجهات استقبالًا</div>
          <DataTable headers={["الجهة", "النوع", "الإجمالي", "المقبول", "المعلق"]}>
            {data.topRecipients.map((item) => (
              <tr key={item.organizationKey} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 font-black text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{item.ownerType === "marketplace" ? "السوق" : labelForOwnerType(item.ownerType)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.offersCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.acceptedCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(item.pendingCount)}</td>
              </tr>
            ))}
          </DataTable>
        </WorkspacePanel>
      </div>
    );
  }

  if (tab === "connections") {
    const data = payload.data as {
      summary: {
        totalPairs: number;
        offersWithConversation: number;
        conversationsLeadingToDeals: number;
        conversationsLeadingToOrders: number;
      };
      topPairs: Array<{
        id: string;
        senderOrganizationKey: string;
        senderName: string;
        senderType: "broker" | "red";
        recipientOrganizationKey: string;
        recipientName: string;
        recipientType: "broker" | "red";
        offersCount: number;
        acceptedOffersCount: number;
        conversationCount: number;
        dealsCount: number;
        ordersCount: number;
      }>;
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="الأزواج النشطة" value={formatNumber(data.summary.totalPairs)} hint="أزواج وسيط-مطور التي ظهرت داخل العروض." />
          <StatCard label="عروض صنعت محادثة" value={formatNumber(data.summary.offersWithConversation)} hint="عروض تولد عنها offer card داخل الـ inbox." />
          <StatCard label="محادثات وصلت إلى صفقة" value={formatNumber(data.summary.conversationsLeadingToDeals)} hint="روابط انتهت بصفقة CRM مرتبطة بعرض." />
          <StatCard label="محادثات وصلت إلى طلب" value={formatNumber(data.summary.conversationsLeadingToOrders)} hint="خيوط رُبطت بطلبات تشغيلية تحمل thread id." />
        </section>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">أقوى روابط التعاون</div>
          <DataTable headers={["من", "إلى", "العروض", "المقبول", "المحادثات", "الصفقات", "الطلبات"]}>
            {data.topPairs.map((pair) => (
              <tr key={pair.id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3">
                  <div className="font-black text-slate-900">{pair.senderName}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{labelForOwnerType(pair.senderType)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-black text-slate-900">{pair.recipientName}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{labelForOwnerType(pair.recipientType)}</div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(pair.offersCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(pair.acceptedOffersCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(pair.conversationCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(pair.dealsCount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(pair.ordersCount)}</td>
              </tr>
            ))}
          </DataTable>
        </WorkspacePanel>
      </div>
    );
  }

  const data = payload.data as {
    total: number;
    statusBreakdown: Record<string, number>;
    ownerBreakdown: Record<string, number>;
    trend: Array<{ label: string; value: number }>;
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="إجمالي العقارات" value={formatNumber(data.total)} hint="كل المخزون المعروض داخل النظام." />
        <StatCard label="وسطاء" value={formatNumber(data.ownerBreakdown.brokers ?? 0)} hint="عقارات مرتبطة بوسيط." />
        <StatCard label="مطورون" value={formatNumber(data.ownerBreakdown.developers ?? 0)} hint="عقارات مرتبطة بمطور." />
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">توزيع الحالات</div>
          <InlineBarChart
            items={[
              { label: "متاح", value: data.statusBreakdown.available ?? 0, tone: "primary" },
              { label: "محجوز", value: data.statusBreakdown.reserved ?? 0, tone: "neutral" },
              { label: "مباع", value: data.statusBreakdown.sold ?? 0, tone: "danger" },
            ]}
          />
        </WorkspacePanel>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">اتجاه إضافة العقارات</div>
          {data.trend.length > 0 ? (
            <InlineBarChart items={data.trend.map((item) => ({ ...item, tone: "primary" as const }))} />
          ) : (
            <EmptyState title="لا يوجد اتجاه" description="لا توجد إضافات جديدة للعقارات ضمن الفترة المحددة." />
          )}
        </WorkspacePanel>
      </section>
    </div>
  );
}
