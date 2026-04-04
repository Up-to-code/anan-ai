import {
  overviewChartByRange,
  overviewMetricsByRange,
  overviewModelConsumption,
  overviewOfferQueueMix,
  overviewPartnerMix,
  overviewUserRoleDistribution,
  overviewVerificationPressure,
  queueItems,
  recentActivities,
} from "@/admin_zone/mocks/data";
import type { AdminRange } from "@/admin_zone/mocks/types";
import AdminRenderBoundary from "@/components/shared/AdminRenderBoundary";
import SectionScaffold from "@/components/shared/SectionScaffold";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import StatCard from "@/components/shared/StatCard";
import { overviewTabs } from "@/lib/adminSectionTabs";
import { formatNumber } from "@/lib/format";
import OverviewPageClient from "./OverviewPageClient";

type OverviewPageProps = {
  range?: AdminRange;
};

/**
 * WHY:   The admin overview route should stay thin while still exposing all mocked dashboard data in one place.
 * WHAT:  Loads the mocked overview payload and delegates rendering to the client page module.
 * HOW:   Selects the active time range and passes the matching metrics and chart points into the client surface.
 */
export default function OverviewPage({ range = "30d" }: OverviewPageProps) {
  const metrics = overviewMetricsByRange[range];
  const chart = overviewChartByRange[range];
  const activities = recentActivities;
  const queue = queueItems;

  return (
    <AdminRenderBoundary
      fallback={
        <SectionScaffold
          eyebrow="مركز القيادة"
          title="لوحة التحكم"
          description="تم تفعيل وضع العرض الآمن لهذه الصفحة حتى تظل المؤشرات الأساسية مرئية أثناء تصحيح الواجهة."
          tabs={overviewTabs}
        >
          <section className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <StatCard
                key={`fallback-${metric.key}`}
                label={metric.label}
                value={formatNumber(metric.value)}
                delta={metric.delta}
                hint={metric.hint}
              />
            ))}
          </section>

          <section className="grid gap-8 xl:grid-cols-2">
            <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">ملخص النشاط</h2>
                <p className="text-sm font-bold text-slate-400">واجهة بديلة تعرض آخر المؤشرات حتى مع تعذر تحميل العناصر التفاعلية.</p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">آخر قيمة نشاط</div>
                  <div className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-slate-50">
                    {formatNumber(chart[chart.length - 1]?.activeUsers ?? 0)}
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">أعلى قيمة</div>
                  <div className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-slate-50">
                    {formatNumber(Math.max(...chart.map((point) => point.activeUsers)))}
                  </div>
                </div>
              </div>
            </WorkspacePanel>

            <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">آخر الأنشطة</h2>
                <p className="text-sm font-bold text-slate-400">قائمة تشغيلية بديلة أثناء تصحيح مكونات الصفحة.</p>
              </div>
              <div className="mt-8 grid gap-4">
                {activities.map((item) => (
                  <div
                    key={`fallback-${item.id}`}
                    className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30"
                  >
                    <div className="text-sm font-black text-slate-900 dark:text-slate-50">{item.title}</div>
                    <div className="mt-2 text-sm font-bold text-slate-400">{item.subtitle}</div>
                  </div>
                ))}
              </div>
            </WorkspacePanel>
          </section>

          <section>
            <WorkspacePanel className="rounded-[40px] border-slate-100 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              <div className="space-y-3">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">الطوابير المفتوحة</h2>
                <p className="text-sm font-bold text-slate-400">الأولويات الحالية المعروضة بدون مكونات تفاعلية.</p>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {queue.map((item) => (
                  <div
                    key={`fallback-queue-${item.id}`}
                    className="rounded-[24px] border border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30"
                  >
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</div>
                    <div className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-slate-50">
                      {formatNumber(item.count)}
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-400">{item.note}</div>
                  </div>
                ))}
              </div>
            </WorkspacePanel>
          </section>
        </SectionScaffold>
      }
    >
      <OverviewPageClient
        range={range}
        metrics={metrics}
        chart={chart}
        activities={activities}
        queue={queue}
        partnerMix={overviewPartnerMix}
        verificationPressure={overviewVerificationPressure}
        offerQueueMix={overviewOfferQueueMix}
        userRoleDistribution={overviewUserRoleDistribution}
        models={overviewModelConsumption}
      />
    </AdminRenderBoundary>
  );
}
