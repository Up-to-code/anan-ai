import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import JsonPreview from "@/components/shared/JsonPreview";
import InlineBarChart from "@/components/shared/InlineBarChart";
import StatusBadge from "@/components/shared/StatusBadge";
import StatCard from "@/components/shared/StatCard";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForOwnerType, labelForRole } from "@/lib/adminLabels";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { count, record } from "./utils";

type OffersTabContext = {
  offerSummary: Record<string, unknown>;
  offerStatusBreakdown: Record<string, unknown>;
  offerVisibilityBreakdown: Record<string, unknown>;
  topCounterparts: Array<Record<string, unknown>>;
  recentOffers: Array<Record<string, unknown>>;
};

function OrganizationOffersSummaryCards({
  offerSummary,
}: {
  offerSummary: Record<string, unknown>;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <StatCard label="مرسل" value={formatNumber(count(offerSummary.sent))} hint="العروض التي خرجت من هذه الجهة." />
      <StatCard label="مستقبل" value={formatNumber(count(offerSummary.received))} hint="العروض التي استقبلتها هذه الجهة." />
      <StatCard label="معلق" value={formatNumber(count(offerSummary.pending))} hint="العروض التي لم تصل بعد إلى قرار نهائي." />
      <StatCard label="مقبول" value={formatNumber(count(offerSummary.accepted))} hint="العروض المقبولة." />
      <StatCard label="عام" value={formatNumber(count(offerSummary.public))} hint="العروض العامة المرتبطة بهذه الجهة." />
      <StatCard label="خاص" value={formatNumber(count(offerSummary.private))} hint="العروض الخاصة المباشرة." />
    </section>
  );
}

function OrganizationOffersBreakdownPanels({
  offerStatusBreakdown,
  offerVisibilityBreakdown,
}: {
  offerStatusBreakdown: Record<string, unknown>;
  offerVisibilityBreakdown: Record<string, unknown>;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">توزيع الحالة</div>
        <InlineBarChart
          items={[
            { label: "معلق", value: count(offerStatusBreakdown.pending), tone: "primary" },
            { label: "مقبول", value: count(offerStatusBreakdown.accepted), tone: "neutral" },
            { label: "مرفوض", value: count(offerStatusBreakdown.rejected), tone: "danger" },
          ]}
        />
      </WorkspacePanel>
      <WorkspacePanel className="space-y-4">
        <div className="text-sm font-black text-blue-600">عام مقابل خاص</div>
        <InlineBarChart
          items={[
            { label: "عام", value: count(offerVisibilityBreakdown.public), tone: "primary" },
            { label: "خاص", value: count(offerVisibilityBreakdown.private), tone: "neutral" },
          ]}
        />
      </WorkspacePanel>
    </section>
  );
}

function OrganizationRecentOfferRow({ offer }: { offer: Record<string, unknown> }) {
  return (
    <tr key={String(offer.id)} className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3">
        <div className="font-black text-slate-900">{String(offer.propertyTitle ?? "عقار")}</div>
        <div className="mt-1 text-xs font-semibold text-slate-500">{formatDateTime(count(offer.createdAt))}</div>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(offer.role === "sender" ? "مرسل" : "مستقبل")}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(record(offer.counterpart).name ?? "السوق العامة")}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatCurrency(count(offer.price))}</td>
      <td className="px-4 py-3"><StatusBadge value={String(offer.status ?? "pending")} /></td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(offer.conversationCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(offer.dealCount))}</td>
    </tr>
  );
}

