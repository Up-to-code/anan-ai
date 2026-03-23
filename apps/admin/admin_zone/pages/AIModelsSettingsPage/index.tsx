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
    color: ["#2563eb", "#0f766e", "#a16207", "#7c3aed", "#dc2626", "#0891b2"][index % 6],
  }));
  const priceComparison = models.map((model) => ({
    label: model.name,
    price: model.pricePerMillion,
  }));

  return (
    <SectionScaffold
      eyebrow="إعدادات الذكاء"
      title="النماذج"
      description="متابعة النماذج المستخدمة، استهلاك التوكنز، والتسعير التشغيلي."
      tabs={aiSettingsTabs}
      actions={<PageActions actions={[{ label: "إضافة نموذج", href: "/ai-settings/models/new" }]} />}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {models.map((model) => (
          <WorkspacePanel key={model.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/ai-settings/models/${model.id}`} className="text-xl font-semibold text-slate-900 hover:underline">
                  {model.name}
                </Link>
                <div className="mt-1 text-sm text-slate-500">{model.provider} · {model.team}</div>
              </div>
              <div className="rounded-[8px] border border-border bg-slate-50 px-3 py-1.5 text-xs text-slate-600">{model.status}</div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[8px] border border-border bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] text-slate-500">التوكنز الشهرية</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{formatNumber(model.monthlyTokens)}</div>
              </div>
              <div className="rounded-[8px] border border-border bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] text-slate-500">الحرق</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{formatNumber(model.burnedTokens)}</div>
              </div>
              <div className="rounded-[8px] border border-border bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] text-slate-500">السعر لكل مليون</div>
                <div className="mt-1 text-sm font-medium text-slate-900">${model.pricePerMillion}</div>
              </div>
              <div className="rounded-[8px] border border-border bg-slate-50 px-3 py-2.5">
                <div className="text-[11px] text-slate-500">الفريق</div>
                <div className="mt-1 text-sm font-medium text-slate-900">{model.team}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
              <Link href={`/ai-settings/models/${model.id}/edit`} className="underline-offset-2 hover:underline">تعديل</Link>
              <Link href={`/ai-settings/models/${model.id}/delete`} className="underline-offset-2 hover:underline">حذف</Link>
            </div>
          </WorkspacePanel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <WorkspacePanel className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">اتجاه الاستخدام</h2>
            <p className="mt-1 text-sm text-slate-500">اتجاه شهري مبسّط لاستهلاك النماذج عبر الفرق.</p>
          </div>
          <AreaTrendChart
            data={usageTrend}
            series={[
              { dataKey: "gpt5", label: "GPT-5", color: "#2563eb" },
              { dataKey: "claude", label: "Claude Sonnet", color: "#0f766e" },
              { dataKey: "gemini", label: "Gemini 2.5", color: "#a16207" },
            ]}
          />
        </WorkspacePanel>

        <WorkspacePanel className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">توزيع الحرق</h2>
            <p className="mt-1 text-sm text-slate-500">نسبة الحرق الشهري لكل نموذج داخل فرق الذكاء.</p>
          </div>
          <DonutBreakdownChart data={burnBreakdown} height={220} />
        </WorkspacePanel>
      </div>

      <WorkspacePanel className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">مقارنة الأسعار</h2>
          <p className="mt-1 text-sm text-slate-500">مقارنة مباشرة لسعر كل نموذج لكل مليون توكن.</p>
        </div>
        <MetricBarChart
          data={priceComparison}
          series={[{ dataKey: "price", label: "السعر", color: "#1f2937" }]}
          height={260}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}
