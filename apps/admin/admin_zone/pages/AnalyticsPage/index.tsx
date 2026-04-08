import AdminRangeControl from "@/components/shared/AdminRangeControl";
import { AdminMetricGrid, AdminSectionStack } from "@/components/shared/AdminPageLayout";
import DonutBreakdownChart from "@/components/shared/DonutBreakdownChart";
import LineTrendChart from "@/components/shared/LineTrendChart";
import MetricBarChart from "@/components/shared/MetricBarChart";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { analyticsTabs } from "@/lib/adminSectionTabs";
import { buildAnalyticsCommandCenterViewModel } from "@/admin_zone/viewModels/commandCenter";
import { requireAdminPageSession } from "@/lib/serverSession";
import {
  type AdminCommandCenterRange,
  convexAdminCommandCenterRepository,
} from "@/server/infrastructure/convex/adminCommandCenterRepository";

type AnalyticsPageProps = {
  range?: AdminCommandCenterRange;
};

/**
 * WHY:   Command-center users need a dedicated analytics surface when they want deeper slices than the overview homepage provides.
 * WHAT:  Renders live commercial, partner-health, and queue-health analytics for the selected management window.
 * HOW:   Uses the shared analytics canvas with a pinned queue-health rail so dense chart groups stay aligned and bounded under the fixed shell.
 */
