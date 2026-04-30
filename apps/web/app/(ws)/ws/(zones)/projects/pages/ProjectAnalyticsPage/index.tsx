"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Eye,
  Gauge,
  MousePointerClick,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  WorkspaceProjectAnalyticsBrokerRow,
} from "@/server/contracts/properties";
import { trackProjectEventAction } from "../../actions/trackProjectEvent";
import type { ProjectMutationActionResult } from "../ProjectsPage/actionTypes";
import type { WorkspaceProject } from "../../types/projectTypes";
import DeveloperProjectAnalyticsPage from "./DeveloperProjectAnalyticsPage";

type PerformanceMetricKey = "views" | "clicks" | "clickRate";
type AnalyticsSectionKey = "overview" | "brokers" | "interaction" | "activity";

const CHART_COLORS = {
  views: "#0f766e",
  clicks: "#ea580c",
  primary: "#0f172a",
  secondary: "#475569",
  accent: "#0ea5e9",
  soft: "#94a3b8",
};

const PERFORMANCE_METRIC_LABELS: Record<PerformanceMetricKey, { label: string; helper: string; color: string }> = {
  views: {
    label: "المشاهدات",
    helper: "حجم الوصول الفعلي إلى صفحة المشروع.",
    color: CHART_COLORS.views,
  },
  clicks: {
    label: "النقرات",
    helper: "عدد الأفعال المهمة داخل المشروع.",
    color: CHART_COLORS.clicks,
  },
  clickRate: {
    label: "معدل التفاعل",
    helper: "النقرات كنسبة من المشاهدات.",
    color: CHART_COLORS.accent,
  },
};

const ANALYTICS_SECTIONS: Array<{ key: AnalyticsSectionKey; label: string }> = [
  { key: "overview", label: "نظرة عامة" },
  { key: "brokers", label: "الوسطاء" },
  { key: "interaction", label: "التفاعل" },
  { key: "activity", label: "النشاط" },
];

