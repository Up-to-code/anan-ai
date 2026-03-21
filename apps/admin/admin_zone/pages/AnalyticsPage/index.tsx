import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import LineTrendChart from "@/components/shared/LineTrendChart";
import MetricBarChart from "@/components/shared/MetricBarChart";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getAnalyticsPageData } from "@/admin_zone/api/analytics";
import { labelForOwnerType } from "@/lib/adminLabels";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";

type AnalyticsPageProps = {
  tab: "executive" | "engagement" | "commercial" | "partners" | "inventory" | "collaboration";
  range?: "30d" | "90d";
};

function renderQueueItems(items: Array<{ id: string; title: string; subtitle: string; createdAt: number; status: string }>) {
  return items.length > 0 ? (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="font-medium text-slate-900">{item.title}</div>
              <div className="text-sm text-slate-600">{item.subtitle}</div>
              <div className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</div>
            </div>
            <StatusBadge value={item.status} />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <EmptyState title="لا توجد عناصر" description="لا توجد عناصر تشغيلية نشطة في هذه النافذة." />
  );
}

/**
 * WHY:   The rebuilt analytics area groups the admin data by business question rather than by low-level table source.
 * WHAT:  Renders grouped executive, engagement, commercial, partner, inventory, and collaboration analytics views.
 * HOW:   Loads the requested grouped dataset on the server and maps it into shared charts, tables, and management summaries.
 */
