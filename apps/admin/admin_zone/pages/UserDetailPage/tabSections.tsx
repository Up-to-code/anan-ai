import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import InlineBarChart from "@/components/shared/InlineBarChart";
import JsonPreview from "@/components/shared/JsonPreview";
import StatusBadge from "@/components/shared/StatusBadge";
import StatCard from "@/components/shared/StatCard";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForOwnerType, labelForRole } from "@/lib/adminLabels";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import { count, record } from "./utils";

export { renderUserActivityTab } from "./activityTabSection";

type OffersTabContext = {
  offerSummary: Record<string, unknown>;
  offerStatusBreakdown: Record<string, unknown>;
  offerVisibilityBreakdown: Record<string, unknown>;
  offerRows: Array<Record<string, unknown>>;
  counterpartRows: Array<Record<string, unknown>>;
  handoffRows: Array<Record<string, unknown>>;
};

function UserOffersSummaryCards({ offerSummary }: { offerSummary: Record<string, unknown> }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <StatCard label="أرسل" value={formatNumber(count(offerSummary.sent))} hint="العروض التي أنشأها المستخدم أو جهته." />
      <StatCard label="استقبل" value={formatNumber(count(offerSummary.received))} hint="العروض الموجهة لهذه الجهة أو المستخدم." />
      <StatCard label="عام مقبول" value={formatNumber(count(offerSummary.publicApplied))} hint="عروض عامة وصلت لهذه الجهة بعد التقديم." />
      <StatCard label="معلق" value={formatNumber(count(offerSummary.pending))} hint="عروض ما زالت في انتظار القرار." />
      <StatCard label="مقبول" value={formatNumber(count(offerSummary.accepted))} hint="عروض انتهت بقبول." />
      <StatCard label="مرفوض" value={formatNumber(count(offerSummary.rejected))} hint="عروض انتهت برفض." />
    </section>
  );
}