function formatDateTime(value: number | null) {
  if (!value) return "بدون نشاط";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function computeClickRate(clicks: number, views: number) {
  if (views <= 0) return 0;
  return (clicks / views) * 100;
}

function getRecentWindowTotals(analytics: WorkspaceProjectAnalytics, windowSize = 4) {
  const recentWindow = analytics.visibilityTrend.slice(-windowSize);
  const recentViews = recentWindow.reduce((total, point) => total + point.views, 0);
  const recentClicks = recentWindow.reduce((total, point) => total + point.clicks, 0);

  return { recentWindow, recentViews, recentClicks };
}

function AnalyticsPanel({
  title,
  description,
  actions,
  tone = "default",
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tone?: "default" | "highlight";
  children: React.ReactNode;
}) {
  const panelClassName =
    tone === "highlight"
      ? "rounded-lg border border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-card/80 p-4 shadow-sm"
      : "rounded-lg border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-4 shadow-sm";

  return (
    <section className={panelClassName}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-right">
          <h2 className="text-[16px] font-black text-foreground">{title}</h2>
          {description ? <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChartFallbackMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/60 px-4 py-3 text-right">
      <div className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-black text-foreground">{value}</div>
    </div>
  );
}

function AnalyticsSectionTabs({
  activeSection,
  onChange,
}: {
  activeSection: AnalyticsSectionKey;
  onChange: (section: AnalyticsSectionKey) => void;
}) {
  return (
    <div dir="rtl" className="flex items-center justify-start border-b border-border/70" aria-label="تبويبات تحليلات المشروع">
      <div className="flex flex-wrap justify-start gap-7">
        {ANALYTICS_SECTIONS.map((section) => {
          const isActive = activeSection === section.key;
          return (
            <button
              key={section.key}
              type="button"
              onClick={() => onChange(section.key)}
              className={
                isActive
                  ? "border-b-2 border-foreground px-1 pb-3 text-[13px] font-black text-foreground"
                  : "border-b-2 border-transparent px-1 pb-3 text-[13px] font-bold text-muted-foreground transition hover:text-foreground"
              }
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChartSurface({
  fallback,
  children,
}: {
  fallback: React.ReactNode;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canRenderChart, setCanRenderChart] = useState(false);

  useEffect(() => {
    const measure = () => {
      setCanRenderChart((containerRef.current?.clientWidth ?? 0) > 0);
    };

    measure();

    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      const observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={containerRef} className="h-[280px] w-full">
      {canRenderChart ? children : fallback}
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
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-border/70 bg-background px-4 py-3 text-right shadow-lg">
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

function SignalBoard({
  analytics,
}: {
  analytics: WorkspaceProjectAnalytics;
}) {
  const latestEvent = analytics.recentEvents[0] ?? null;

  return (
    <section className="space-y-3 text-right">
      <div>
        <h2 className="text-[16px] font-black text-foreground">الحركة المباشرة</h2>
        <div className="mt-2 flex items-center justify-end gap-2 text-[12px] font-bold text-muted-foreground">
          <span>يتم التحديث مباشرة من حركة المشروع</span>
          <span className="h-2 w-2 rounded-full bg-sky-400" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/60 bg-[var(--workspace-elevated)] p-4">
          <Users className="mb-3 h-4 w-4 text-muted-foreground" />
          <div className="text-2xl font-black text-foreground">{formatNumber(analytics.kpis.connectedBrokers)}</div>
          <div className="mt-1 text-[11px] font-bold text-muted-foreground">وسطاء</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-[var(--workspace-elevated)] p-4">
          <Activity className="mb-3 h-4 w-4 text-muted-foreground" />
          <div className="text-2xl font-black text-foreground">{formatNumber(analytics.kpis.activeCases)}</div>
          <div className="mt-1 text-[11px] font-bold text-muted-foreground">حالات</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-[var(--workspace-elevated)] p-4">
          <CheckCircle2 className="mb-3 h-4 w-4 text-muted-foreground" />
          <div className="text-2xl font-black text-foreground">{formatNumber(analytics.kpis.activeDeals)}</div>
          <div className="mt-1 text-[11px] font-bold text-muted-foreground">صفقات</div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-[var(--workspace-elevated)] p-4">
        <div className="text-[11px] font-bold text-muted-foreground">آخر نشاط</div>
        {latestEvent ? (
          <>
            <div className="mt-2 text-[14px] font-black text-foreground">{latestEvent.title}</div>
            <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
              {latestEvent.subtitle ?? "نشاط على المشروع"} · {formatDateTime(latestEvent.createdAt)}
            </div>
          </>
        ) : (
          <div className="mt-2 text-[13px] font-bold text-muted-foreground">لا يوجد نشاط بعد.</div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ChartFallbackMetric label="عملاء الوسطاء" value={formatNumber(analytics.kpis.brokerManagedClients)} />
        <ChartFallbackMetric label="إجمالي النقرات" value={formatNumber(analytics.kpis.totalClicks)} />
      </div>
    </section>
  );
}

function VisibilityTrendChart({
  analytics,
  activeMetric,
  onMetricChange,
  clickRate,
}: {
  analytics: WorkspaceProjectAnalytics;
  activeMetric: PerformanceMetricKey;
  onMetricChange: (metric: PerformanceMetricKey) => void;
  clickRate: number;
}) {
  const { recentWindow, recentViews, recentClicks } = getRecentWindowTotals(analytics);
  const chartData = analytics.visibilityTrend.map((point) => ({
    ...point,
    clickRate: computeClickRate(point.clicks, point.views),
  }));
  const metricMeta = PERFORMANCE_METRIC_LABELS[activeMetric];
  const dataKey = activeMetric === "clickRate" ? "clickRate" : activeMetric;
  const latestPoint = chartData.at(-1);
  const metricCards: Array<{
    key: PerformanceMetricKey;
    label: string;
    value: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "views",
      label: "المشاهدات",
      value: formatNumber(analytics.kpis.totalViews),
      icon: <Eye className="h-4 w-4" />,
    },
    {
      key: "clicks",
      label: "النقرات",
      value: formatNumber(analytics.kpis.totalClicks),
      icon: <MousePointerClick className="h-4 w-4" />,
    },
    {
      key: "clickRate",
      label: "معدل التفاعل",
      value: formatPercent(clickRate),
      icon: <Gauge className="h-4 w-4" />,
    },
  ];

  return (
    <AnalyticsPanel
      title="أداء المشروع عبر الزمن"
      description="راقب تطور الوصول والتفاعل عبر الزمن من نفس الرسم."
    >
      <div className="mb-5 grid overflow-hidden rounded-lg border border-border/60 bg-background/65 sm:grid-cols-4">
        {metricCards.map((metric) => {
          const isActive = activeMetric === metric.key;
          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => onMetricChange(metric.key)}
              className={
                isActive
                  ? "border-b border-border/60 bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,transparent)] p-4 text-right sm:border-b-0 sm:border-l"
                  : "border-b border-border/60 p-4 text-right transition hover:bg-background sm:border-b-0 sm:border-l"
              }
            >
              <span className={isActive ? "text-[var(--workspace-highlight)]" : "text-muted-foreground"}>{metric.icon}</span>
              <span className="mt-3 block text-[11px] font-bold text-muted-foreground">{metric.label}</span>
              <span className="mt-1 block text-2xl font-black text-foreground">{metric.value}</span>
            </button>
          );
        })}
        <div className="p-4 text-right">
          <Users className="mb-3 h-4 w-4 text-muted-foreground" />
          <div className="text-[11px] font-bold text-muted-foreground">الوسطاء المرتبطون</div>
          <div className="mt-1 text-2xl font-black text-foreground">{formatNumber(analytics.kpis.connectedBrokers)}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3 text-[12px] font-bold text-muted-foreground">
        <span>
          {latestPoint
            ? `آخر نقطة: ${latestPoint.label} · ${
                activeMetric === "clickRate"
                  ? formatPercent(latestPoint.clickRate)
                  : formatNumber(activeMetric === "views" ? latestPoint.views : latestPoint.clicks)
              }`
            : "لا توجد نقاط مسجلة بعد"}
        </span>
        <span>{metricMeta.helper}</span>
      </div>

      <ChartSurface
        fallback={
          <div className="grid h-full content-start gap-3 rounded-md bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-4">
            <ChartFallbackMetric label="آخر نافذة" value={`${recentWindow.length} يوم`} />
            <ChartFallbackMetric label="مشاهدات قريبة" value={formatNumber(recentViews)} />
            <ChartFallbackMetric label="نقرات قريبة" value={formatNumber(recentClicks)} />
            <ChartFallbackMetric label="معدل التفاعل" value={formatPercent(clickRate)} />
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleChartTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={metricMeta.label}
              stroke={metricMeta.color}
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartSurface>
    </AnalyticsPanel>
  );
}

function BrokerStateChart({ analytics }: { analytics: WorkspaceProjectAnalytics }) {
  return (
    <AnalyticsPanel
      title="توزيع حالة الوسطاء"
      description="لقطة سريعة لحالة شبكة الوسطاء الآن."
    >
      <ChartSurface
        fallback={
          <div className="grid h-full content-start gap-3 rounded-md bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {analytics.brokerStateSummary.map((entry) => (
              <ChartFallbackMetric key={entry.key} label={entry.label} value={formatNumber(entry.count)} />
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.brokerStateSummary} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleChartTooltip />} />
            <Bar dataKey="count" name="عدد الوسطاء" radius={[10, 10, 0, 0]} maxBarSize={56}>
              {analytics.brokerStateSummary.map((entry, index) => (
                <Cell
                  key={entry.key}
                  fill={[CHART_COLORS.secondary, CHART_COLORS.accent, CHART_COLORS.views, "#16a34a", "#dc2626"][index] ?? CHART_COLORS.soft}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartSurface>
    </AnalyticsPanel>
  );
}

function TopBrokerChart({ rows }: { rows: WorkspaceProjectAnalyticsBrokerRow[] }) {
  const data = useMemo(
    () =>
      rows.slice(0, 6).map((row) => ({
        brokerName: row.brokerName,
        views: row.views,
        clicks: row.clicks,
      })),
    [rows],
  );

  return (
    <AnalyticsPanel
      title="أعلى الوسطاء تفاعلاً"
      description="مقارنة مباشرة بين الوسطاء الأكثر نشاطاً على المشروع."
    >
      <ChartSurface
        fallback={
          <div className="grid h-full content-start gap-3 rounded-md bg-muted/20 p-4">
            {data.length > 0 ? (
              data.map((row) => (
                <div key={row.brokerName} className="rounded-md border border-border/70 bg-background/80 px-4 py-3 text-right">
                  <div className="text-[14px] font-black text-foreground">{row.brokerName}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    {formatNumber(row.views)} مشاهدة / {formatNumber(row.clicks)} نقرة
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-border/70 bg-background/80 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
                لا يوجد وسطاء لعرض المقارنة بعد.
              </div>
            )}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="brokerName" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleChartTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 20, fontSize: "12px" }} />
            <Bar dataKey="views" name="المشاهدات" fill={CHART_COLORS.views} radius={[8, 8, 0, 0]} maxBarSize={36} />
            <Bar dataKey="clicks" name="النقرات" fill={CHART_COLORS.clicks} radius={[8, 8, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartSurface>
    </AnalyticsPanel>
  );
}

function InteractionChart({ analytics }: { analytics: WorkspaceProjectAnalytics }) {
  return (
    <AnalyticsPanel
      title="أنواع التفاعل"
      description="ما الذي يحدث داخل المشروع فعلياً: فتح، تحليل، تعديل، ملفات، أو محادثات."
    >
      <ChartSurface
        fallback={
          <div className="grid h-full content-start gap-3 rounded-md bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {analytics.interactionSummary.map((entry) => (
              <ChartFallbackMetric key={entry.eventType} label={entry.label} value={formatNumber(entry.count)} />
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.interactionSummary} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleChartTooltip />} />
            <Bar dataKey="count" name="عدد التفاعلات" fill={CHART_COLORS.accent} radius={[10, 10, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </ChartSurface>
    </AnalyticsPanel>
  );
}

function StageSummaryChart({ analytics }: { analytics: WorkspaceProjectAnalytics }) {
  return (
    <AnalyticsPanel
      title="المراحل الحالية"
      description="توزيع الحالات الحالية بين مراحل الصفقات والعروض."
    >
      <ChartSurface
        fallback={
          <div className="grid h-full content-start gap-3 rounded-md bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {analytics.stageSummary.map((entry) => (
              <ChartFallbackMetric key={entry.key} label={entry.label} value={formatNumber(entry.count)} />
            ))}
          </div>
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics.stageSummary} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<SimpleChartTooltip />} />
            <Bar dataKey="count" name="عدد الحالات" radius={[10, 10, 0, 0]} maxBarSize={48}>
              {analytics.stageSummary.map((item) => (
                <Cell key={item.key} fill={item.kind === "deal" ? CHART_COLORS.primary : CHART_COLORS.accent} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartSurface>
    </AnalyticsPanel>
  );
}

function BrokerTable({ rows }: { rows: WorkspaceProjectAnalyticsBrokerRow[] }) {
  return (
    <AnalyticsPanel
      title="تفاصيل شبكة الوسطاء"
      description="تفاصيل كل وسيط: الحالة، العميل، المرحلة الحالية، والمشاهدات والنقرات."
    >
      {rows.length > 0 ? (
        <>
          <div className="space-y-3 lg:hidden">
            {rows.map((row) => (
              <div key={row.brokerId} className="rounded-md border border-border/70 bg-background/75 p-4 text-right">
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-[11px] font-bold text-foreground">
                    {row.stateLabel}
                  </span>
                  <div>
                    <div className="text-[14px] font-black text-foreground">{row.brokerName}</div>
                    <div className="mt-1 text-[12px] text-muted-foreground">{row.brokerPhone ?? "بدون جهة اتصال"}</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ChartFallbackMetric label="العميل" value={row.linkedClientName ?? "غير مرتبط"} />
                  <ChartFallbackMetric label="المرحلة الحالية" value={row.currentStageLabel} />
                  <ChartFallbackMetric label="المشاهدات" value={formatNumber(row.views)} />
                  <ChartFallbackMetric label="النقرات" value={formatNumber(row.clicks)} />
                </div>
                <div className="mt-3 text-[12px] text-muted-foreground">آخر نشاط: {formatDateTime(row.lastActivityAt)}</div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full divide-y divide-border text-right">
              <thead>
                <tr className="text-[11px] font-bold tracking-[0.16em] text-muted-foreground">
                  <th className="px-3 py-3">الوسيط</th>
                  <th className="px-3 py-3">الحالة</th>
                  <th className="px-3 py-3">العميل</th>
                  <th className="px-3 py-3">المرحلة الحالية</th>
                  <th className="px-3 py-3">المشاهدات</th>
                  <th className="px-3 py-3">النقرات</th>
                  <th className="px-3 py-3">آخر نشاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row) => (
                  <tr key={row.brokerId} className="text-[13px] text-foreground">
                    <td className="px-3 py-4">
                      <div className="font-black">{row.brokerName}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">{row.brokerPhone ?? "بدون جهة اتصال"}</div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-[11px] font-bold">
                        {row.stateLabel}
                      </span>
                    </td>
                    <td className="px-3 py-4">{row.linkedClientName ?? "غير مرتبط"}</td>
                    <td className="px-3 py-4">{row.currentStageLabel}</td>
                    <td className="px-3 py-4">{formatNumber(row.views)}</td>
                    <td className="px-3 py-4">{formatNumber(row.clicks)}</td>
                    <td className="px-3 py-4 text-muted-foreground">{formatDateTime(row.lastActivityAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
          لا توجد علاقات وسطاء مسجلة لهذا المشروع بعد.
        </div>
      )}
    </AnalyticsPanel>
  );
}

function RecentActivityList({ analytics }: { analytics: WorkspaceProjectAnalytics }) {
  const visibleEvents = analytics.recentEvents.slice(0, 8);
  const hiddenCount = Math.max(analytics.recentEvents.length - visibleEvents.length, 0);

  return (
    <AnalyticsPanel
      title="التسلسل الزمني للنشاط"
      description="سجل مرتب زمنياً لأهم ما حدث حول المشروع."
    >
      {visibleEvents.length > 0 ? (
        <div className="space-y-4">
          {visibleEvents.map((event, index) => (
            <div key={event.id} className="relative pr-8">
              {index < visibleEvents.length - 1 ? (
                <span className="absolute right-[11px] top-8 h-[calc(100%+8px)] w-px bg-border/70" />
              ) : null}
              <span className="absolute right-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-[var(--workspace-highlight)]">
                <Clock3 className="h-3.5 w-3.5" />
              </span>
              <div className="rounded-md border border-border/70 bg-background/75 px-4 py-4 text-right">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="text-[12px] font-bold tabular-nums text-muted-foreground">
                    {formatDateTime(event.createdAt)}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-black text-foreground">{event.title}</div>
                    {event.subtitle ? (
                      <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{event.subtitle}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {hiddenCount > 0 ? (
            <div className="rounded-md border border-dashed border-border/70 bg-background/50 px-4 py-3 text-center text-[12px] font-bold text-muted-foreground">
              يوجد {formatNumber(hiddenCount)} نشاط إضافي محفوظ في سجل المشروع.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
          لا توجد نشاطات مرتبطة بهذا المشروع بعد.
        </div>
      )}
    </AnalyticsPanel>
  );
}

/**
 * WHY:   Project analytics should feel like one organized owner workspace instead of scattered diagnostic cards.
 * WHAT:  Renders the owner-facing analytics screen with a guided header, grouped signal boards, charts, and network/activity sections.
 * HOW:   Uses local tab state plus the aggregated analytics payload to surface the overview, broker network, and activity story in a clearer hierarchy.
 */
function BrokerProjectAnalyticsPage({
  project,
  analytics,
  onTrackProjectEvent,
}: {
  project: WorkspaceProject;
  analytics: WorkspaceProjectAnalytics;
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<ProjectMutationActionResult>;
}) {
  const [activePerformanceMetric, setActivePerformanceMetric] =
    useState<PerformanceMetricKey>("views");
  const [activeSection, setActiveSection] = useState<AnalyticsSectionKey>("overview");
  const clickRate = useMemo(
    () => computeClickRate(analytics.kpis.totalClicks, analytics.kpis.totalViews),
    [analytics.kpis.totalClicks, analytics.kpis.totalViews],
  );

  useEffect(() => {
    void onTrackProjectEvent?.({
      eventType: "project_analytics_view",
      source: "project_analytics_page",
    });
  }, [onTrackProjectEvent, project.id]);

  return (
    <div className="flex w-full flex-col gap-5">
      <AnalyticsSectionTabs activeSection={activeSection} onChange={setActiveSection} />

      {activeSection === "overview" ? (
        <div className="space-y-5">
          <VisibilityTrendChart
            analytics={analytics}
            activeMetric={activePerformanceMetric}
            onMetricChange={setActivePerformanceMetric}
            clickRate={clickRate}
          />
          <SignalBoard analytics={analytics} />
        </div>
      ) : null}

      {activeSection === "brokers" ? (
        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <BrokerStateChart analytics={analytics} />
            <TopBrokerChart rows={analytics.brokerRows} />
          </div>

          <BrokerTable rows={analytics.brokerRows} />
        </div>
      ) : null}

      {activeSection === "interaction" ? (
        <div className="grid gap-5 xl:grid-cols-2">
          <StageSummaryChart analytics={analytics} />
          <InteractionChart analytics={analytics} />
        </div>
      ) : null}

      {activeSection === "activity" ? <RecentActivityList analytics={analytics} /> : null}
    </div>
  );
}

/**
 * WHY:   Project analytics now needs distinct journeys for developer owners and broker owners on the same route.
 * WHAT:  Dispatches to the developer-focused analytics workspace or the legacy broker analytics workspace.
 * HOW:   Branches by normalized workspace audience while preserving the same project analytics payload contract.
 */
export default function ProjectAnalyticsPage({
  project,
  analytics,
  ownerAudience = "broker",
  onTrackProjectEvent,
}: {
  project: WorkspaceProject;
  analytics: WorkspaceProjectAnalytics;
  ownerAudience?: "broker" | "developer";
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<ProjectMutationActionResult>;
}) {
  const trackProjectEvent = onTrackProjectEvent ?? ((input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) =>
    trackProjectEventAction({
      propertyId: project.propertyId,
      eventType: input.eventType,
      source: input.source,
    }));

  if (ownerAudience === "developer") {
    return (
      <DeveloperProjectAnalyticsPage
        project={project}
        analytics={analytics}
        onTrackProjectEvent={trackProjectEvent}
      />
    );
  }

  return (
    <BrokerProjectAnalyticsPage
      project={project}
      analytics={analytics}
      onTrackProjectEvent={trackProjectEvent}
    />
  );
}
