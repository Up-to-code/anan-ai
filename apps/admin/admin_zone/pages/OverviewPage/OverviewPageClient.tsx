import AdminRangeControl from "@/components/shared/AdminRangeControl";
import { AdminMetricGrid, AdminSectionStack } from "@/components/shared/AdminPageLayout";
import CommandCenterNetworkChart from "@/components/shared/CommandCenterNetworkChart";
import DonutBreakdownChart from "@/components/shared/DonutBreakdownChart";
import LineTrendChart from "@/components/shared/LineTrendChart";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { analyticsTabs } from "@/lib/adminSectionTabs";
import type { CommandCenterOverviewViewModel } from "@/admin_zone/viewModels/commandCenter";

type OverviewPageClientProps = {
  viewModel: CommandCenterOverviewViewModel;
};

/**
 * WHY:   Leadership and operations teams need one command-center surface that explains system flow, commercial throughput, and blockers at a glance.
 * WHAT:  Renders the live overview using KPI cards, a network chart, insight rails, trends, alerts, and partner/queue supporting panels.
 * HOW:   Uses the shared grid-first scaffold so the hero canvas scrolls independently from the fixed rail and large datasets stay bounded inside their own panels.
 */
export default function OverviewPageClient({ viewModel }: OverviewPageClientProps) {
  return (
    <SectionScaffold
      eyebrow="مركز القيادة"
      title="لوحة التحكم"
      description="قراءة قيادية حية تربط الطلب، القنوات، سعة الشركاء، الخط التجاري، والمخاطر التشغيلية داخل منصة أنان."
      tabs={analyticsTabs}
      actions={<AdminRangeControl />}
      layout="dashboard"
      rail={
        <AdminSectionStack className="min-h-0">
          <WorkspacePanel
            tone="dark"
            fullHeight
            header={
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Operator Focus</div>
                <h2 className="text-2xl font-black tracking-tight text-white">ما الذي يجب فعله الآن؟</h2>
              </div>
            }
            bodyClassName="grid gap-4"
            scrollBody
            maxBodyHeightClassName="max-h-[360px]"
          >
            {viewModel.insights.map((insight) => (
              <div key={insight.id} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-black text-white">{insight.title}</div>
                  <StatusBadge
                    value={
                      insight.tone === "warn"
                        ? "warning"
                        : insight.tone === "positive"
                          ? "success"
                          : "info"
                    }
                  />
                </div>
                <p className="mt-3 text-sm leading-7 text-white/72">{insight.body}</p>
              </div>
            ))}
          </WorkspacePanel>

          <WorkspacePanel
            fullHeight
            header={
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
                  API Risk
                </div>
                <h2 className="text-xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  نبض التكامل
                </h2>
              </div>
            }
            bodyClassName="grid gap-3"
          >
            {viewModel.apiRisk.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[20px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_52%,transparent)] px-4 py-3"
              >
                <span className="text-sm font-bold text-[var(--workspace-muted)]">{item.label}</span>
                <span className="text-lg font-black text-[var(--workspace-bubble-other-foreground)]">{item.value}</span>
              </div>
            ))}
          </WorkspacePanel>

          <WorkspacePanel
            fullHeight
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  أقوى الجهات
                </h2>
                <p className="text-sm font-medium text-[var(--workspace-muted)]">
                  الجهات الأكثر قدرة على استقبال الطلب وتحويله.
                </p>
              </div>
            }
            bodyClassName="grid gap-3"
            scrollBody
            maxBodyHeightClassName="max-h-[420px]"
          >
            {viewModel.topOrganizations.map((organization) => (
              <div
                key={organization.id}
                className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-4"
              >
                <div className="grid gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">
                        {organization.name}
                      </div>
                      <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">
                        {organization.ownerTypeLabel}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {organization.isVerified ? <StatusBadge value="approved" /> : <StatusBadge value="pending" />}
                      {organization.actionModeEnabled ? <StatusBadge value="active" /> : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
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
              </div>
            ))}
          </WorkspacePanel>

          <WorkspacePanel
            fullHeight
            header={
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  صحة البيانات
                </h2>
                <p className="text-sm font-medium text-[var(--workspace-muted)]">
                  آخر حالة لتجميعات البيانات ومؤشرات الثبات.
                </p>
              </div>
            }
            bodyClassName="grid gap-3"
          >
            {viewModel.dataHealth.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_52%,transparent)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{item.label}</div>
                  <StatusBadge value={item.status} />
                </div>
                <div className="mt-3 text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                  {item.value}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">{item.note}</p>
              </div>
            ))}
          </WorkspacePanel>
        </AdminSectionStack>
      }
    >
      <AdminMetricGrid minItemWidth={220}>
        {viewModel.metrics.map((metric) => (
          <StatCard
            key={metric.key}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            hint={metric.hint}
          />
        ))}
      </AdminMetricGrid>

      <WorkspacePanel
        fullHeight
        header={
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
              Network Flow
            </div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
              شبكة القيادة التشغيلية
            </h2>
            <p className="max-w-3xl text-sm font-medium leading-7 text-[var(--workspace-muted)]">
              هذا الرسم يوضح كيف يدخل الطلب إلى النظام، كيف يمر عبر القنوات والشركاء، وأين يتعطل قبل أن يتحول إلى صفقات رابحة.
            </p>
          </div>
        }
      >
        <CommandCenterNetworkChart groups={viewModel.network.groups} links={viewModel.network.links} />
      </WorkspacePanel>

      <section className="grid gap-6 2xl:grid-cols-2">
        <WorkspacePanel
          fullHeight
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                اتجاه الإشارات
              </h2>
              <p className="text-sm font-medium text-[var(--workspace-muted)]">
                الرسائل والبحث والمعرفة كمؤشر على سخونة الطلب.
              </p>
            </div>
          }
        >
          <LineTrendChart
            data={viewModel.activityTrend}
            series={[
              { dataKey: "messages", label: "رسائل", color: "var(--chart-blue)" },
              { dataKey: "searches", label: "بحث", color: "var(--chart-cyan)" },
              { dataKey: "research", label: "معرفة", color: "var(--chart-teal)" },
            ]}
            height={300}
          />
        </WorkspacePanel>

        <WorkspacePanel
          fullHeight
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                اتجاه التحويل التجاري
              </h2>
              <p className="text-sm font-medium text-[var(--workspace-muted)]">
                كيف تتحول الحركة إلى عروض، طلبات، وصفقات.
              </p>
            </div>
          }
        >
          <LineTrendChart
            data={viewModel.commercialTrend}
            series={[
              { dataKey: "offers", label: "عروض", color: "var(--chart-amber)" },
              { dataKey: "orders", label: "طلبات", color: "var(--chart-purple)" },
              { dataKey: "deals", label: "صفقات", color: "var(--chart-rose)" },
            ]}
            height={300}
          />
        </WorkspacePanel>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(280px,0.92fr)_minmax(280px,1.08fr)]">
        <WorkspacePanel
          fullHeight
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                توزيع القنوات
              </h2>
              <p className="text-sm font-medium text-[var(--workspace-muted)]">
                أين يمر الطلب التجاري قبل دخوله إلى الشركاء.
              </p>
            </div>
          }
        >
          <DonutBreakdownChart data={viewModel.orderChannels} height={260} />
        </WorkspacePanel>

        <WorkspacePanel
          fullHeight
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                أولويات الطابور
              </h2>
              <p className="text-sm font-medium text-[var(--workspace-muted)]">
                البنود التي تستهلك وقت الفريق قبل التحويل التجاري.
              </p>
            </div>
          }
          bodyClassName="grid gap-3"
          scrollBody
          maxBodyHeightClassName="max-h-[420px]"
        >
          {viewModel.queueFocus.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-elevated)_52%,transparent)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{item.label}</div>
                <StatusBadge value={item.status} />
              </div>
              <div className="mt-3 text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
                {item.value}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">{item.note}</p>
            </div>
          ))}
        </WorkspacePanel>
      </section>

      <WorkspacePanel
        fullHeight
        header={
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-[var(--workspace-bubble-other-foreground)]">
              التنبيهات العاجلة
            </h2>
            <p className="text-sm font-medium text-[var(--workspace-muted)]">
              العناصر التي يجب أن تظهر مباشرة في رادار العمليات.
            </p>
          </div>
        }
        bodyClassName="grid gap-3"
        scrollBody
        maxBodyHeightClassName="max-h-[420px]"
      >
        {viewModel.alerts.map((alert) => (
          <div
            key={alert.id}
            className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{alert.title}</div>
                <div className="text-sm font-medium text-[var(--workspace-muted)]">{alert.subtitle}</div>
                <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">
                  {alert.kindLabel} • {alert.createdAtLabel}
                </div>
              </div>
              <StatusBadge value={alert.status} />
            </div>
          </div>
        ))}
      </WorkspacePanel>
    </SectionScaffold>
  );
}
