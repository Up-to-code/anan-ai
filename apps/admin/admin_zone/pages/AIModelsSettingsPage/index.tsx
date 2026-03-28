import Link from "next/link";
import AreaTrendChart from "@/components/shared/AreaTrendChart";
import DonutBreakdownChart from "@/components/shared/DonutBreakdownChart";
import MetricBarChart from "@/components/shared/MetricBarChart";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { models } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";
import { formatNumber } from "@/lib/format";

const usageTrend = [
  { label: "أكتوبر", gpt5: 220, claude: 160, gemini: 110 },
  { label: "نوفمبر", gpt5: 240, claude: 170, gemini: 118 },
  { label: "ديسمبر", gpt5: 260, claude: 180, gemini: 126 },
  { label: "يناير", gpt5: 290, claude: 192, gemini: 132 },
  { label: "فبراير", gpt5: 310, claude: 205, gemini: 144 },
  { label: "مارس", gpt5: 328, claude: 214, gemini: 151 },
];

/**
 * WHY:   Model settings need a compact financial and usage view without depending on live token systems yet.
 * WHAT:  Renders active model summaries, a simple usage trend chart, and a pricing table.
 * HOW:   Uses mock records and a static chart series to present the model configuration surface.
 */
export default function AIModelsSettingsPage() {
  const burnBreakdown = models.map((model, index) => ({
    label: model.name,
    value: model.burnedTokens,
    color: ["var(--chart-blue)", "var(--chart-teal)", "var(--chart-amber)", "var(--chart-purple)", "var(--chart-rose)", "var(--chart-cyan)"][index % 6],
  }));
  const priceComparison = models.map((model) => ({
    label: model.name,
    value: model.pricePerMillion,
  }));

  return (
    <SectionScaffold
      eyebrow="إعدادات الذكاء"
      title="النماذج والقدرات"
      description="إدارة نماذج الذكاء، استهلاك التوكنز، والتسعير التشغيلي عبر المنصة."
      tabs={aiSettingsTabs}
      actions={<PageActions actions={[{ label: "إضافة نموذج", href: "/ai-settings/models/new" }]} />}
    >
      <div className="grid gap-6 xl:grid-cols-3">
        {models.map((model) => (
          <WorkspacePanel key={model.id} className="rounded-3xl p-8 flex flex-col gap-6 border-border/30 bg-card/60 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <Link href={`/ai-settings/models/${model.id}`} className="block text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                  {model.name}
                </Link>
                <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">{model.provider} <span className="mx-1">•</span> {model.team}</div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
                {model.status}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/30 bg-muted/5 p-5 space-y-1 group-hover:bg-muted/10 transition-colors">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">التوكنز الشهرية</div>
                <div className="text-sm font-black text-foreground tracking-tight">{formatNumber(model.monthlyTokens)}</div>
              </div>
              <div className="rounded-2xl border border-border/30 bg-muted/5 p-5 space-y-1 group-hover:bg-muted/10 transition-colors">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">نسبة الحرق</div>
                <div className="text-sm font-black text-foreground tracking-tight">{formatNumber(model.burnedTokens)}</div>
              </div>
              <div className="rounded-2xl border border-border/30 bg-muted/5 p-5 space-y-1 group-hover:bg-muted/10 transition-colors">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">السعر / مليون</div>
                <div className="text-sm font-black text-primary tracking-tight">${model.pricePerMillion}</div>
              </div>
              <div className="rounded-2xl border border-border/30 bg-muted/5 p-5 space-y-1 group-hover:bg-muted/10 transition-colors">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">الفريق</div>
                <div className="text-sm font-black text-foreground tracking-tight">{model.team}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 border-t border-border/10 pt-6 mt-auto">
              <Link href={`/ai-settings/models/${model.id}/edit`} className="hover:text-primary transition-colors">تحرير</Link>
              <Link href={`/ai-settings/models/${model.id}/delete`} className="hover:text-rose-500 transition-colors">سحب</Link>
            </div>
          </WorkspacePanel>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <WorkspacePanel className="rounded-3xl p-10 space-y-8 border-border/30 bg-card/40 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">اتجاه الاستهلاك</h2>
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-relaxed">Monthly operational token usage trend across core AI providers.</p>
          </div>
          <div className="min-h-[320px]">
            <AreaTrendChart
              data={usageTrend}
              series={[
                { dataKey: "gpt5", label: "GPT-5", color: "var(--chart-blue)" },
                { dataKey: "claude", label: "Claude Sonnet", color: "var(--chart-teal)" },
                { dataKey: "gemini", label: "Gemini 2.5", color: "var(--chart-amber)" },
              ]}
              height={320}
            />
          </div>
        </WorkspacePanel>

        <WorkspacePanel className="rounded-3xl p-10 space-y-8 border-border/30 bg-card/50 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">توزيع الحرق</h2>
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">Share per model</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <DonutBreakdownChart data={burnBreakdown} height={220} />
          </div>
        </WorkspacePanel>
      </div>

      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-muted/5 shadow-inner">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-foreground">توقع التكلفة والأسعار</h2>
          <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">Price per million tokens comparison</p>
        </div>
        <div className="min-h-[280px]">
          <MetricBarChart
            data={priceComparison}
            series={[{ dataKey: "value", label: "السعر", color: "var(--primary)" }]}
            height={280}
          />
        </div>
      </WorkspacePanel>
    </SectionScaffold>
  );
}
