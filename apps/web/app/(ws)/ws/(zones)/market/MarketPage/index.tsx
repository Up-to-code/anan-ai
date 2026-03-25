import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketEmptyState from "./MarketEmptyState";
import MarketFilters from "./MarketFilters";
import MarketMetricGrid from "./MarketMetricGrid";
import MarketUnderDevelopmentOverlay from "./MarketUnderDevelopmentOverlay";

type MarketPageIntro = {
  title: string;
  description: string;
};

/**
 * WHY:   Every market route should share one consistent frame while still rendering route-specific market content.
 * WHAT:  Wraps the market page in a denser analytics dashboard shell with toolbar filters and KPI cards.
 * HOW:   Uses the shared page model to render route context first, then hands off the main analysis area to the active route.
 */
export default function MarketPage({
  model,
  actionPath,
  intro,
  children,
}: {
  model: WorkspaceMarketPageModel;
  actionPath: string;
  intro: MarketPageIntro;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-slate-50 pb-24">
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 text-right">
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Analyze Market</div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">{intro.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{intro.description}</p>
            </div>
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right sm:grid-cols-3 sm:gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Scope</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{model.scopeLabel}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Range</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{model.dateRange.label}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Top keyword</div>
                <div className="mt-1 text-sm font-medium text-slate-950">{model.keywordInsights.mostResearchedLabel ?? "لا توجد إشارة واضحة"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <MarketFilters model={model} actionPath={actionPath} />
        <MarketMetricGrid model={model} />
        {model.isMockData ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-right text-sm text-amber-800">
            هذه الصفحة تعرض حالياً بيانات تجريبية حتى تتوفر بيانات سوق حقيقية كافية لهذا النطاق.
          </div>
        ) : null}
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right text-sm text-slate-500">
          {model.dateRange.helperText}
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="pointer-events-none select-none opacity-35 blur-[5px]">
            <div className="p-4 md:p-6">
              {model.hasAnyData ? children : <MarketEmptyState />}
            </div>
          </div>
          <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" />
          <MarketUnderDevelopmentOverlay pageTitle={intro.title} />
        </div>
      </div>
    </div>
  );
}
