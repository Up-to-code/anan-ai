"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
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
import type { WorkspaceProject } from "../../types/projectTypes";
import DeveloperProjectAnalyticsPage from "./DeveloperProjectAnalyticsPage";

type AnalyticsTabKey = "overview" | "network" | "activity";
type PerformanceMetricKey = "views" | "clicks" | "clickRate";

const CHART_COLORS = {
  views: "#0f766e",
  clicks: "#ea580c",
  primary: "#0f172a",
  secondary: "#475569",
  accent: "#0ea5e9",
  soft: "#94a3b8",
};

const TAB_LABELS: { key: AnalyticsTabKey; label: string; description: string }[] = [
  {
    key: "overview",
    label: "الأداء",
    description: "ابدأ من الوصول والتفاعل واقرأ القصة العامة للمشروع في شاشة واحدة.",
  },
  {
    key: "network",
    label: "شبكة الوسطاء",
    description: "من يقود الحركة، وأين تقف الحالات الحالية داخل الشبكة.",
  },
  {
    key: "activity",
    label: "النشاط والمراحل",
    description: "تابع أحدث الإشارات، وتوزيع التفاعلات، والمراحل المفتوحة الآن.",
  },
];

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

function KpiCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  tone?: "default" | "highlight";
}) {
  const cardClassName =
    tone === "highlight"
      ? "rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-highlight)_20%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_4%,var(--workspace-panel))] p-4 text-right"
      : "rounded-2xl border border-border/50 bg-card/70 p-4 text-right";

  return (
    <div className={cardClassName}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <div className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">{label}</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-foreground">
            {typeof value === "number" ? formatNumber(value) : value}
          </div>
        </div>
        <div
          className={
            tone === "highlight"
              ? "flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] text-[var(--workspace-highlight)]"
              : "flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground"
          }
        >
          {icon}
        </div>
      </div>
      {helper ? <div className="mt-3 text-[13px] leading-6 text-muted-foreground">{helper}</div> : null}
    </div>
  );
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
      ? "rounded-[28px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-card/80 p-5 shadow-sm lg:p-6"
      : "rounded-[28px] border border-border/60 bg-card/80 p-5 shadow-sm lg:p-6";

  return (
    <section className={panelClassName}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-right">
          <h2 className="text-lg font-black text-foreground">{title}</h2>
          {description ? <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AnalyticsTabs({
  activeTab,
  onChange,
}: {
  activeTab: AnalyticsTabKey;
  onChange: (tab: AnalyticsTabKey) => void;
}) {
  const activeConfig = TAB_LABELS.find((tab) => tab.key === activeTab) ?? TAB_LABELS[0];

  return (
    <section
      className="rounded-[26px] border border-border/60 bg-card/80 p-3 shadow-sm lg:p-4"
      aria-label="Project analytics tabs"
    >
      <div className="flex flex-wrap justify-end gap-2">
        {TAB_LABELS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={
                isActive
                  ? "inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] px-4 py-2.5 text-[13px] font-black text-foreground transition-all"
                  : "inline-flex items-center rounded-full border border-border/60 bg-background/60 px-4 py-2.5 text-[13px] font-bold text-muted-foreground transition-all hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_14%,var(--workspace-border))] hover:text-foreground"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-right text-[13px] leading-6 text-muted-foreground">{activeConfig.description}</p>
    </section>
  );
}

function ChartMetricTabs({
  activeMetric,
  onChange,
}: {
  activeMetric: PerformanceMetricKey;
  onChange: (metric: PerformanceMetricKey) => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2" aria-label="Performance chart metrics">
      {Object.entries(PERFORMANCE_METRIC_LABELS).map(([key, config]) => {
        const isActive = activeMetric === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as PerformanceMetricKey)}
            className={
              isActive
                ? "inline-flex items-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_30%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] px-4 py-2 text-[12px] font-bold text-foreground transition-all"
                : "inline-flex items-center rounded-full border border-border/60 bg-transparent px-4 py-2 text-[12px] font-bold text-muted-foreground transition-all hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] hover:text-foreground"
            }
          >
            {config.label}
          </button>
        );
      })}
    </div>
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
    <div className="rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-right">
      <div className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-black text-foreground">{value}</div>
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
    <div ref={containerRef} className="h-[320px] w-full">
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
    <div className="rounded-xl border border-border/70 bg-background px-4 py-3 text-right">
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

function ProjectAnalyticsHeader({
  project,
}: {
  project: WorkspaceProject;
}) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card/80 p-6 shadow-sm lg:p-8">
      <div className="space-y-5 text-right">
        <div className="text-[12px] font-semibold text-muted-foreground">تحليل المشروع</div>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">{project.title}</h1>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">
              {project.shortDescription || project.summary}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-[12px] font-bold text-foreground">
              {project.location}
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-[12px] font-bold text-foreground">
              {project.priceLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/65 px-3 py-1.5 text-[12px] font-bold text-foreground">
              {project.specs.area}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalBoard({
  analytics,
  clickRate,
}: {
  analytics: WorkspaceProjectAnalytics;
  clickRate: number;
}) {
  return (
    <AnalyticsPanel
      title="لوحة الإشارات الأساسية"
      description="ملخص سريع للحركة الحالية قبل الدخول إلى التفاصيل."
    >
      <div className="space-y-6">
        <div>
          <div className="text-right text-[12px] font-bold text-muted-foreground">مؤشرات الأداء</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="المشاهدات"
              value={analytics.kpis.totalViews}
              helper="حجم الوصول الخام لهذا المشروع."
              icon={<Eye className="h-5 w-5" />}
              tone="highlight"
            />
            <KpiCard
              label="النقرات"
              value={analytics.kpis.totalClicks}
              helper="الأفعال التي تتجاوز المشاهدة فقط."
              icon={<MousePointerClick className="h-5 w-5" />}
            />
            <KpiCard
              label="معدل التفاعل"
              value={formatPercent(clickRate)}
              helper="النقرات نسبة إلى إجمالي المشاهدات."
              icon={<Gauge className="h-5 w-5" />}
              tone="highlight"
            />
            <KpiCard
              label="الوسطاء المرتبطون"
              value={analytics.kpis.connectedBrokers}
              helper="عدد الوسطاء الذين يحرّكون المشروع الآن."
              icon={<Users className="h-5 w-5" />}
            />
          </div>
        </div>

        <div>
          <div className="text-right text-[12px] font-bold text-muted-foreground">السياق التشغيلي</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <KpiCard
              label="العملاء المدارون"
              value={analytics.kpis.brokerManagedClients}
              helper="عملاء مرتبطون بعلاقات broker-managed."
              icon={<Users className="h-5 w-5" />}
            />
            <KpiCard
              label="الحالات النشطة"
              value={analytics.kpis.activeCases}
              helper="علاقات أو عروض لا تزال مفتوحة."
              icon={<Activity className="h-5 w-5" />}
            />
            <KpiCard
              label="الصفقات النشطة"
              value={analytics.kpis.activeDeals}
              helper="صفقات مرتبطة بالمشروع ولم تغلق بعد."
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
    </AnalyticsPanel>
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

  return (
    <AnalyticsPanel
      title="أداء المشروع عبر الزمن"
      description="راقب تطور الوصول والتفاعل عبر الزمن من نفس الرسم."
      actions={<ChartMetricTabs activeMetric={activeMetric} onChange={onMetricChange} />}
    >
      <div className="mb-5 rounded-[24px] border border-border/60 bg-background/70 p-4">
        <div className="text-right">
          <div className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">{metricMeta.label}</div>
          <div className="mt-2 text-3xl font-black text-foreground">
            {activeMetric === "clickRate"
              ? formatPercent(clickRate)
              : formatNumber(activeMetric === "views" ? analytics.kpis.totalViews : analytics.kpis.totalClicks)}
          </div>
          <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{metricMeta.helper}</div>
          {latestPoint ? (
            <div className="mt-2 text-[12px] font-semibold text-muted-foreground">
              آخر نقطة مسجلة: {latestPoint.label} •{" "}
              {activeMetric === "clickRate"
                ? formatPercent(latestPoint.clickRate)
                : formatNumber(activeMetric === "views" ? latestPoint.views : latestPoint.clicks)}
            </div>
          ) : null}
        </div>
      </div>

      <ChartSurface
        fallback={
          <div className="grid h-full content-start gap-3 rounded-[20px] bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ChartFallbackMetric label="آخر 4 أيام" value={`${recentWindow.length} يوم`} />
        <ChartFallbackMetric label="المشاهدات القريبة" value={formatNumber(recentViews)} />
        <ChartFallbackMetric label="النقرات القريبة" value={formatNumber(recentClicks)} />
        <ChartFallbackMetric label="معدل التفاعل العام" value={formatPercent(clickRate)} />
      </div>
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
          <div className="grid h-full content-start gap-3 rounded-[20px] bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <div className="grid h-full content-start gap-3 rounded-[20px] bg-muted/20 p-4">
            {data.length > 0 ? (
              data.map((row) => (
                <div key={row.brokerName} className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-right">
                  <div className="text-[14px] font-black text-foreground">{row.brokerName}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">
                    {formatNumber(row.views)} مشاهدة / {formatNumber(row.clicks)} نقرة
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
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
          <div className="grid h-full content-start gap-3 rounded-[20px] bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-3">
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
          <div className="grid h-full content-start gap-3 rounded-[20px] bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-3">
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
              <div key={row.brokerId} className="rounded-[22px] border border-border/70 bg-background/75 p-4 text-right">
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
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
          لا توجد علاقات وسطاء مسجلة لهذا المشروع بعد.
        </div>
      )}
    </AnalyticsPanel>
  );
}

function RecentActivityList({ analytics }: { analytics: WorkspaceProjectAnalytics }) {
  return (
    <AnalyticsPanel
      title="التسلسل الزمني للنشاط"
      description="سجل مرتب زمنياً لأهم ما حدث حول المشروع."
    >
      {analytics.recentEvents.length > 0 ? (
        <div className="space-y-4">
          {analytics.recentEvents.map((event, index) => (
            <div key={event.id} className="relative pr-8">
              {index < analytics.recentEvents.length - 1 ? (
                <span className="absolute right-[11px] top-8 h-[calc(100%+8px)] w-px bg-border/70" />
              ) : null}
              <span className="absolute right-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_24%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-[var(--workspace-highlight)]">
                <Clock3 className="h-3.5 w-3.5" />
              </span>
              <div className="rounded-[22px] border border-border/70 bg-background/75 px-4 py-4 text-right">
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
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
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
  }) => Promise<{ ok: true }>;
}) {
  const [activeTab, setActiveTab] = useState<AnalyticsTabKey>("overview");
  const [activePerformanceMetric, setActivePerformanceMetric] =
    useState<PerformanceMetricKey>("views");
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
    <div className="min-h-full bg-background/60 pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/ws/projects/${project.id}`}
            className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لتفاصيل المشروع
          </Link>
          <div className="text-right">
            <div className="text-[11px] font-bold tracking-[0.18em] text-muted-foreground">Project Analytics</div>
            <div className="mt-1 text-[14px] font-bold text-foreground">{project.title}</div>
          </div>
        </nav>

        <ProjectAnalyticsHeader project={project} />

        <AnalyticsTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.92fr)_minmax(0,1.08fr)]">
            <SignalBoard analytics={analytics} clickRate={clickRate} />
            <VisibilityTrendChart
              analytics={analytics}
              activeMetric={activePerformanceMetric}
              onMetricChange={setActivePerformanceMetric}
              clickRate={clickRate}
            />
          </div>
        ) : null}

        {activeTab === "network" ? (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <BrokerStateChart analytics={analytics} />
              <TopBrokerChart rows={analytics.brokerRows} />
            </div>
            <BrokerTable rows={analytics.brokerRows} />
          </div>
        ) : null}

        {activeTab === "activity" ? (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <StageSummaryChart analytics={analytics} />
              <InteractionChart analytics={analytics} />
            </div>
            <RecentActivityList analytics={analytics} />
          </div>
        ) : null}
      </div>
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
  }) => Promise<{ ok: true }>;
}) {
  if (ownerAudience === "developer") {
    return (
      <DeveloperProjectAnalyticsPage
        project={project}
        analytics={analytics}
        onTrackProjectEvent={onTrackProjectEvent}
      />
    );
  }

  return (
    <BrokerProjectAnalyticsPage
      project={project}
      analytics={analytics}
      onTrackProjectEvent={onTrackProjectEvent}
    />
  );
}
