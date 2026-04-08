"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  Gauge,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ProjectAnalyticsEventType,
  WorkspaceProjectAnalytics,
  WorkspaceProjectAnalyticsBrokerActivityKey,
  WorkspaceProjectAnalyticsBrokerState,
  WorkspaceProjectAnalyticsBrokerTrackingEntry,
  WorkspaceProjectAnalyticsBrokerTrackingCustomer,
  WorkspaceProjectAnalyticsDeveloperStageKey,
} from "@/server/contracts/properties";
import type { WorkspaceProject } from "../../types/projectTypes";
import {
  BROKER_ACTIVITY_STYLES,
  BROKER_STATE_SEQUENCE,
  BROKER_STATE_STYLES,
  classNames,
  computeClickRate,
  DEVELOPER_TABS,
  ENGAGEMENT_METRICS,
  formatDateTime,
  formatNumber,
  formatPercent,
  getBrokerActivityNarrative,
  getBrokerStateLabel,
  getBrokerStateNarrative,
  PRIMARY_STAGE_BADGES,
  type DeveloperTabKey,
  type EngagementMetricKey,
} from "./DeveloperProjectAnalyticsPage.shared";

function CustomerSecondaryBadge({
  label,
}: {
  label: string | null;
}) {
  if (!label) return null;
  return (
    <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
      {label}
    </span>
  );
}

function PrimaryStageBadge({
  stageKey,
  stageLabel,
}: {
  stageKey: WorkspaceProjectAnalyticsDeveloperStageKey;
  stageLabel: string;
}) {
  return (
    <span className={classNames("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold", PRIMARY_STAGE_BADGES[stageKey])}>
      {stageLabel}
    </span>
  );
}

function StateBadge({
  state,
  label,
}: {
  state: WorkspaceProjectAnalyticsBrokerState;
  label: string;
}) {
  return (
    <span className={classNames("inline-flex rounded-full border px-3 py-1 text-[11px] font-bold", BROKER_STATE_STYLES[state].badge)}>
      {label}
    </span>
  );
}

function ActivityBadge({
  activityKey,
  label,
}: {
  activityKey: WorkspaceProjectAnalyticsBrokerActivityKey | null;
  label: string | null;
}) {
  if (!activityKey || !label) return null;

  return (
    <span className={classNames("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold", BROKER_ACTIVITY_STYLES[activityKey])}>
      <Activity className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function SurfacePanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-right">
          <h2 className="text-lg font-black text-foreground">{title}</h2>
          {description ? <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ChartSurface({
  fallback,
  children,
}: {
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    setCanRender(true);
  }, []);

  return <>{canRender ? children : fallback}</>;
}

function BrokerStateColumns({
  analytics,
}: {
  analytics: WorkspaceProjectAnalytics;
}) {
  const stateRows = BROKER_STATE_SEQUENCE.map((stateKey) => {
    const matchingRow = analytics.brokerStateSummary.find((entry) => entry.key === stateKey);
    return {
      key: stateKey,
      count: matchingRow?.count ?? 0,
      label: matchingRow?.label ?? getBrokerStateLabel(stateKey),
      styles: BROKER_STATE_STYLES[stateKey],
    };
  });

  return (
    <SurfacePanel
      title="حالة الوسطاء على المشروع"
      description="هذه هي القراءة التي تهم المطور: من اكتفى بالمشاهدة، من يتحرك على عرض، ومن وصل إلى عميل أو إغلاق."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {stateRows.map((row) => (
          <div key={row.key} className={classNames("rounded-[24px] border p-4 text-right shadow-sm", row.styles.card)}>
            <div className="flex items-center justify-between gap-3">
              <span className={classNames("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold", row.styles.badge)}>
                {row.label}
              </span>
              <div className="text-lg font-black text-foreground">{formatNumber(row.count)}</div>
            </div>
            <div className="mt-3 text-[13px] leading-6 text-muted-foreground">{getBrokerStateNarrative(row.key, row.count)}</div>
          </div>
        ))}
      </div>
    </SurfacePanel>
  );
}

function StatCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "highlight";
}) {
  return (
    <div
      className={
        tone === "highlight"
          ? "rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_5%,var(--workspace-panel))] p-5 text-right shadow-sm"
          : "rounded-[24px] border border-border/60 bg-card p-5 text-right shadow-sm"
      }
    >
      <div className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-foreground">
        {typeof value === "number" ? formatNumber(value) : value}
      </div>
      {helper ? <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{helper}</div> : null}
    </div>
  );
}

function SimpleChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right shadow-lg">
      <div className="text-[12px] font-bold text-foreground">{label}</div>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-[12px]">
            <span className="font-bold text-foreground">{entry.value ?? 0}</span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StageChart({
  rows,
  color = "#111827",
}: {
  rows: Array<{ key: string; label: string; count: number }>;
  color?: string;
}) {
  const filteredRows = rows.filter((row) => row.count > 0);

  if (!filteredRows.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
        لا توجد مراحل لعرضها بعد.
      </div>
    );
  }

  return (
    <ChartSurface
      fallback={
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => (
            <div key={row.key} className="rounded-[20px] border border-border/70 bg-background/80 px-4 py-3 text-right">
              <div className="text-[11px] font-bold text-muted-foreground">{row.label}</div>
              <div className="mt-2 text-lg font-black text-foreground">{formatNumber(row.count)}</div>
            </div>
          ))}
        </div>
      }
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredRows} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleChartTooltip />} />
            <Bar dataKey="count" name="العملاء" fill={color} radius={[10, 10, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartSurface>
  );
}

function EngagementChart({
  analytics,
  activeMetric,
  onMetricChange,
}: {
  analytics: WorkspaceProjectAnalytics;
  activeMetric: EngagementMetricKey;
  onMetricChange: (metric: EngagementMetricKey) => void;
}) {
  const data = analytics.visibilityTrend.map((point) => ({
    ...point,
    clickRate: computeClickRate(point.clicks, point.views),
  }));
  const key = activeMetric === "clickRate" ? "clickRate" : activeMetric;
  const meta = ENGAGEMENT_METRICS[activeMetric];

  return (
    <SurfacePanel
      title="الحركة الرقمية حول المشروع"
      description="تبقى مهمة، لكن هنا هي مؤشر مساعد بعد فهم عدد العملاء والمراحل."
      action={
        <div className="flex flex-wrap justify-end gap-2">
          {Object.entries(ENGAGEMENT_METRICS).map(([metricKey, entry]) => (
            <button
              key={metricKey}
              type="button"
              onClick={() => onMetricChange(metricKey as EngagementMetricKey)}
              className={
                activeMetric === metricKey
                  ? "inline-flex items-center rounded-full bg-[var(--workspace-highlight)] px-4 py-2 text-[12px] font-bold text-white shadow-sm"
                  : "inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-[12px] font-bold text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
              }
            >
              {entry.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="المشاهدات" value={analytics.kpis.totalViews} />
        <StatCard label="النقرات" value={analytics.kpis.totalClicks} />
        <StatCard label="معدل التفاعل" value={formatPercent(computeClickRate(analytics.kpis.totalClicks, analytics.kpis.totalViews))} />
      </div>

      <ChartSurface
        fallback={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {data.slice(-4).map((point) => (
              <div key={point.dateKey} className="rounded-[20px] border border-border/70 bg-background/80 px-4 py-3 text-right">
                <div className="text-[11px] font-bold text-muted-foreground">{point.label}</div>
                <div className="mt-2 text-sm font-bold text-foreground">
                  {activeMetric === "clickRate"
                    ? formatPercent(point.clickRate)
                    : formatNumber(activeMetric === "views" ? point.views : point.clicks)}
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="h-[320px] w-full rounded-[24px] bg-muted/15 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<SimpleChartTooltip />} />
              <Line
                type="monotone"
                dataKey={key}
                name={meta.label}
                stroke={meta.color}
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartSurface>
    </SurfacePanel>
  );
}

function BrokerCard({
  broker,
  isSelected,
  onSelect,
}: {
  broker: WorkspaceProjectAnalyticsBrokerTrackingEntry;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const stateStyles = BROKER_STATE_STYLES[broker.state];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={classNames(
        "w-full rounded-[26px] border p-5 text-right shadow-sm transition-all",
        stateStyles.card,
        isSelected && "ring-2 ring-[var(--workspace-highlight)] ring-offset-2 ring-offset-background",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col items-start gap-2">
          <StateBadge state={broker.state} label={broker.stateLabel} />
          <ActivityBadge activityKey={broker.currentActivityKey} label={broker.currentActivityLabel} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-base font-black text-foreground shadow-sm">
            {broker.brokerAvatarLabel}
          </div>
          <div>
            <div className="text-[14px] font-black text-foreground">{broker.brokerName}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">آخر نشاط: {formatDateTime(broker.lastActivityAt)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-white/60 bg-white/70 px-4 py-4">
        <div className="text-[14px] font-black text-foreground">{getBrokerStateNarrative(broker.state)}</div>
        <div className="mt-2 text-[13px] leading-6 text-muted-foreground">
          {getBrokerActivityNarrative(broker.currentActivityKey, broker.currentActivityLabel)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <span className="inline-flex rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-bold text-foreground">
          {formatNumber(broker.totalCustomers)} عميل
        </span>
        <span className="inline-flex rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-bold text-foreground">
          {formatNumber(broker.trackedCustomers)} داخل النظام
        </span>
        <span className="inline-flex rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-bold text-foreground">
          {formatNumber(broker.views)} زيارة
        </span>
        <span className="inline-flex rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-bold text-foreground">
          {formatNumber(broker.clicks)} تفاعل
        </span>
      </div>
    </button>
  );
}

function BrokerCustomerRow({
  customer,
}: {
  customer: WorkspaceProjectAnalyticsBrokerTrackingCustomer;
}) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-background/70 p-4 text-right">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap justify-end gap-2">
          <ActivityBadge activityKey={customer.activityKey} label={customer.activityLabel} />
          <PrimaryStageBadge stageKey={customer.stageKey} stageLabel={customer.stageLabel} />
          <CustomerSecondaryBadge label={customer.secondaryStateLabel} />
          <span className="inline-flex rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
            {customer.relationTypeLabel}
          </span>
          {customer.isTrackedCustomer ? (
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              داخل النظام
            </span>
          ) : null}
        </div>
        <div>
          <div className="text-[14px] font-black text-foreground">{customer.name}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">آخر نشاط: {formatDateTime(customer.lastActivityAt)}</div>
        </div>
      </div>
    </div>
  );
}

function BrokerTimeline({
  broker,
}: {
  broker: WorkspaceProjectAnalyticsBrokerTrackingEntry;
}) {
  if (!broker.timeline.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
        لا توجد حركات أعمال واضحة لهذا الوسيط بعد.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {broker.timeline.map((item, index) => (
        <div key={item.id} className="relative pr-8">
          {index < broker.timeline.length - 1 ? (
            <span className="absolute right-[11px] top-8 h-[calc(100%+8px)] w-px bg-border/70" />
          ) : null}
          <span className="absolute right-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
          </span>
          <div className="rounded-[22px] border border-border/70 bg-background/70 px-4 py-4 text-right">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-[12px] font-bold tabular-nums text-muted-foreground">{formatDateTime(item.createdAt)}</div>
              <div className="flex-1">
                <div className="text-[14px] font-black text-foreground">{item.title}</div>
                {item.subtitle ? <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{item.subtitle}</div> : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectedBrokerPanel({
  broker,
}: {
  broker: WorkspaceProjectAnalyticsBrokerTrackingEntry | null;
}) {
  if (!broker) {
    return (
      <SurfacePanel
        title="تفاصيل الوسيط"
        description="اختر وسيطاً من القائمة حتى ترى العملاء، المراحل، والتسلسل الزمني الخاص به."
      >
        <div className="rounded-[22px] border border-dashed border-border/70 bg-muted/15 px-4 py-12 text-center text-[13px] font-semibold text-muted-foreground">
          لا يوجد وسيط محدد حالياً.
        </div>
      </SurfacePanel>
    );
  }

  const stageRows = (["new", "contacted", "negotiation", "won", "lost"] as const).map((stageKey) => ({
    key: stageKey,
    label:
      broker.customers.find((customer) => customer.stageKey === stageKey)?.stageLabel ??
      (stageKey === "new"
        ? "مرحلة جديدة"
        : stageKey === "contacted"
          ? "مرحلة الاتصال"
          : stageKey === "negotiation"
            ? "مرحلة التفاوض"
            : stageKey === "won"
              ? "إغلاق ناجح"
              : "إغلاق غير مكتمل"),
    count: broker.customers.filter((customer) => customer.stageKey === stageKey).length,
  }));

  const stateStyles = BROKER_STATE_STYLES[broker.state];
  const productJourney = [
    {
      key: "views",
      label: "فتح المشروع",
      value: broker.views > 0 ? `${formatNumber(broker.views)} زيارة` : "لم يفتح المشروع بعد",
      helper: broker.views > 0 ? "هذا الوسيط شاهد المشروع داخل المنتج." : "لا توجد زيارات مسجلة لهذا الوسيط بعد.",
      active: broker.views > 0,
    },
    {
      key: "clicks",
      label: "تفاعل مع المشروع",
      value: broker.clicks > 0 ? `${formatNumber(broker.clicks)} تفاعل` : "بدون تفاعل واضح",
      helper: broker.clicks > 0 ? "قام بخطوات أعمق من مجرد المشاهدة." : "لم يسجل خطوات تشغيلية واضحة بعد.",
      active: broker.clicks > 0,
    },
    {
      key: "clients",
      label: "جلب عميلاً",
      value: broker.totalCustomers > 0 ? `${formatNumber(broker.totalCustomers)} عميل` : "لا يوجد عميل بعد",
      helper: broker.totalCustomers > 0 ? "هذا الوسيط ربط عميلاً أو أكثر بالمشروع." : "لم يربط أي عميل بالمشروع حتى الآن.",
      active: broker.totalCustomers > 0,
    },
    {
      key: "tracked",
      label: "أدخل العميل للنظام",
      value: broker.trackedCustomers > 0 ? `${formatNumber(broker.trackedCustomers)} داخل النظام` : "لم يدخل النظام بعد",
      helper: broker.trackedCustomers > 0 ? "يوجد عميل حقيقي متابع داخل النظام." : "لا يوجد عميل متابع داخل النظام لهذا الوسيط حتى الآن.",
      active: broker.trackedCustomers > 0,
    },
    {
      key: "result",
      label: "الوضع الحالي",
      value: broker.currentActivityLabel ?? broker.stateLabel,
      helper: getBrokerActivityNarrative(broker.currentActivityKey, broker.currentActivityLabel),
      active: Boolean(broker.currentActivityKey || broker.state === "closed_won"),
    },
  ];

  return (
    <div className="space-y-6">
      <section className={classNames("rounded-[30px] border p-6 shadow-sm", stateStyles.card)}>
        <div className="space-y-5 text-right">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-end gap-3">
                <StateBadge state={broker.state} label={broker.stateLabel} />
                <div className={classNames("flex h-14 w-14 items-center justify-center rounded-[22px] text-lg font-black shadow-sm", stateStyles.soft)}>
                  {broker.brokerAvatarLabel}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">{broker.brokerName}</h2>
                <div className="mt-2 flex flex-wrap justify-end gap-2 text-[12px] font-bold text-muted-foreground">
                  {broker.brokerPhone ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {broker.brokerPhone}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDateTime(broker.lastActivityAt)}
                  </span>
                  <ActivityBadge activityKey={broker.currentActivityKey} label={broker.currentActivityLabel} />
                </div>
                <div className="mt-3 text-[14px] leading-7 text-muted-foreground">{getBrokerStateNarrative(broker.state)}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {productJourney.map((step) => (
              <div
                key={step.key}
                className={classNames(
                  "rounded-[22px] border px-4 py-4 text-right",
                  step.active ? "border-white/70 bg-white/75" : "border-white/40 bg-white/45",
                )}
              >
                <div className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground">{step.label}</div>
                <div className="mt-3 text-[16px] font-black text-foreground">{step.value}</div>
                <div className="mt-2 text-[12px] leading-6 text-muted-foreground">{step.helper}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SurfacePanel
        title="توزيع مراحل هذا الوسيط"
        description="يساعدك على فهم أين يقف عملاء هذا الوسيط الآن داخل الرحلة التجارية."
      >
        <StageChart rows={stageRows} color="#1d4ed8" />
      </SurfacePanel>

      {broker.customers.length ? (
        <SurfacePanel
          title="عملاء هذا الوسيط"
          description="فقط البيانات التي تهم المطور: نوع العميل، مرحلته الأساسية، وهل دخل النظام فعلاً أم لا."
        >
          <div className="space-y-3">
            {broker.customers.map((customer) => (
              <BrokerCustomerRow key={customer.id} customer={customer} />
            ))}
          </div>
        </SurfacePanel>
      ) : null}

      <SurfacePanel
        title="التسلسل الزمني"
        description="حركة الأعمال الحقيقية المرتبطة بهذا الوسيط على هذا المشروع."
      >
        <BrokerTimeline broker={broker} />
      </SurfacePanel>
    </div>
  );
}

function BusinessActivityTimeline({
  analytics,
}: {
  analytics: WorkspaceProjectAnalytics;
}) {
  const timelineItems = useMemo(
    () =>
      analytics.brokerTracking
        .flatMap((broker) =>
          broker.timeline.map((item) => ({
            ...item,
            brokerName: broker.brokerName,
            state: broker.state,
          })),
        )
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, 24),
    [analytics.brokerTracking],
  );

  if (!timelineItems.length) {
    return (
      <SurfacePanel
        title="التسلسل الزمني للأعمال"
        description="هذا القسم يعرض فقط التحركات التجارية المهمة للمطور."
      >
        <div className="rounded-[22px] border border-dashed border-border/70 bg-muted/15 px-4 py-12 text-center text-[13px] font-semibold text-muted-foreground">
          لا توجد تحركات أعمال كافية لعرضها بعد.
        </div>
      </SurfacePanel>
    );
  }

  return (
    <SurfacePanel
      title="التسلسل الزمني للأعمال"
      description="آخر ما حدث فعلياً بين الوسطاء والعملاء على هذا المشروع."
    >
      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <div key={item.id} className="relative pr-8">
            {index < timelineItems.length - 1 ? (
              <span className="absolute right-[11px] top-8 h-[calc(100%+8px)] w-px bg-border/70" />
            ) : null}
            <span className="absolute right-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
            </span>
            <div className="rounded-[22px] border border-border/70 bg-background/70 px-4 py-4 text-right">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div className="text-[12px] font-bold tabular-nums text-muted-foreground">{formatDateTime(item.createdAt)}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className={classNames("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold", BROKER_STATE_STYLES[item.state].badge)}>
                      {item.brokerName}
                    </span>
                  </div>
                  <div className="mt-2 text-[14px] font-black text-foreground">{item.title}</div>
                  {item.subtitle ? <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{item.subtitle}</div> : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfacePanel>
  );
}

/**
 * WHY:   Developers need a project analytics workspace that prioritizes customer pipeline and broker execution over generic engagement metrics.
 * WHAT:  Renders the developer-only analytics journey with a project hero, business overview, broker tracking drilldown, and activity view.
 * HOW:   Uses the enriched project analytics payload to focus on customers, deal stages, broker performance, and business timeline details.
 */
export default function DeveloperProjectAnalyticsPage({
  project,
  analytics,
  onTrackProjectEvent,
  initialActiveTab = "overview",
  initialVisibleBrokerCount,
}: {
  project: WorkspaceProject;
  analytics: WorkspaceProjectAnalytics;
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<{ ok: true }>;
  initialActiveTab?: DeveloperTabKey;
  initialVisibleBrokerCount?: number;
}) {
  const [activeTab, setActiveTab] = useState<DeveloperTabKey>(initialActiveTab);
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(analytics.brokerTracking[0]?.brokerId ?? null);
  const [visibleBrokerCount, setVisibleBrokerCount] = useState(() =>
    Math.min(initialVisibleBrokerCount ?? 5, analytics.brokerTracking.length),
  );
  const [activeMetric, setActiveMetric] = useState<EngagementMetricKey>("views");

  useEffect(() => {
    void onTrackProjectEvent?.({
      eventType: "project_analytics_view",
      source: "project_analytics_page_developer",
    });
  }, [onTrackProjectEvent, project.id]);

  useEffect(() => {
    if (!analytics.brokerTracking.length) {
      setSelectedBrokerId(null);
      return;
    }
    if (!selectedBrokerId || !analytics.brokerTracking.some((broker) => broker.brokerId === selectedBrokerId)) {
      setSelectedBrokerId(analytics.brokerTracking[0]?.brokerId ?? null);
    }
  }, [analytics.brokerTracking, selectedBrokerId]);

  useEffect(() => {
    setVisibleBrokerCount((current) => Math.min(current, analytics.brokerTracking.length));
  }, [analytics.brokerTracking.length]);

  const selectedBroker = useMemo(
    () => analytics.brokerTracking.find((broker) => broker.brokerId === selectedBrokerId) ?? null,
    [analytics.brokerTracking, selectedBrokerId],
  );

  const topBrokers = useMemo(
    () =>
      [...analytics.brokerTracking]
        .sort((left, right) => {
          if (right.totalCustomers !== left.totalCustomers) {
            return right.totalCustomers - left.totalCustomers;
          }
          return (right.lastActivityAt ?? 0) - (left.lastActivityAt ?? 0);
        })
        .slice(0, 4),
    [analytics.brokerTracking],
  );
  const visibleBrokers = analytics.brokerTracking.slice(0, visibleBrokerCount);
  const brokerListLimit = 5;
  const hasMoreBrokers = analytics.brokerTracking.length > visibleBrokerCount;
  const canCollapseBrokerList = visibleBrokerCount > brokerListLimit;

  return (
    <div className="min-h-full bg-background/60 pb-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/ws/projects/${project.id}`}
            className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لتفاصيل المشروع
          </Link>
          <div className="text-right">
            <div className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">Developer Project Analytics</div>
            <div className="mt-1 text-[14px] font-bold text-foreground">{project.title}</div>
          </div>
        </nav>

        <section className="overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-sm">
          <div className="grid gap-0 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="relative min-h-[260px] bg-muted/20">
              <img
                src={project.image}
                alt={project.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
            </div>
            <div className="p-6 lg:p-8">
          <div className="space-y-6 text-right">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] px-3 py-1.5 text-[11px] font-bold text-[var(--workspace-highlight)]">
                  <BarChart3 className="h-4 w-4" />
                      تحليل المطور للمشروع
                    </div>
                    <div>
                      <h1 className="text-3xl font-black tracking-tight text-foreground">{project.title}</h1>
                      <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">{project.shortDescription}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <span className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground">
                      <Users className="h-4 w-4" />
                      {project.location}
                    </span>
                    <span className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground">
                      <Gauge className="h-4 w-4" />
                      {project.priceLabel}
                    </span>
                    <span className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground">
                      <UserRound className="h-4 w-4" />
                      {project.specs.rooms}
                    </span>
                    <span className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-[12px] font-bold text-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                      {project.specs.area}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-3">
          {DEVELOPER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={
                  isActive
                    ? "rounded-[24px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_6%,var(--workspace-panel))] p-5 text-right shadow-sm"
                    : "rounded-[24px] border border-border/60 bg-card p-5 text-right shadow-sm transition hover:border-foreground/15 hover:bg-muted/20"
                }
              >
                <div className="text-sm font-black text-foreground">{tab.label}</div>
                <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{tab.description}</div>
              </button>
            );
          })}
        </div>

        {activeTab === "overview" ? (
          <div className="space-y-6">
            <SurfacePanel
              title="Business Overview"
              description="هذه هي الشاشة التي تهم المطور أولاً: كم عميل دخل، كم عميل حقيقي دخل النظام، وأين يقف الآن."
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard label="إجمالي العملاء" value={analytics.developerSummary.totalCustomers} tone="highlight" />
                <StatCard label="العملاء الحقيقيون في النظام" value={analytics.developerSummary.trackedCustomers} />
                <StatCard label="عملاء عبر وسيط" value={analytics.developerSummary.brokerManagedCustomers} />
                <StatCard label="عملاء داخليون" value={analytics.developerSummary.internalCustomers} />
                <StatCard label="في الإغلاق الناجح" value={analytics.developerSummary.closedWonCustomers} tone="highlight" />
                <StatCard label="في الإغلاق غير المكتمل" value={analytics.developerSummary.closedLostCustomers} />
                <StatCard label="الوسطاء النشطون" value={analytics.developerSummary.activeBrokers} />
                <StatCard label="العملاء الجدد" value={analytics.developerStageSummary.find((entry) => entry.key === "new")?.count ?? 0} />
              </div>
            </SurfacePanel>

            <BrokerStateColumns analytics={analytics} />

            <SurfacePanel
              title="توزيع العملاء على المراحل"
              description="الرحلة الرئيسية هنا هي رحلة العملاء داخل الفَنَل التجاري، وليس مجرد الضغطات والمشاهدات."
            >
              <StageChart rows={analytics.developerStageSummary} color="#111827" />
            </SurfacePanel>

            <EngagementChart
              analytics={analytics}
              activeMetric={activeMetric}
              onMetricChange={setActiveMetric}
            />

            {topBrokers.length ? (
              <SurfacePanel
                title="أهم الوسطاء الآن"
                description="تلخيص سريع للوسطاء الذين يقودون الحركة الفعلية على المشروع."
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  {topBrokers.map((broker) => (
                    <BrokerCard
                      key={broker.brokerId}
                      broker={broker}
                      isSelected={selectedBrokerId === broker.brokerId}
                      onSelect={() => {
                        setSelectedBrokerId(broker.brokerId);
                        setActiveTab("brokers");
                      }}
                    />
                  ))}
                </div>
              </SurfacePanel>
            ) : null}
          </div>
        ) : null}

        {activeTab === "brokers" ? (
          <div className="space-y-6">
            <SurfacePanel
              title="الوسطاء على هذا المشروع"
              description="اختر وسيطاً لترى قصته على هذا المشروع: هل فتح المشروع فقط، جلب عميلاً، أم وصل إلى إغلاق."
            >
              {analytics.brokerTracking.length ? (
                <div className="space-y-4">
                  {visibleBrokers.map((broker) => (
                    <BrokerCard
                      key={broker.brokerId}
                      broker={broker}
                      isSelected={selectedBrokerId === broker.brokerId}
                      onSelect={() => setSelectedBrokerId(broker.brokerId)}
                    />
                  ))}
                  {(hasMoreBrokers || canCollapseBrokerList) ? (
                    <div className="rounded-[24px] border border-border/60 bg-muted/10 p-4 text-right">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[13px] font-black text-foreground">قائمة الوسطاء</div>
                          <div className="mt-1 text-[12px] text-muted-foreground">
                            يعرض {Math.min(visibleBrokerCount, analytics.brokerTracking.length)} من {analytics.brokerTracking.length} وسطاء.
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                        {hasMoreBrokers ? (
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleBrokerCount((current) =>
                                Math.min(current + 5, analytics.brokerTracking.length),
                              )
                            }
                            className="inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_22%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] px-4 py-2 text-[12px] font-bold text-foreground transition hover:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,var(--workspace-panel))]"
                          >
                            عرض المزيد
                          </button>
                        ) : null}
                        {canCollapseBrokerList ? (
                          <button
                            type="button"
                            onClick={() => setVisibleBrokerCount(brokerListLimit)}
                            className="inline-flex items-center rounded-full border border-border/60 bg-background px-4 py-2 text-[12px] font-bold text-muted-foreground transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] hover:text-foreground"
                          >
                            عرض أقل
                          </button>
                        ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[22px] border border-dashed border-border/70 bg-muted/15 px-4 py-12 text-center text-[13px] font-semibold text-muted-foreground">
                  لا يوجد وسطاء مرتبطون بهذا المشروع حتى الآن.
                </div>
              )}
            </SurfacePanel>

            <BrokerStateColumns analytics={analytics} />

            <SelectedBrokerPanel broker={selectedBroker} />
          </div>
        ) : null}

        {activeTab === "activity" ? (
          <div className="space-y-6">
            <BusinessActivityTimeline analytics={analytics} />

            <SurfacePanel
              title="ملخص المراحل والإغلاقات"
              description="القراءة المختصرة أولاً، ثم المخطط تحتها. بهذه الطريقة يظل التركيز على فهم الحالة لا على الرسم فقط."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <StatCard label="مرحلة جديدة" value={analytics.developerStageSummary.find((entry) => entry.key === "new")?.count ?? 0} />
                <StatCard label="مرحلة الاتصال" value={analytics.developerStageSummary.find((entry) => entry.key === "contacted")?.count ?? 0} tone="highlight" />
                <StatCard label="مرحلة التفاوض" value={analytics.developerStageSummary.find((entry) => entry.key === "negotiation")?.count ?? 0} />
                <StatCard label="إغلاق ناجح" value={analytics.developerSummary.closedWonCustomers} tone="highlight" />
                <StatCard label="إغلاق غير مكتمل" value={analytics.developerSummary.closedLostCustomers} />
                <StatCard label="الوسطاء النشطون" value={analytics.developerSummary.activeBrokers} />
              </div>
            </SurfacePanel>

            <SurfacePanel
              title="المراحل الحالية"
              description="مخطط سريع لتركيز العملاء الحالي داخل الفَنَل."
            >
              <StageChart rows={analytics.developerStageSummary} color="#0f766e" />
            </SurfacePanel>

            <BrokerStateColumns analytics={analytics} />

            <EngagementChart
              analytics={analytics}
              activeMetric={activeMetric}
              onMetricChange={setActiveMetric}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