export default async function AnalyticsPage({ range = "30d" }: AnalyticsPageProps) {
  const session = await requireAdminPageSession("/analytics");
  const [commercial, partner, queue] = await Promise.all([
    convexAdminCommandCenterRepository.getCommercialAnalytics(session.token, range),
    convexAdminCommandCenterRepository.getPartnerHealthAnalytics(session.token, range),
    convexAdminCommandCenterRepository.getQueueHealthAnalytics(session.token, range),
  ]);
  const viewModel = buildAnalyticsCommandCenterViewModel({
    range,
    commercial,
    partner,
    queue,
  });

  return (
    <SectionScaffold
      eyebrow="مركز القيادة"
      title="التحليلات"
      description="تحليلات حية مقسمة إلى أداء تجاري، صحة الشركاء، وصحة الطوابير التشغيلية."
      tabs={analyticsTabs}
      actions={<AdminRangeControl />}
      layout="analytics"
      headerVariant="compact"
      rail={
        <AdminSectionStack className="min-h-0">
          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
                  Queue Health
                </div>
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  آخر عناصر الطابور
                </h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">أقرب البنود التي تحتاج تدخلًا مباشرًا.</p>
              </div>
            }
            bodyClassName="grid gap-3"
            scrollBody
            maxBodyHeightClassName="max-h-[360px]"
          >
            {viewModel.queue.recentItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{item.title}</div>
                    <div className="mt-1 text-sm font-medium text-[var(--workspace-muted)]">{item.subtitle}</div>
                    <div className="mt-2 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">
                      {item.createdAtLabel}
                    </div>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </WorkspacePanel>

          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  إشراف الطوابير
                </h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">قراءة سريعة للتوثيق والإسناد والتشخيص.</p>
              </div>
            }
            bodyClassName="grid gap-6"
          >
            <MetricBarChart
              data={viewModel.queue.verificationAging}
              series={[{ dataKey: "value", label: "الطلبات", color: "var(--chart-amber)" }]}
              horizontal
              height={220}
            />
            <MetricBarChart
              data={viewModel.queue.orderAssignment}
              series={[{ dataKey: "value", label: "الطلبات", color: "var(--chart-blue)" }]}
              height={200}
            />
            <MetricBarChart
              data={viewModel.queue.orderStatusCounts}
              series={[{ dataKey: "value", label: "الحالة", color: "var(--chart-teal)" }]}
              height={200}
            />
          </WorkspacePanel>
        </AdminSectionStack>
      }
    >
      <AdminMetricGrid minItemWidth={205}>
        {viewModel.summaryMetrics.map((metric) => (
          <StatCard
            key={metric.key}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            hint={metric.hint}
            className="rounded-[26px] p-5"
          />
        ))}
      </AdminMetricGrid>

      <section className="space-y-4">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">Commercial</div>
        <div className="grid gap-6 2xl:grid-cols-2">
          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">اتجاه العروض</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">العروض المقبولة والمعلقة مقارنة بإجمالي الحجم.</p>
              </div>
            }
          >
            <LineTrendChart
              data={viewModel.commercial.offerTrend}
              series={[
                { dataKey: "offers", label: "إجمالي", color: "var(--chart-blue)" },
                { dataKey: "accepted", label: "مقبول", color: "var(--chart-teal)" },
                { dataKey: "pending", label: "معلّق", color: "var(--chart-amber)" },
              ]}
              height={280}
            />
          </WorkspacePanel>

          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">قمع الطلبات</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">المراحل التي يمر بها الطلب قبل الإغلاق.</p>
              </div>
            }
          >
            <MetricBarChart
              data={viewModel.commercial.orderFunnel}
              series={[{ dataKey: "value", label: "الطلبات", color: "var(--chart-purple)" }]}
              horizontal
              height={280}
            />
          </WorkspacePanel>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">قنوات المصدر</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">توزيع الطلب بين واتساب، التطبيق، والويب.</p>
              </div>
            }
          >
            <DonutBreakdownChart data={viewModel.commercial.orderChannels} height={260} />
          </WorkspacePanel>

          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">أقوى مرسلي العروض</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">
                  قيمة الخط الحالية {viewModel.commercial.pipelineValue} مع {viewModel.commercial.pipelineFallbackCount} صفقة بلا قيمة مثبتة.
                </p>
              </div>
            }
            bodyClassName="grid gap-3"
            scrollBody
            maxBodyHeightClassName="max-h-[360px]"
          >
            {viewModel.commercial.topSenders.map((sender) => (
              <div
                key={sender.id}
                className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{sender.name}</div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">{sender.ownerTypeLabel}</div>
                  </div>
                  <StatusBadge value="active" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] px-3 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--workspace-muted)]">Offers</div>
                    <div className="mt-1 text-lg font-black text-[var(--workspace-bubble-other-foreground)]">{sender.offersCount}</div>
                  </div>
                  <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] px-3 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--workspace-muted)]">Accepted</div>
                    <div className="mt-1 text-lg font-black text-[var(--workspace-bubble-other-foreground)]">{sender.acceptedCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </WorkspacePanel>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">Partner Health</div>
        <div className="grid gap-6 2xl:grid-cols-2">
          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">نمو الشركاء</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">الوسطاء والمطورون الذين دخلوا النظام عبر الزمن.</p>
              </div>
            }
          >
            <LineTrendChart
              data={viewModel.partner.onboardingTrend}
              series={[
                { dataKey: "brokers", label: "وسطاء", color: "var(--chart-teal)" },
                { dataKey: "developers", label: "مطورون", color: "var(--chart-blue)" },
              ]}
              height={280}
            />
          </WorkspacePanel>

          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">مزيج التوثيق</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">توزيع طلبات التوثيق بين جديد ومراجعة واعتماد ورفض.</p>
              </div>
            }
          >
            <MetricBarChart
              data={viewModel.partner.verificationMixRows}
              series={[
                { dataKey: "new", label: "جديد", color: "var(--chart-blue)" },
                { dataKey: "inReview", label: "قيد المراجعة", color: "var(--chart-amber)" },
                { dataKey: "approved", label: "معتمد", color: "var(--chart-teal)" },
                { dataKey: "rejected", label: "مرفوض", color: "var(--chart-rose)" },
              ]}
              horizontal
              height={280}
            />
          </WorkspacePanel>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">حالة الاشتراكات</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">صحة الاشتراكات وتبني Action Mode.</p>
              </div>
            }
          >
            <DonutBreakdownChart data={viewModel.partner.subscriptionHealth} height={250} />
            <div className="mt-5">
              <MetricBarChart
                data={viewModel.partner.actionMode}
                series={[{ dataKey: "value", label: "الجهات", color: "var(--chart-cyan)" }]}
                height={220}
              />
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            density="compact"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">ترتيب الجهات</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">الجهات الأقوى من ناحية المخزون، الأعضاء، والعروض.</p>
              </div>
            }
            bodyClassName="grid gap-3"
            scrollBody
            maxBodyHeightClassName="max-h-[420px]"
          >
            {viewModel.partner.topOrganizations.map((organization) => (
              <div
                key={organization.id}
                className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{organization.name}</div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">{organization.ownerTypeLabel}</div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {organization.isVerified ? <StatusBadge value="approved" /> : <StatusBadge value="pending" />}
                    {organization.actionModeEnabled ? <StatusBadge value="active" /> : null}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] px-2 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--workspace-muted)]">Score</div>
                    <div className="mt-1 text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{organization.score}</div>
                  </div>
                  <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] px-2 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--workspace-muted)]">Inventory</div>
                    <div className="mt-1 text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{organization.inventory}</div>
                  </div>
                  <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] px-2 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--workspace-muted)]">Offers</div>
                    <div className="mt-1 text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{organization.offers}</div>
                  </div>
                  <div className="rounded-[18px] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_58%,transparent)] px-2 py-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--workspace-muted)]">Members</div>
                    <div className="mt-1 text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{organization.members}</div>
                  </div>
                </div>
              </div>
            ))}
          </WorkspacePanel>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">Queue Diagnostics</div>
        <div className="grid gap-6 2xl:grid-cols-2">
          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">التشخيص حسب الحالة</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">كيف تتوزع الأخطاء على الحالات المسجلة.</p>
              </div>
            }
          >
            <MetricBarChart
              data={viewModel.queue.diagnosticsByStatus}
              series={[{ dataKey: "value", label: "الأحداث", color: "var(--chart-rose)" }]}
              horizontal
              height={240}
            />
          </WorkspacePanel>

          <WorkspacePanel
            density="default"
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">التشخيص حسب المرحلة</h2>
                <p className="text-sm font-bold text-[var(--workspace-muted)]">المرحلة التي يظهر فيها الخطأ داخل الرحلة.</p>
              </div>
            }
          >
            <MetricBarChart
              data={viewModel.queue.diagnosticsByStage}
              series={[{ dataKey: "value", label: "الأحداث", color: "var(--chart-cyan)" }]}
              horizontal
              height={240}
            />
          </WorkspacePanel>
        </div>
      </section>
    </SectionScaffold>
  );
}
