import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import JsonPreview from "@/components/shared/JsonPreview";
import StatusBadge from "@/components/shared/StatusBadge";
import StatCard from "@/components/shared/StatCard";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForChannel, labelForStatus } from "@/lib/adminLabels";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { count, rows } from "./utils";

type ActivityTabContext = {
  activity: Record<string, unknown>;
  notificationRows: Array<Record<string, unknown>>;
  orderRows: Array<Record<string, unknown>>;
  dealRows: Array<Record<string, unknown>>;
};

function UserActivitySummaryCards({ activity }: { activity: Record<string, unknown> }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <StatCard label="بحث معرفي" value={formatNumber(count(activity.knowledgeResearchCount))} hint="محاولات البحث في طبقة المعرفة." />
      <StatCard label="سجلات البحث" value={formatNumber(count(activity.searchLogsCount))} hint="عمليات البحث المسجلة في السوق." />
      <StatCard label="إشعارات" value={formatNumber(count(activity.notificationsCount))} hint="كل الإشعارات المرتبطة بالمستخدم." />
      <StatCard label="طلبات" value={formatNumber(count(activity.ordersCount))} hint="طلبات التشغيل أو المبيعات المرتبطة." />
      <StatCard label="صفقات" value={formatNumber(count(activity.dealsCount))} hint="صفقات الـ CRM المتصلة بالمستخدم أو جهته." />
    </section>
  );
}

function UserNotificationRow({ item }: { item: Record<string, unknown> }) {
  return (
    <tr key={String(item.id)} className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3">
        <div className="font-black text-slate-900">{String(item.title ?? "إشعار")}</div>
        <div className="mt-1 text-xs font-semibold text-slate-500">{String(item.summary ?? "")}</div>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForStatus(String(item.type ?? "message"))}</td>
      <td className="px-4 py-3"><StatusBadge value={String(item.readAt ? "active" : "pending")} /></td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(item.createdAt))}</td>
    </tr>
  );
}

function UserNotificationsPanel({ notificationRows }: { notificationRows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">آخر الإشعارات</div>
      {notificationRows.length > 0 ? (
        <DataTable headers={["العنوان", "النوع", "الحالة", "التاريخ"]}>
          {notificationRows.map((item) => (
            <UserNotificationRow key={String(item.id)} item={item} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد إشعارات" description="لم يتم رصد إشعارات تخص هذا المستخدم." />
      )}
    </WorkspacePanel>
  );
}

function UserOrderRow({ item }: { item: Record<string, unknown> }) {
  return (
    <tr key={String(item.id)} className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3 font-black text-slate-900">{String(item.id)}</td>
      <td className="px-4 py-3"><StatusBadge value={String(item.status ?? "unknown")} /></td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForChannel(String(item.sourceChannel ?? ""))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(item.createdAt))}</td>
    </tr>
  );
}

function UserDealRow({ item }: { item: Record<string, unknown> }) {
  return (
    <tr key={String(item.id)} className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3 font-black text-slate-900">{String(item.title ?? item.id)}</td>
      <td className="px-4 py-3"><StatusBadge value={String(item.stage ?? "unknown")} /></td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatCurrency(count(item.value))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(item.createdAt))}</td>
    </tr>
  );
}

function UserOrdersAndDealsPanel({
  orderRows,
  dealRows,
}: {
  orderRows: Array<Record<string, unknown>>;
  dealRows: Array<Record<string, unknown>>;
}) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">الطلبات والصفقات</div>
      {orderRows.length > 0 || dealRows.length > 0 ? (
        <div className="space-y-6">
          <DataTable headers={["الطلب", "الحالة", "القناة", "التاريخ"]}>
            {orderRows.map((item) => (
              <UserOrderRow key={String(item.id)} item={item} />
            ))}
          </DataTable>
          <DataTable headers={["الصفقة", "المرحلة", "القيمة", "التاريخ"]}>
            {dealRows.map((item) => (
              <UserDealRow key={String(item.id)} item={item} />
            ))}
          </DataTable>
        </div>
      ) : (
        <EmptyState title="لا توجد طلبات أو صفقات" description="لم يتم رصد أي سجل مبيعات أو CRM لهذا المستخدم." />
      )}
    </WorkspacePanel>
  );
}

function UserResearchPanels({ activity }: { activity: Record<string, unknown> }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">آخر البحث المعرفي</div>
        <JsonPreview value={rows(activity.latestResearch)} />
      </WorkspacePanel>
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">آخر سجلات البحث</div>
        <JsonPreview value={rows(activity.latestSearchLogs)} />
      </WorkspacePanel>
    </section>
  );
}

export function renderUserActivityTab(context: ActivityTabContext) {
  return (
    <div className="space-y-6">
      <UserActivitySummaryCards activity={context.activity} />
      <section className="grid gap-6 xl:grid-cols-2">
        <UserNotificationsPanel notificationRows={context.notificationRows} />
        <UserOrdersAndDealsPanel orderRows={context.orderRows} dealRows={context.dealRows} />
      </section>
      <UserResearchPanels activity={context.activity} />
    </div>
  );
}
