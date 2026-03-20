import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import InlineBarChart from "@/components/shared/InlineBarChart";
import JsonPreview from "@/components/shared/JsonPreview";
import StatusBadge from "@/components/shared/StatusBadge";
import StatCard from "@/components/shared/StatCard";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForChannel, labelForOwnerType, labelForRole, labelForStatus, labelForVerificationType } from "@/lib/adminLabels";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { getAdminUserDetailPageData } from "@/admin_zone/api/users";
import {
  renderUserActivityTab,
  renderUserMessagesTab,
  renderUserOffersTab,
} from "./tabSections";
import { count, record, rows } from "./utils";

type UserDetailPageProps = {
  userKey: string;
  tab?: "profile" | "organization" | "offers" | "messages" | "activity" | "access" | "verification";
};

/**
 * WHY:   User detail screens should answer one operational question at a time through route-backed detail tabs.
 * WHAT:  Renders the requested user-detail tab for profile, organization, offers, messages, activity, access, or verification.
 * HOW:   Loads the joined user detail payload once on the server and projects only the requested slice through shared admin primitives.
 */
export default async function UserDetailPage({ userKey, tab = "profile" }: UserDetailPageProps) {
  const { detail } = await getAdminUserDetailPageData(userKey);
  const row = record(detail);

  if (!detail) {
    return <EmptyState title="المستخدم غير موجود" description="تعذر الوصول إلى ملف هذا المستخدم أو لم يعد موجودًا." />;
  }

  const identity = record(row.identity);
  const organizations = rows(row.organizations);
  const memberships = rows(row.memberships);
  const metrics = record(row.metrics);
  const offers = record(row.offers);
  const offerSummary = record(offers.summary);
  const offerStatusBreakdown = record(offers.statusBreakdown);
  const offerVisibilityBreakdown = record(offers.visibilityBreakdown);
  const offerRows = rows(offers.recent);
  const connections = record(row.connections);
  const counterpartRows = rows(connections.counterparts);
  const handoffRows = rows(connections.recentHandoffs);
  const verificationRequests = rows(row.verificationRequests);
  const messages = record(row.messages);
  const conversationRows = rows(messages.conversations);
  const assistantRows = rows(messages.latestAssistantMessages);
  const inboxRows = rows(messages.latestInboxMessages);
  const activity = record(row.activity);
  const notificationRows = rows(activity.latestNotifications);
  const orderRows = rows(activity.latestOrders);
  const dealRows = rows(activity.latestDeals);
  const notifications = record(row.notifications);
  const orders = record(row.orders);
  const deals = record(row.deals);
  const access = record(row.access);

  if (tab === "organization") {
    return organizations.length > 0 || memberships.length > 0 ? (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="المنظمات" value={formatNumber(count(metrics.organizationsCount))} hint="عدد الجهات المرتبطة بالمستخدم مباشرة." />
          <StatCard label="العضويات" value={formatNumber(count(metrics.membershipsCount))} hint="عضويات الفريق أو المنظمة المرتبطة." />
          <StatCard label="طلبات التحقق" value={formatNumber(count(metrics.verificationCount))} hint="كل طلبات التحقق المتعلقة بالمستخدم أو جهته." />
          <StatCard label="الوصول التنظيمي" value={formatNumber(organizations.length)} hint="عدد روابط الوصول التنظيمي الفعلية." />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">المنظمات المرتبطة</div>
            <DataTable headers={["المنظمة", "النوع", "الحالة", "الرابط"]}>
              {organizations.map((organization) => (
                <tr key={String(organization.organizationKey ?? organization.id)} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-black text-slate-900">{String(organization.name ?? "منظمة")}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForOwnerType(String(organization.ownerType ?? ""))}</td>
                  <td className="px-4 py-3"><StatusBadge value={String(organization.isVerified ? "approved" : organization.status ?? "pending")} /></td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500">{String(organization.organizationKey ?? organization.id ?? "-")}</td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">العضويات</div>
            <DataTable headers={["المنظمة", "الدور", "الحالة", "التاريخ"]}>
              {memberships.map((membership) => (
                <tr key={String(membership.id)} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-black text-slate-900">{String(membership.organizationName ?? "منظمة")}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(membership.role ?? "عضوية")}</td>
                  <td className="px-4 py-3"><StatusBadge value={String(membership.status ?? "unknown")} /></td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(membership.createdAt))}</td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
      </div>
    ) : (
      <EmptyState title="لا توجد منظمة مرتبطة" description="هذا المستخدم لا يملك ارتباطًا تنظيميًا واضحًا في الوقت الحالي." />
    );
  }

  if (tab === "offers") {
    return renderUserOffersTab({
      offerSummary,
      offerStatusBreakdown,
      offerVisibilityBreakdown,
      offerRows,
      counterpartRows,
      handoffRows,
    });
  }

  if (tab === "messages") {
    return renderUserMessagesTab({
      messages,
      conversationRows,
      assistantRows,
      inboxRows,
    });
  }

  if (tab === "activity") {
    return renderUserActivityTab({
      activity,
      notificationRows,
      orderRows,
      dealRows,
    });
  }

  if (tab === "access") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="الدور" value={labelForRole(String(access.role ?? identity.role ?? ""))} hint="الدور الحالي الفعال للمستخدم." />
          <StatCard label="الحالة" value={labelForStatus(String(access.roleStatus ?? identity.roleStatus ?? "none"))} hint="حالة الموافقة على الدور." />
          <StatCard label="الدليل" value={String(access.showInOffersDirectory ?? false) === "true" ? "مفعل" : "مخفي"} hint="هل يظهر الحساب في دليل العروض." />
          <StatCard label="وضع التشغيل" value={String(access.mode ?? "qa").toUpperCase()} hint="وضع الصلاحية الحالي للمساعد لهذا الحساب." />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">حالة الوصول</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">موثق</div>
                <div className="mt-3"><StatusBadge value={String(access.verified ? "approved" : "pending")} /></div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">اشتراك نشط</div>
                <div className="mt-3"><StatusBadge value={String(access.hasActiveSubscription ? "active" : "inactive")} /></div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">Action Mode</div>
                <div className="mt-3"><StatusBadge value={String(access.actionModeEnabled ? "approved" : "inactive")} /></div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">الدور المطلوب</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{labelForRole(String(access.requestedRole ?? identity.requestedRole ?? ""))}</div>
              </div>
            </div>
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">الاشتراك والربط</div>
            <JsonPreview
              value={{
                subscription: access.subscription ?? null,
                organizations: rows(access.organizationAccess),
                notifications: notifications,
                orders,
                deals,
              }}
            />
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  if (tab === "verification") {
    return verificationRequests.length > 0 ? (
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">طلبات التحقق</div>
        <div className="space-y-3">
          {verificationRequests.map((request) => (
            <div key={String(request.id)} className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="font-black text-slate-900">{String(request.title ?? "طلب تحقق")}</div>
                  <div className="text-sm font-semibold text-slate-600">{labelForVerificationType(String(request.requestType ?? "user"))}</div>
                  <div className="text-xs font-semibold text-slate-500">{formatDateTime(count(request.submittedAt))}</div>
                </div>
                <StatusBadge value={String(request.currentStatus ?? "pending")} />
              </div>
            </div>
          ))}
        </div>
      </WorkspacePanel>
    ) : (
      <EmptyState title="لا توجد طلبات تحقق" description="لم يتم إرسال طلب تحقق مرتبط بهذا المستخدم حتى الآن." />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="المنظمات" value={formatNumber(count(metrics.organizationsCount))} hint="عدد المنظمات المرتبطة بهذا المستخدم." />
        <StatCard label="العروض" value={formatNumber(count(metrics.sentOffersCount) + count(metrics.receivedOffersCount))} hint="كل العروض المرسلة أو المستقبلة." />
        <StatCard label="المحادثات" value={formatNumber(count(metrics.conversationsCount))} hint="عدد المحادثات المباشرة المرتبطة." />
        <StatCard label="الصفقات" value={formatNumber(count(metrics.dealsCount))} hint="عدد الصفقات المرتبطة بالمستخدم أو جهته." />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">الملف الأساسي</div>
          <div className="space-y-3">
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">الاسم</div>
              <div className="mt-2 text-xl font-black text-slate-900">{String(identity.name ?? "مستخدم عنان")}</div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">البريد</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">{String(identity.email ?? "غير متوفر")}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">الدور</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{labelForRole(String(identity.role ?? "user"))}</div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">القناة</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{labelForChannel(String(identity.channel ?? ""))}</div>
              </div>
            </div>
          </div>
        </WorkspacePanel>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">الحالة التشغيلية</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">حالة الدور</div>
              <div className="mt-3"><StatusBadge value={String(identity.roleStatus ?? "none")} /></div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">الاشتراك</div>
              <div className="mt-3"><StatusBadge value={String(record(access.subscription).status ?? "inactive")} /></div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">العروض المعلقة</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{formatNumber(count(offerSummary.pending))}</div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">إشعارات غير مقروءة</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{formatNumber(count(notifications.unreadCount))}</div>
            </div>
          </div>
        </WorkspacePanel>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">الروابط الأهم</div>
          {counterpartRows.length > 0 ? (
            <InlineBarChart
              items={counterpartRows.slice(0, 5).map((item, index) => ({
                label: String(item.organizationName ?? `جهة ${index + 1}`),
                value: count(item.offersCount),
                tone: index === 0 ? "primary" : "neutral",
              }))}
            />
          ) : (
            <EmptyState title="لا توجد روابط" description="لم يتم تكوين روابط تعاون بعد." />
          )}
        </WorkspacePanel>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">تصحيح إداري</div>
          <JsonPreview value={{ identity, access, profile: row.profile ?? null }} />
        </WorkspacePanel>
      </section>
    </div>
  );
}
