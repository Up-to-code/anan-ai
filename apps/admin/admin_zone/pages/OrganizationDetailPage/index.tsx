import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import InlineBarChart from "@/components/shared/InlineBarChart";
import JsonPreview from "@/components/shared/JsonPreview";
import StatusBadge from "@/components/shared/StatusBadge";
import StatCard from "@/components/shared/StatCard";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getOrganizationDetailPageData } from "@/admin_zone/api/organizations";
import { labelForOwnerType, labelForRole } from "@/lib/adminLabels";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";

type OrganizationDetailPageProps = {
  organizationKey: string;
  tab?: "overview" | "members" | "properties" | "offers" | "messages" | "access" | "verification";
};

function record(value: unknown) {
  return (value as Record<string, unknown>) ?? {};
}

function rows(value: unknown) {
  return (value as Array<Record<string, unknown>>) ?? [];
}

function count(value: unknown) {
  return Number(value ?? 0);
}

/**
 * WHY:   Organization detail pages should stay simple by splitting summary, members, properties, offers, messages, access, and verification into routes.
 * WHAT:  Renders the requested organization-detail tab from the joined organization detail payload.
 * HOW:   Loads the organization detail once on the server and projects the relevant tab-specific slice with shared admin panels.
 */
export default async function OrganizationDetailPage({ organizationKey, tab = "overview" }: OrganizationDetailPageProps) {
  const { detail } = await getOrganizationDetailPageData(organizationKey);
  const data = record(detail);

  if (!detail) {
    return <EmptyState title="المنظمة غير موجودة" description="تعذر تحميل بيانات هذه المنظمة." />;
  }

  const organization = record(data.organization);
  const metrics = record(data.metrics);
  const memberships = rows(data.memberships);
  const invites = rows(data.invites);
  const properties = rows(data.properties);
  const linkedProfiles = rows(data.linkedProfiles);
  const offers = record(data.offers);
  const offerSummary = record(offers.summary);
  const offerStatusBreakdown = record(offers.statusBreakdown);
  const offerVisibilityBreakdown = record(offers.visibilityBreakdown);
  const topCounterparts = rows(offers.topCounterparts);
  const recentOffers = rows(offers.recent);
  const messages = record(data.messages);
  const conversations = rows(messages.conversations);
  const latestInboxMessages = rows(messages.latestInboxMessages);
  const subscription = record(data.subscription);
  const orders = record(data.orders);
  const orderRows = rows(orders.recent);
  const deals = record(data.deals);
  const dealRows = rows(deals.recent);
  const verificationRequests = rows(data.verificationRequests);
  const access = record(data.access);

  if (tab === "members") {
    return memberships.length > 0 || linkedProfiles.length > 0 || invites.length > 0 ? (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="الأعضاء" value={formatNumber(count(metrics.membersCount))} hint="كل العضويات الفعلية داخل المنظمة." />
          <StatCard label="الملفات المرتبطة" value={formatNumber(count(metrics.linkedProfilesCount))} hint="كل الملفات الشخصية المرتبطة بهذه الجهة." />
          <StatCard label="الدعوات" value={formatNumber(count(metrics.invitesCount))} hint="كل الدعوات الصادرة أو المعلقة." />
          <StatCard label="ظاهر في الدليل" value={formatNumber(linkedProfiles.filter((item) => item.showInOffersDirectory !== false).length)} hint="عدد الملفات الظاهرة في دليل العروض." />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">العضويات</div>
            <DataTable headers={["العضو", "الدور", "الحالة", "التاريخ"]}>
              {memberships.map((membership) => (
                <tr key={String(membership.id)} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-black text-slate-900">{String(membership.profileName ?? "عضو")}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{String(membership.profileEmail ?? "")}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(membership.role ?? "غير متوفر")}</td>
                  <td className="px-4 py-3"><StatusBadge value={String(membership.status ?? "unknown")} /></td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(membership.createdAt))}</td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">الملفات والدعوات</div>
            <DataTable headers={["الاسم", "الدور", "الحالة", "القناة"]}>
              {linkedProfiles.map((profile) => (
                <tr key={String(profile.id)} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-black text-slate-900">{String(profile.name ?? "مستخدم")}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">{String(profile.email ?? "")}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForRole(String(profile.role ?? ""))}</td>
                  <td className="px-4 py-3"><StatusBadge value={String(profile.roleStatus ?? "none")} /></td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(profile.showInOffersDirectory === false ? "مخفي" : "ظاهر")}</td>
                </tr>
              ))}
              {invites.map((invite) => (
                <tr key={String(invite.id)} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-black text-slate-900">{String(invite.email ?? "دعوة")}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(invite.role ?? "")}</td>
                  <td className="px-4 py-3"><StatusBadge value={String(invite.status ?? "unknown")} /></td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(count(invite.expiresAt))}</td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
      </div>
    ) : (
      <EmptyState title="لا يوجد أعضاء" description="لا توجد عضويات أو ملفات أو دعوات مرتبطة بهذه المنظمة حتى الآن." />
    );
  }

  if (tab === "properties") {
    return properties.length > 0 ? (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="العقارات" value={formatNumber(count(metrics.propertiesCount))} hint="إجمالي المخزون المرتبط بهذه الجهة." />
          <StatCard label="العروض" value={formatNumber(count(metrics.offersCount))} hint="حجم العروض الخارجة والداخلة على نفس الجهة." />
          <StatCard label="الروابط" value={formatNumber(topCounterparts.length)} hint="عدد الشركاء الذين ظهروا في سجل العروض." />
        </section>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">العقارات المرتبطة</div>
          <DataTable headers={["العقار", "العنوان", "الحالة", "السعر"]}>
            {properties.map((property) => (
              <tr key={String(property.id)} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 font-black text-slate-900">{String(property.title ?? "عقار")}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(property.address ?? "غير متوفر")}</td>
                <td className="px-4 py-3"><StatusBadge value={String(property.status ?? "unknown")} /></td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatCurrency(count(property.price))}</td>
              </tr>
            ))}
          </DataTable>
        </WorkspacePanel>
      </div>
    ) : (
      <EmptyState title="لا توجد عقارات" description="هذه المنظمة لا تملك عقارات مرتبطة في الوقت الحالي." />
    );
  }

  if (tab === "offers") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="مرسل" value={formatNumber(count(offerSummary.sent))} hint="العروض التي خرجت من هذه الجهة." />
          <StatCard label="مستقبل" value={formatNumber(count(offerSummary.received))} hint="العروض التي استقبلتها هذه الجهة." />
          <StatCard label="معلق" value={formatNumber(count(offerSummary.pending))} hint="العروض التي لم تصل بعد إلى قرار نهائي." />
          <StatCard label="مقبول" value={formatNumber(count(offerSummary.accepted))} hint="العروض المقبولة." />
          <StatCard label="عام" value={formatNumber(count(offerSummary.public))} hint="العروض العامة المرتبطة بهذه الجهة." />
          <StatCard label="خاص" value={formatNumber(count(offerSummary.private))} hint="العروض الخاصة المباشرة." />
        </section>
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
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">أحدث العروض</div>
          {recentOffers.length > 0 ? (
            <DataTable headers={["العقار", "الدور", "الطرف المقابل", "القيمة", "الحالة", "المحادثات", "الصفقات"]}>
              {recentOffers.map((offer) => (
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
              ))}
            </DataTable>
          ) : (
            <EmptyState title="لا توجد عروض" description="لا توجد عروض مرتبطة بهذه الجهة بعد." />
          )}
        </WorkspacePanel>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">أعلى الأطراف المقابلة</div>
          {topCounterparts.length > 0 ? (
            <DataTable headers={["الجهة", "النوع", "العروض", "المقبول", "المحادثات", "الطلبات"]}>
              {topCounterparts.map((item) => (
                <tr key={String(item.organizationKey)} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3 font-black text-slate-900">{String(item.organizationName ?? "جهة")}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForOwnerType(String(item.ownerType ?? ""))}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.offersCount))}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.acceptedOffersCount))}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.conversationsCount))}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(count(item.ordersCount))}</td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState title="لا توجد روابط تعاون" description="لم تظهر أي جهة مقابلة في سجل العروض الحالي." />
          )}
        </WorkspacePanel>
      </div>
    );
  }

  if (tab === "messages") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="المحادثات" value={formatNumber(count(messages.conversationCount))} hint="عدد المحادثات المباشرة الخاصة بهذه الجهة." />
          <StatCard label="غير المقروء" value={formatNumber(count(messages.unreadConversationCount))} hint="المحادثات التي تحتوي على عناصر غير مقروءة." />
          <StatCard label="الرسائل" value={formatNumber(count(messages.inboxCount))} hint="حجم رسائل الـ inbox التابعة للجهة." />
          <StatCard label="الإشعارات" value={formatNumber(count(metrics.notificationsCount))} hint="حجم الإشعارات الموجهة لملفات هذه الجهة." />
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">ملخص المحادثات</div>
            {conversations.length > 0 ? (
              <DataTable headers={["الطرف الآخر", "الدور", "الرسائل", "غير المقروء", "آخر تحديث"]}>
                {conversations.map((conversation) => (
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
                ))}
              </DataTable>
            ) : (
              <EmptyState title="لا توجد محادثات" description="لم تتولد محادثات مباشرة لهذه المنظمة بعد." />
            )}
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">آخر رسائل الـ inbox</div>
            {latestInboxMessages.length > 0 ? (
              <JsonPreview value={latestInboxMessages} />
            ) : (
              <EmptyState title="لا توجد رسائل" description="لا توجد رسائل inbox حديثة تخص هذه المنظمة." />
            )}
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  if (tab === "access") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="التحقق" value={String(access.verified ? "معتمد" : "غير مكتمل")} hint="حالة التحقق الرسمية للجهة." />
          <StatCard label="الاشتراك" value={String(subscription.planTier ?? "بدون")} hint="فئة الاشتراك الحالية للجهة." />
          <StatCard label="الحالة" value={String(subscription.status ?? "inactive")} hint="الحالة الحالية للاشتراك." />
          <StatCard label="Action Mode" value={String(access.mode ?? "qa").toUpperCase()} hint="الوضع الممنوح للمساعد لهذه الجهة." />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">النفاذ والاشتراك</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">اشتراك نشط</div>
                <div className="mt-3"><StatusBadge value={String(access.hasActiveSubscription ? "active" : "inactive")} /></div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">Action Mode</div>
                <div className="mt-3"><StatusBadge value={String(access.actionModeEnabled ? "approved" : "inactive")} /></div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">الملفات الظاهرة بالدليل</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{formatNumber(count(access.linkedProfilesVisibleInOffersDirectory))}</div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">عدد الصفقات</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{formatNumber(count(metrics.dealsCount))}</div>
              </div>
            </div>
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-sm font-black text-blue-600">تصحيح إداري</div>
            <JsonPreview value={{ organization, subscription, access, orders, deals }} />
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  if (tab === "verification") {
    return verificationRequests.length > 0 ? (
      <WorkspacePanel className="space-y-3">
        {verificationRequests.map((request) => (
          <div key={String(request.id)} className="border-2 border-slate-100 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="font-black text-slate-900">{String(request.title ?? "طلب تحقق")}</div>
                <div className="text-xs font-semibold text-slate-500">{formatDateTime(count(request.submittedAt))}</div>
              </div>
              <StatusBadge value={String(request.currentStatus ?? "unknown")} />
            </div>
          </div>
        ))}
      </WorkspacePanel>
    ) : (
      <EmptyState title="لا يوجد تحقق" description="لا توجد طلبات تحقق مرتبطة بهذه المنظمة." />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="الأعضاء" value={formatNumber(count(metrics.membersCount))} hint="عدد أعضاء الجهة." />
        <StatCard label="العروض" value={formatNumber(count(metrics.offersCount))} hint="كل العروض الداخلة والخارجة لهذه الجهة." />
        <StatCard label="المحادثات" value={formatNumber(count(metrics.conversationsCount))} hint="المحادثات التي تخص ملفات الجهة." />
        <StatCard label="الصفقات" value={formatNumber(count(metrics.dealsCount))} hint="صفقات الـ CRM المرتبطة بهذه الجهة." />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">ملخص المنظمة</div>
          <div className="space-y-3">
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">الاسم</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{String(organization.name ?? "منظمة")}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">البريد</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{String(organization.contactEmail ?? "غير متوفر")}</div>
              </div>
              <div className="border-2 border-slate-100 bg-slate-50 p-4">
                <div className="text-xs font-black text-slate-500">الهاتف</div>
                <div className="mt-2 text-sm font-semibold text-slate-700">{String(organization.phone ?? "غير متوفر")}</div>
              </div>
            </div>
          </div>
        </WorkspacePanel>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">الوضع التشغيلي</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">الحالة</div>
              <div className="mt-3"><StatusBadge value={String(organization.isVerified ? "approved" : organization.status ?? "pending")} /></div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">فئة الاشتراك</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">{String(subscription.planTier ?? "غير متوفر")}</div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">Action Mode</div>
              <div className="mt-3"><StatusBadge value={String(access.actionModeEnabled ? "approved" : "inactive")} /></div>
            </div>
            <div className="border-2 border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-500">النوع</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">{labelForOwnerType(String(organization.ownerType ?? ""))}</div>
            </div>
          </div>
        </WorkspacePanel>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">الشركاء الأكثر تكرارًا</div>
          {topCounterparts.length > 0 ? (
            <InlineBarChart
              items={topCounterparts.slice(0, 5).map((item, index) => ({
                label: String(item.organizationName ?? `جهة ${index + 1}`),
                value: count(item.offersCount),
                tone: index === 0 ? "primary" : "neutral",
              }))}
            />
          ) : (
            <EmptyState title="لا توجد روابط" description="لم يتم تسجيل شراكات عروض حتى الآن." />
          )}
        </WorkspacePanel>
        <WorkspacePanel className="space-y-4">
          <div className="text-sm font-black text-blue-600">ملخص الطلبات والصفقات</div>
          <JsonPreview value={{ orders: orderRows, deals: dealRows }} />
        </WorkspacePanel>
      </section>
    </div>
  );
}
