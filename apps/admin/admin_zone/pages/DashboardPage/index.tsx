import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import LineTrendChart from "@/components/shared/LineTrendChart";
import MetricBarChart from "@/components/shared/MetricBarChart";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getDashboardOverviewPageData } from "@/admin_zone/api/overview";
import { labelForOwnerType } from "@/lib/adminLabels";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";

type DashboardPageProps = {
  range?: "30d" | "90d";
};

/**
 * WHY:   The rebuilt admin needs a command-center landing page that blends leadership signals with operational urgency.
 * WHAT:  Renders the new dashboard using command-center aggregates, recent activity, alerts, and organization rankings.
 * HOW:   Loads the overview payload once on the server, then composes charts, KPI tiles, and queue panels with shared admin primitives.
 */
export default async function DashboardPage({ range = "90d" }: DashboardPageProps) {
  const data = await getDashboardOverviewPageData(range);
  const overview = data.commandCenter;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="المستخدمون النشطون"
          value={formatNumber(overview.kpis.activeUsers.current)}
          delta={overview.kpis.activeUsers.delta}
          hint="نشاط موحد عبر المساعد، الرسائل، البحث، والمعرفة."
        />
        <StatCard
          label="العروض الجديدة"
          value={formatNumber(overview.kpis.offerVolume.current)}
          delta={overview.kpis.offerVolume.delta}
          hint="العروض المنشأة خلال الفترة المحددة."
        />
        <StatCard
          label="الطلبات المؤهلة"
          value={formatNumber(overview.kpis.qualifiedOrders.current)}
          delta={overview.kpis.qualifiedOrders.delta}
          hint="الطلبات التي تجاوزت مرحلة التفاعل الأولي."
        />
        <StatCard
          label="الإغلاقات الرابحة"
          value={formatNumber(overview.kpis.closedWins.current)}
          delta={overview.kpis.closedWins.delta}
          hint="طلبات مغلقة بنجاح خلال نفس النافذة الزمنية."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <WorkspacePanel className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">الحركة اليومية</h2>
              <p className="mt-1 text-sm text-slate-500">رسائل، بحث، ومعرفة على مدى {range === "90d" ? "90" : "30"} يوم.</p>
            </div>
          </div>
          <LineTrendChart
            data={overview.activityTrend}
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
            <h2 className="text-lg font-semibold text-slate-900">تنبيهات تحتاج متابعة</h2>
            <p className="mt-1 text-sm text-slate-500">طلبات غير مُسندة، تحقق يحتاج مراجعة، وأحداث تقنية حديثة.</p>
          </div>
          {overview.alerts.length > 0 ? (
            <div className="space-y-3">
              {overview.alerts.map((item) => (
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
            <EmptyState title="لا توجد تنبيهات" description="لا توجد عناصر عاجلة تحتاج متابعة في هذه اللحظة." />
          )}
        </WorkspacePanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <WorkspacePanel className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">الزخم التجاري</h2>
              <p className="mt-1 text-sm text-slate-500">العروض، الطلبات، والصفقات ضمن نفس النافذة الزمنية.</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">قيمة خط الأنابيب</div>
              <div className="text-xl font-semibold text-slate-900">{formatCurrency(overview.pipeline.value)}</div>
            </div>
          </div>
          <LineTrendChart
            data={overview.commercialTrend}
            series={[
              { dataKey: "offers", label: "العروض", color: "#1f2937" },
              { dataKey: "orders", label: "الطلبات", color: "#a16207" },
              { dataKey: "deals", label: "الصفقات", color: "#15803d" },
            ]}
            valueFormatter={(value) => formatNumber(value)}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
              <div className="text-sm text-slate-500">الصفقات المفتوحة</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(overview.pipeline.dealCount)}</div>
            </div>
            <div className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
              <div className="text-sm text-slate-500">صفقات بقيم مالية</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(overview.pipeline.valuedDealCount)}</div>
            </div>
            <div className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
              <div className="text-sm text-slate-500">الاشتراكات النشطة</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(overview.partnerHealth.activeSubscriptions)}</div>
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">أقوى الجهات داخل الشبكة</h2>
            <p className="mt-1 text-sm text-slate-500">ترتيب يعتمد على المخزون، العروض، العضويات، والتحقق التشغيلي.</p>
          </div>
          <DataTable headers={["الجهة", "النوع", "المخزون", "العروض", "الأعضاء"]}>
            {overview.topOrganizations.map((organization) => (
              <tr key={organization.organizationKey} className="border-b border-stone-200 last:border-b-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{organization.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {organization.subscriptionStatus ? `اشتراك ${organization.subscriptionStatus}` : "بدون اشتراك"}
                  </div>
                </td>
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

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">صحة الطوابير</h2>
            <p className="mt-1 text-sm text-slate-500">ضغط الطلبات، التحقق، والأخطاء التقنية في مكان واحد.</p>
          </div>
          <MetricBarChart
            data={[
              { label: "غير مُسند", value: overview.queueHealth.unassignedOrders },
              { label: "تحقق جديد", value: overview.queueHealth.newVerifications },
              { label: "قيد المراجعة", value: overview.queueHealth.inReviewVerifications },
              { label: "أخطاء", value: overview.queueHealth.errorEvents },
            ]}
            series={[{ dataKey: "value", label: "القيمة", color: "#1f2937" }]}
            horizontal
            height={220}
            valueFormatter={(value) => formatNumber(value)}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
              <div className="text-sm text-slate-500">الجهات المعتمدة</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(overview.partnerHealth.verifiedOrganizations)}</div>
            </div>
            <div className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
              <div className="text-sm text-slate-500">المنظمات في Action Mode</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(overview.partnerHealth.actionModeOrganizations)}</div>
            </div>
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">آخر النشاط التشغيلي</h2>
            <p className="mt-1 text-sm text-slate-500">أحدث الإشارات عبر الرسائل، البحث، والتحقق.</p>
          </div>
          {data.recentActivities.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivities.map((item, index) => {
                const row = item as Record<string, unknown>;
                return (
                  <div key={String(row.id ?? index)} className="rounded-lg border border-stone-300 bg-stone-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-900">{String(row.title ?? row.type ?? "حدث")}</div>
                        <div className="text-sm text-slate-600">{String(row.subtitle ?? row.query ?? "بدون وصف")}</div>
                        <div className="text-xs text-slate-500">{formatDateTime(Number(row.createdAt ?? 0))}</div>
                      </div>
                      <StatusBadge value={String((row.metadata as Record<string, unknown> | undefined)?.status ?? row.source ?? "active")} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="لا يوجد نشاط" description="لم يتم العثور على نشاط حديث في هذه اللحظة." />
          )}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-stone-300 bg-white px-4 py-3">
              <div className="text-sm text-slate-500">المستخدمون</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(data.stats.users)}</div>
            </div>
            <div className="rounded-lg border border-stone-300 bg-white px-4 py-3">
              <div className="text-sm text-slate-500">الوسطاء</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(data.stats.brokers)}</div>
            </div>
            <div className="rounded-lg border border-stone-300 bg-white px-4 py-3">
              <div className="text-sm text-slate-500">المطورون</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{formatNumber(data.stats.developers)}</div>
            </div>
          </div>
        </WorkspacePanel>
      </section>
    </div>
  );
}