function UserOffersBreakdownPanels({
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

function UserOfferRow({ offer }: { offer: Record<string, unknown> }) {
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

function UserOffersPanel({ offerRows }: { offerRows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">آخر العروض</div>
      {offerRows.length > 0 ? (
        <DataTable headers={["العقار", "الدور", "الطرف المقابل", "القيمة", "الحالة", "الحوارات", "الصفقات"]}>
          {offerRows.map((offer) => (
            <UserOfferRow key={String(offer.id)} offer={offer} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد عروض" description="لا توجد عروض مرتبطة بهذا المستخدم أو بمنظمته حتى الآن." />
      )}
    </WorkspacePanel>
  );
}

function UserCounterpartRow({ item }: { item: Record<string, unknown> }) {
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

function UserCounterpartsPanel({ counterpartRows }: { counterpartRows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">الشركاء الأكثر تكرارًا</div>
      {counterpartRows.length > 0 ? (
        <DataTable headers={["الجهة", "النوع", "العروض", "المقبول", "المحادثات", "الطلبات"]}>
          {counterpartRows.map((item) => (
            <UserCounterpartRow key={String(item.organizationKey)} item={item} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد روابط" description="لم تتشكل أي روابط تعاون مع طرف مقابل بعد." />
      )}
    </WorkspacePanel>
  );
}

function UserHandoffRow({ item }: { item: Record<string, unknown> }) {
  return (
    <tr key={String(item.offerId)} className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3 font-black text-slate-900">{String(item.propertyTitle ?? "عرض")}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(item.counterpartName ?? "السوق العامة")}</td>
      <td className="px-4 py-3"><StatusBadge value={String(item.status ?? "pending")} /></td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.conversationCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.dealCount))}</td>
      <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(item.createdAt))}</td>
    </tr>
  );
}

function UserHandoffsPanel({ handoffRows }: { handoffRows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">أحدث handoffs</div>
      {handoffRows.length > 0 ? (
        <DataTable headers={["العرض", "الطرف المقابل", "الحالة", "الحوارات", "الصفقات", "التاريخ"]}>
          {handoffRows.map((item) => (
            <UserHandoffRow key={String(item.offerId)} item={item} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد handoffs" description="لم يتم رصد handoff فعلي بين هذا المستخدم وطرف مقابل حتى الآن." />
      )}
    </WorkspacePanel>
  );
}

export function renderUserOffersTab(context: OffersTabContext) {
  return (
    <div className="space-y-6">
      <UserOffersSummaryCards offerSummary={context.offerSummary} />
      <UserOffersBreakdownPanels
        offerStatusBreakdown={context.offerStatusBreakdown}
        offerVisibilityBreakdown={context.offerVisibilityBreakdown}
      />
      <UserOffersPanel offerRows={context.offerRows} />
      <section className="grid gap-6 xl:grid-cols-2">
        <UserCounterpartsPanel counterpartRows={context.counterpartRows} />
        <UserHandoffsPanel handoffRows={context.handoffRows} />
      </section>
    </div>
  );
}

type MessagesTabContext = {
  messages: Record<string, unknown>;
  conversationRows: Array<Record<string, unknown>>;
  assistantRows: Array<Record<string, unknown>>;
  inboxRows: Array<Record<string, unknown>>;
};

function UserMessagesSummaryCards({ messages }: { messages: Record<string, unknown> }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="المحادثات" value={formatNumber(count(messages.conversationCount))} hint="عدد المحادثات المباشرة التي تخص هذا المستخدم." />
      <StatCard label="غير المقروء" value={formatNumber(count(messages.unreadConversationCount))} hint="محادثات بها عناصر غير مقروءة." />
      <StatCard label="رسائل المساعد" value={formatNumber(count(messages.assistantCount))} hint="حجم رسائل المساعد المرتبطة بالمستخدم." />
      <StatCard label="رسائل inbox" value={formatNumber(count(messages.inboxCount))} hint="كل الرسائل المباشرة أو offer cards." />
    </section>
  );
}

function UserConversationRow({ conversation }: { conversation: Record<string, unknown> }) {
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

function UserConversationsPanel({ conversationRows }: { conversationRows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">ملخص المحادثات</div>
      {conversationRows.length > 0 ? (
        <DataTable headers={["الطرف الآخر", "الدور", "الرسائل", "غير المقروء", "آخر تحديث"]}>
          {conversationRows.map((conversation) => (
            <UserConversationRow key={String(conversation.id)} conversation={conversation} />
          ))}
        </DataTable>
      ) : (
        <EmptyState title="لا توجد محادثات" description="لا توجد محادثات مباشرة مرتبطة بهذا المستخدم." />
      )}
    </WorkspacePanel>
  );
}

function UserInboxMessagesPanel({ inboxRows }: { inboxRows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">آخر الرسائل المباشرة</div>
      {inboxRows.length > 0 ? (
        <JsonPreview value={inboxRows} />
      ) : (
        <EmptyState title="لا توجد رسائل مباشرة" description="لا توجد مراسلات مباشرة مرتبطة بهذا المستخدم." />
      )}
    </WorkspacePanel>
  );
}

function UserAssistantMessagesPanel({ assistantRows }: { assistantRows: Array<Record<string, unknown>> }) {
  return (
    <WorkspacePanel className="space-y-4">
      <div className="text-sm font-black text-blue-600">آخر رسائل المساعد</div>
      {assistantRows.length > 0 ? (
        <JsonPreview value={assistantRows} />
      ) : (
        <EmptyState title="لا توجد رسائل مساعد" description="لا توجد رسائل مساعد حديثة لهذا المستخدم." />
      )}
    </WorkspacePanel>
  );
}

export function renderUserMessagesTab(context: MessagesTabContext) {
  return (
    <div className="space-y-6">
      <UserMessagesSummaryCards messages={context.messages} />
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <UserConversationsPanel conversationRows={context.conversationRows} />
        <UserInboxMessagesPanel inboxRows={context.inboxRows} />
      </section>
      <UserAssistantMessagesPanel assistantRows={context.assistantRows} />
    </div>
  );
}