export default async function AnalyticsPage({ tab, range = "90d" }: AnalyticsPageProps) {
  const payload = await getAnalyticsPageData(tab, range);

  if (tab === "executive") {
    const executive = payload.data as unknown as {
      overview: {
        kpis: {
          activeUsers: { current: number; delta: number };
          offerVolume: { current: number; delta: number };
          qualifiedOrders: { current: number; delta: number };
          closedWins: { current: number; delta: number };
        };
        activityTrend: Array<{ label: string; messages: number; searches: number; research: number }>;
        commercialTrend: Array<{ label: string; offers: number; orders: number; deals: number }>;
        topOrganizations: Array<{ organizationKey: string; name: string; ownerType: "broker" | "red"; inventoryCount: number; offersCount: number; membersCount: number; subscriptionStatus: string | null; isVerified: boolean }>;
        alerts: Array<{ id: string; title: string; subtitle: string; createdAt: number; status: string }>;
      };
      commercial: unknown;
      partners: {
        subscriptionHealth: Array<{ label: string; value: number }>;
      };
      queue: {
        orderAssignment: Array<{ label: string; value: number }>;
      };
    };
    const overviewData = executive.overview;
    const partnerData = executive.partners;
    const queueData = executive.queue;

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="نشاط المستخدمين" value={formatNumber(overviewData.kpis.activeUsers.current)} delta={overviewData.kpis.activeUsers.delta} />
          <StatCard label="العروض الجديدة" value={formatNumber(overviewData.kpis.offerVolume.current)} delta={overviewData.kpis.offerVolume.delta} />
          <StatCard label="الطلبات المؤهلة" value={formatNumber(overviewData.kpis.qualifiedOrders.current)} delta={overviewData.kpis.qualifiedOrders.delta} />
          <StatCard label="الإغلاقات الرابحة" value={formatNumber(overviewData.kpis.closedWins.current)} delta={overviewData.kpis.closedWins.delta} />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">اتجاه النشاط</h2>
              <p className="mt-1 text-sm text-slate-500">حركة الرسائل والبحث والمعرفة خلال الفترة الحالية.</p>
            </div>
            <LineTrendChart
              data={overviewData.activityTrend}
              series={[
                { dataKey: "messages", label: "الرسائل", color: "#1f2937" },
                { dataKey: "searches", label: "البحث", color: "#a16207" },
                { dataKey: "research", label: "المعرفة", color: "#15803d" },
              ]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">تركيب الطوابير والاشتراكات</h2>
              <p className="mt-1 text-sm text-slate-500">حجم العمل التشغيلي مقابل صحة التفعيل التجاري.</p>
            </div>
            <MetricBarChart
              data={queueData.orderAssignment}
              series={[{ dataKey: "value", label: "الطلبات", color: "#1f2937" }]}
              valueFormatter={(value) => formatNumber(value)}
            />
            <MetricBarChart
              data={partnerData.subscriptionHealth}
              series={[{ dataKey: "value", label: "الاشتراكات", color: "#a16207" }]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
        </section>
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <WorkspacePanel className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">المنظمات الأعلى تأثيرًا</h2>
              <p className="mt-1 text-sm text-slate-500">ترتيب يجمع المخزون والعروض والعضويات والتحقق.</p>
            </div>
            <DataTable headers={["الجهة", "النوع", "المخزون", "العروض", "الأعضاء"]}>
              {overviewData.topOrganizations.map((organization) => (
                <tr key={organization.organizationKey} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{organization.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{labelForOwnerType(organization.ownerType)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(organization.inventoryCount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(organization.offersCount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600">{formatNumber(organization.membersCount)}</span>
                      <StatusBadge value={organization.isVerified ? "approved" : organization.subscriptionStatus ?? "pending"} />
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">تنبيهات الإدارة</h2>
              <p className="mt-1 text-sm text-slate-500">أحدث ما يحتاج قرارًا أو تدخلًا سريعًا.</p>
            </div>
            {renderQueueItems(overviewData.alerts)}
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  if (tab === "engagement") {
    const data = payload.data as {
      messages: {
        totals: { assistantMessages: number; inboxMessages: number; activatedMessages: number; combinedMessages: number };
        topUsers: Array<{ userId: string; name: string; assistantMessages: number; inboxMessages: number; activatedMessages: number; totalMessages: number }>;
        activatedTrend: Array<{ label: string; value: number }>;
      };
      activeUsers: {
        totalDistinctUsers: number;
        trend: Array<{ label: string; value: number }>;
      };
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="إجمالي الرسائل" value={formatNumber(data.messages.totals.combinedMessages)} />
          <StatCard label="رسائل المساعد" value={formatNumber(data.messages.totals.assistantMessages)} />
          <StatCard label="الرسائل المباشرة" value={formatNumber(data.messages.totals.inboxMessages)} />
          <StatCard label="رسائل التفعيل" value={formatNumber(data.messages.totals.activatedMessages)} />
          <StatCard label="المستخدمون النشطون" value={formatNumber(data.activeUsers.totalDistinctUsers)} />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">اتجاه رسائل التفعيل</div>
            <LineTrendChart
              data={data.messages.activatedTrend.map((item) => ({ label: item.label, value: item.value }))}
              series={[{ dataKey: "value", label: "رسائل التفعيل", color: "#1f2937" }]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">اتجاه النشاط اليومي</div>
            <LineTrendChart
              data={data.activeUsers.trend.map((item) => ({ label: item.label, value: item.value }))}
              series={[{ dataKey: "value", label: "المستخدمون", color: "#15803d" }]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
        </section>
        <WorkspacePanel className="space-y-4">
          <div className="text-lg font-semibold text-slate-900">المستخدمون الأعلى تفاعلًا</div>
          <DataTable headers={["المستخدم", "الإجمالي", "المساعد", "المباشر", "التفعيل"]}>
            {data.messages.topUsers.map((user) => (
              <tr key={user.userId} className="border-b border-stone-200 last:border-b-0">
                <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(user.totalMessages)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(user.assistantMessages)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(user.inboxMessages)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(user.activatedMessages)}</td>
              </tr>
            ))}
          </DataTable>
        </WorkspacePanel>
      </div>
    );
  }

  if (tab === "commercial") {
    const data = payload.data as {
      summary: {
        offers: { current: number };
        acceptedOffers: { current: number };
        wonDeals: { current: number };
        lostDeals: { current: number };
        pipelineValue: number;
        pipelineFallbackCount: number;
        openPipelineCount: number;
      };
      offerTrend: Array<{ label: string; offers: number; accepted: number; pending: number }>;
      dealStages: Array<{ stage: string; count: number; value: number; valuedCount: number }>;
      orderFunnel: Array<{ label: string; value: number }>;
      orderChannels: Array<{ label: string; value: number }>;
      topSenders: Array<{ organizationKey: string; ownerType: "broker" | "red"; name: string; offersCount: number; acceptedCount: number }>;
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="العروض الحالية" value={formatNumber(data.summary.offers.current)} />
          <StatCard label="العروض المقبولة" value={formatNumber(data.summary.acceptedOffers.current)} />
          <StatCard label="صفقات رابحة" value={formatNumber(data.summary.wonDeals.current)} />
          <StatCard label="خط الأنابيب" value={formatNumber(data.summary.openPipelineCount)} />
          <StatCard label="قيمة الخط" value={formatCurrency(data.summary.pipelineValue)} hint={`صفقات بدون قيمة: ${formatNumber(data.summary.pipelineFallbackCount)}`} />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">اتجاه العروض</div>
            <LineTrendChart
              data={data.offerTrend}
              series={[
                { dataKey: "offers", label: "كل العروض", color: "#1f2937" },
                { dataKey: "accepted", label: "مقبول", color: "#15803d" },
                { dataKey: "pending", label: "معلق", color: "#a16207" },
              ]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">قمع الطلبات</div>
            <MetricBarChart
              data={data.orderFunnel}
              series={[{ dataKey: "value", label: "الطلبات", color: "#1f2937" }]}
              horizontal
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">مراحل الصفقات</div>
            <MetricBarChart
              data={data.dealStages.map((item) => ({ label: item.stage, count: item.count }))}
              series={[{ dataKey: "count", label: "العدد", color: "#15803d" }]}
              horizontal
              valueFormatter={(value) => formatNumber(value)}
            />
            <MetricBarChart
              data={data.orderChannels}
              series={[{ dataKey: "value", label: "القنوات", color: "#a16207" }]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">الجهات الأعلى إرسالًا للعروض</div>
            <DataTable headers={["الجهة", "النوع", "الإجمالي", "المقبول"]}>
              {data.topSenders.map((item) => (
                <tr key={item.organizationKey} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{labelForOwnerType(item.ownerType)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.offersCount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.acceptedCount)}</td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  if (tab === "partners") {
    const data = payload.data as unknown as {
      partners: {
        summary: {
          brokers: number;
          developers: number;
          verifiedBrokers: number;
          verifiedDevelopers: number;
          activeSubscriptions: number;
          trialSubscriptions: number;
        };
        onboardingTrend: Array<{ label: string; brokers: number; developers: number }>;
        subscriptionHealth: Array<{ label: string; value: number }>;
        verificationMix: {
          brokers: { new: number; inReview: number; approved: number; rejected: number };
          developers: { new: number; inReview: number; approved: number; rejected: number };
        };
        actionModeAdoption: { brokers: number; developers: number; totalEligible: number };
        topOrganizations: Array<{ organizationKey: string; name: string; ownerType: "broker" | "red"; inventoryCount: number; offersCount: number; membersCount: number; subscriptionStatus: string | null; isVerified: boolean }>;
      };
      brokers: { topByInventory: Array<{ id: string; name: string; inventoryCount: number; membersCount: number; linkedProfilesCount: number; status: string; isVerified: boolean }> };
      developers: { topByInventory: Array<{ id: string; name: string; inventoryCount: number; membersCount: number; linkedProfilesCount: number; status: string; isVerified: boolean }> };
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard label="الوسطاء" value={formatNumber(data.partners.summary.brokers)} />
          <StatCard label="المطورون" value={formatNumber(data.partners.summary.developers)} />
          <StatCard label="وسطاء معتمدون" value={formatNumber(data.partners.summary.verifiedBrokers)} />
          <StatCard label="مطورون معتمدون" value={formatNumber(data.partners.summary.verifiedDevelopers)} />
          <StatCard label="اشتراكات نشطة" value={formatNumber(data.partners.summary.activeSubscriptions)} />
          <StatCard label="اشتراكات تجريبية" value={formatNumber(data.partners.summary.trialSubscriptions)} />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">اتجاه الانضمام</div>
            <LineTrendChart
              data={data.partners.onboardingTrend}
              series={[
                { dataKey: "brokers", label: "الوسطاء", color: "#1f2937" },
                { dataKey: "developers", label: "المطورون", color: "#a16207" },
              ]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">صحة الاشتراكات</div>
            <MetricBarChart
              data={data.partners.subscriptionHealth}
              series={[{ dataKey: "value", label: "الاشتراكات", color: "#15803d" }]}
              valueFormatter={(value) => formatNumber(value)}
            />
            <div className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
              <div className="text-sm text-slate-500">اعتماد Action Mode</div>
              <div className="mt-2 text-sm text-slate-700">
                الوسطاء: {formatNumber(data.partners.actionModeAdoption.brokers)} | المطورون: {formatNumber(data.partners.actionModeAdoption.developers)} | إجمالي الجهات المؤهلة: {formatNumber(data.partners.actionModeAdoption.totalEligible)}
              </div>
            </div>
          </WorkspacePanel>
        </section>
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">مزيج التحقق</div>
            <MetricBarChart
              data={[
                { label: "وسطاء جديد", value: data.partners.verificationMix.brokers.new },
                { label: "وسطاء قيد المراجعة", value: data.partners.verificationMix.brokers.inReview },
                { label: "وسطاء معتمدون", value: data.partners.verificationMix.brokers.approved },
                { label: "مطورون جديد", value: data.partners.verificationMix.developers.new },
                { label: "مطورون قيد المراجعة", value: data.partners.verificationMix.developers.inReview },
                { label: "مطورون معتمدون", value: data.partners.verificationMix.developers.approved },
              ]}
              series={[{ dataKey: "value", label: "التحقق", color: "#1f2937" }]}
              horizontal
              height={280}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">المنظمات الأعلى صحة</div>
            <DataTable headers={["الجهة", "النوع", "المخزون", "العروض", "الأعضاء"]}>
              {data.partners.topOrganizations.map((organization) => (
                <tr key={organization.organizationKey} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{organization.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{labelForOwnerType(organization.ownerType)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(organization.inventoryCount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(organization.offersCount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-600">{formatNumber(organization.membersCount)}</span>
                      <StatusBadge value={organization.isVerified ? "approved" : organization.subscriptionStatus ?? "pending"} />
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">أفضل الوسطاء بالمخزون</div>
            <DataTable headers={["الاسم", "المخزون", "الأعضاء", "الحالة"]}>
              {data.brokers.topByInventory.map((item) => (
                <tr key={item.id} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.inventoryCount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.membersCount)}</td>
                  <td className="px-4 py-3"><StatusBadge value={item.isVerified ? "approved" : item.status} /></td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">أفضل المطورين بالمخزون</div>
            <DataTable headers={["الاسم", "المخزون", "الأعضاء", "الحالة"]}>
              {data.developers.topByInventory.map((item) => (
                <tr key={item.id} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.inventoryCount)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.membersCount)}</td>
                  <td className="px-4 py-3"><StatusBadge value={item.isVerified ? "approved" : item.status} /></td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  if (tab === "inventory") {
    const data = payload.data as unknown as {
      inventory: {
        total: number;
        statusBreakdown: Record<string, number>;
        ownerBreakdown: Record<string, number>;
        trend: Array<{ label: string; value: number }>;
      };
      brokers: { topByInventory: Array<{ id: string; name: string; inventoryCount: number; status: string; isVerified: boolean }> };
      developers: { topByInventory: Array<{ id: string; name: string; inventoryCount: number; status: string; isVerified: boolean }> };
    };

    return (
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="إجمالي العقارات" value={formatNumber(data.inventory.total)} />
          <StatCard label="عقارات الوسطاء" value={formatNumber(data.inventory.ownerBreakdown.brokers ?? 0)} />
          <StatCard label="عقارات المطورين" value={formatNumber(data.inventory.ownerBreakdown.developers ?? 0)} />
          <StatCard label="غير مُسندة" value={formatNumber(data.inventory.ownerBreakdown.unassigned ?? 0)} />
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">اتجاه إضافة العقارات</div>
            <LineTrendChart
              data={data.inventory.trend.map((item) => ({ label: item.label, value: item.value }))}
              series={[{ dataKey: "value", label: "العقارات", color: "#1f2937" }]}
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">توزيع الحالات</div>
            <MetricBarChart
              data={[
                { label: "متاح", value: data.inventory.statusBreakdown.available ?? 0 },
                { label: "محجوز", value: data.inventory.statusBreakdown.reserved ?? 0 },
                { label: "مباع", value: data.inventory.statusBreakdown.sold ?? 0 },
                { label: "غير محدد", value: data.inventory.statusBreakdown.unspecified ?? 0 },
              ]}
              series={[{ dataKey: "value", label: "الحالة", color: "#15803d" }]}
              horizontal
              valueFormatter={(value) => formatNumber(value)}
            />
          </WorkspacePanel>
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">أعلى الوسطاء بالمخزون</div>
            <DataTable headers={["الاسم", "المخزون", "الحالة"]}>
              {data.brokers.topByInventory.map((item) => (
                <tr key={item.id} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.inventoryCount)}</td>
                  <td className="px-4 py-3"><StatusBadge value={item.isVerified ? "approved" : item.status} /></td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
          <WorkspacePanel className="space-y-4">
            <div className="text-lg font-semibold text-slate-900">أعلى المطورين بالمخزون</div>
            <DataTable headers={["الاسم", "المخزون", "الحالة"]}>
              {data.developers.topByInventory.map((item) => (
                <tr key={item.id} className="border-b border-stone-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(item.inventoryCount)}</td>
                  <td className="px-4 py-3"><StatusBadge value={item.isVerified ? "approved" : item.status} /></td>
                </tr>
              ))}
            </DataTable>
          </WorkspacePanel>
        </section>
      </div>
    );
  }

  const data = payload.data as unknown as {
    connections: {
      summary: {
        totalPairs: number;
        offersWithConversation: number;
        conversationsLeadingToDeals: number;
        conversationsLeadingToOrders: number;
      };
      topPairs: Array<{
        id: string;
        senderName: string;
        senderType: "broker" | "red";
        recipientName: string;
        recipientType: "broker" | "red";
        offersCount: number;
        acceptedOffersCount: number;
        conversationCount: number;
        dealsCount: number;
        ordersCount: number;
      }>;
    };
    queue: {
      summary: { recentErrors: number; recentNotifications: number };
      recentQueueItems: Array<{ id: string; title: string; subtitle: string; createdAt: number; status: string }>;
    };
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="الأزواج النشطة" value={formatNumber(data.connections.summary.totalPairs)} />
        <StatCard label="عروض صنعت محادثة" value={formatNumber(data.connections.summary.offersWithConversation)} />
        <StatCard label="محادثات وصلت لصفقات" value={formatNumber(data.connections.summary.conversationsLeadingToDeals)} />
        <StatCard label="محادثات وصلت لطلبات" value={formatNumber(data.connections.summary.conversationsLeadingToOrders)} />
        <StatCard label="أخطاء حديثة" value={formatNumber(data.queue.summary.recentErrors)} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkspacePanel className="space-y-4">
          <div className="text-lg font-semibold text-slate-900">أقوى روابط التعاون</div>
          <DataTable headers={["من", "إلى", "العروض", "المقبول", "المحادثات", "الصفقات", "الطلبات"]}>
            {data.connections.topPairs.map((pair) => (
              <tr key={pair.id} className="border-b border-stone-200 last:border-b-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{pair.senderName}</div>
                  <div className="mt-1 text-xs text-slate-500">{labelForOwnerType(pair.senderType)}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{pair.recipientName}</div>
                  <div className="mt-1 text-xs text-slate-500">{labelForOwnerType(pair.recipientType)}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(pair.offersCount)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(pair.acceptedOffersCount)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(pair.conversationCount)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(pair.dealsCount)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(pair.ordersCount)}</td>
              </tr>
            ))}
          </DataTable>
        </WorkspacePanel>
        <WorkspacePanel className="space-y-4">
          <div className="text-lg font-semibold text-slate-900">أحدث عناصر التعاون والطوابير</div>
          {renderQueueItems(data.queue.recentQueueItems)}
        </WorkspacePanel>
      </section>
    </div>
  );
}