function OrganizationRecentOffersPanel({ recentOffers }: { recentOffers: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">أحدث العروض</div>
      {recentOffers.length > 0 ? (
        <DataTable headers={["العقار", "الدور", "الطرف المقابل", "القيمة", "الحالة", "المحادثات", "الصفقات"]}>
          {recentOffers.map((offer) => (
            <OrganizationRecentOfferRow key={String(offer.id)} offer={offer} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد عروض" description="لا توجد عروض مرتبطة بهذه الجهة بعد." />
      )}
    </WorkspacePanel>
  );
}

function OrganizationCounterpartRow({ item }: { item: Record<string, unknown> }) {
  return (
    <tr key={String(item.organizationKey)} className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3 font-black text-slate-900">{String(item.organizationName ?? "جهة")}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForOwnerType(String(item.ownerType ?? ""))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.offersCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.acceptedOffersCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.conversationsCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.ordersCount))}</td>
    </tr>
  );
}

function OrganizationTopCounterpartsPanel({
  topCounterparts,
}: {
  topCounterparts: Array<Record<string, unknown>>;
}) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">أعلى الأطراف المقابلة</div>
      {topCounterparts.length > 0 ? (
        <DataTable headers={["الجهة", "النوع", "العروض", "المقبول", "المحادثات", "الطلبات"]}>
          {topCounterparts.map((item) => (
            <OrganizationCounterpartRow key={String(item.organizationKey)} item={item} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد روابط تعاون" description="لم تظهر أي جهة مقابلة في سجل العروض الحالي." />
      )}
    </WorkspacePanel>
  );
}

export function renderOrganizationOffersTab(context: OffersTabContext) {
  return (
    <div className="space-y-6">
      <OrganizationOffersSummaryCards offerSummary={context.offerSummary} />
      <OrganizationOffersBreakdownPanels
        offerStatusBreakdown={context.offerStatusBreakdown}
        offerVisibilityBreakdown={context.offerVisibilityBreakdown}
      />
      <OrganizationRecentOffersPanel recentOffers={context.recentOffers} />
      <OrganizationTopCounterpartsPanel topCounterparts={context.topCounterparts} />
    </div>
  );
}

type MessagesTabContext = {
  messages: Record<string, unknown>;
  metrics: Record<string, unknown>;
  conversations: Array<Record<string, unknown>>;
  latestInboxMessages: Array<Record<string, unknown>>;
};

function OrganizationMessagesSummaryCards({
  messages,
  metrics,
}: {
  messages: Record<string, unknown>;
  metrics: Record<string, unknown>;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="المحادثات" value={formatNumber(count(messages.conversationCount))} hint="عدد المحادثات المباشرة الخاصة بهذه الجهة." />
      <StatCard label="غير المقروء" value={formatNumber(count(messages.unreadConversationCount))} hint="المحادثات التي تحتوي على عناصر غير مقروءة." />
      <StatCard label="الرسائل" value={formatNumber(count(messages.inboxCount))} hint="حجم رسائل الـ inbox التابعة للجهة." />
      <StatCard label="الإشعارات" value={formatNumber(count(metrics.notificationsCount))} hint="حجم الإشعارات الموجهة لملفات هذه الجهة." />
    </section>
  );
}

function OrganizationConversationRow({ conversation }: { conversation: Record<string, unknown> }) {
  return (
    <tr key={String(conversation.id)} className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3">
        <div className="font-black text-slate-900">{String(conversation.otherUserName ?? "مستخدم")}</div>
        <div className="mt-1 text-xs font-semibold text-slate-500">{String(conversation.lastMessagePreview ?? "لا توجد معاينة")}</div>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForRole(String(conversation.otherUserRole ?? ""))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(conversation.messagesCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(conversation.unreadCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(conversation.updatedAt))}</td>
    </tr>
  );
}

function OrganizationConversationsPanel({
  conversations,
}: {
  conversations: Array<Record<string, unknown>>;
}) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">ملخص المحادثات</div>
      {conversations.length > 0 ? (
        <DataTable headers={["الطرف الآخر", "الدور", "الرسائل", "غير المقروء", "آخر تحديث"]}>
          {conversations.map((conversation) => (
            <OrganizationConversationRow key={String(conversation.id)} conversation={conversation} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد محادثات" description="لم تتولد محادثات مباشرة لهذه المنظمة بعد." />
      )}
    </WorkspacePanel>
  );
}

function OrganizationInboxMessagesPanel({
  latestInboxMessages,
}: {
  latestInboxMessages: Array<Record<string, unknown>>;
}) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">آخر رسائل الـ inbox</div>
      {latestInboxMessages.length > 0 ? (
        <JsonPreview value={latestInboxMessages} />
      ) : (
        <EmptyState title="لا توجد رسائل" description="لا توجد رسائل inbox حديثة تخص هذه المنظمة." />
      )}
    </WorkspacePanel>
  );
}

export function renderOrganizationMessagesTab(context: MessagesTabContext) {
  return (
    <div className="space-y-6">
      <OrganizationMessagesSummaryCards messages={context.messages} metrics={context.metrics} />
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <OrganizationConversationsPanel conversations={context.conversations} />
        <OrganizationInboxMessagesPanel latestInboxMessages={context.latestInboxMessages} />
      </section>
    </div>
  );
}
