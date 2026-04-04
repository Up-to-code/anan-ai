import type { WorkspaceMarketPageModel } from "../../types/marketTypes";
import MarketEmptyState from "./MarketEmptyState";
import MarketFilters from "./MarketFilters";
import MarketMetricGrid from "./MarketMetricGrid";
import MarketUnderDevelopmentOverlay from "./MarketUnderDevelopmentOverlay";

type MarketPageIntro = {
  title: string;
  description: string;
};

type MarketPageLabels = {
  analyzeMarket: string;
  scope: string;
  range: string;
  topKeyword: string;
  noClearSignal: string;
  mockDataBanner: string;
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
  labels = {
    analyzeMarket: "Analyze Market",
    scope: "Scope",
    range: "Range",
    topKeyword: "Top keyword",
    noClearSignal: "لا توجد إشارة واضحة",
    mockDataBanner: "هذه الصفحة تعرض حالياً بيانات تجريبية حتى تتوفر بيانات سوق حقيقية كافية لهذا النطاق.",
  },
  children,
}: {
  model: WorkspaceMarketPageModel;
  actionPath: string;
  intro: MarketPageIntro;
  labels?: MarketPageLabels;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-background pb-24">
      <div className="border-b border-border bg-card">
        <div className="px-6 py-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 text-right">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{labels.analyzeMarket}</div>
              <h1 className="mt-2 text-3xl font-bold text-foreground">{intro.title}</h1>
              <p className="mt-2 max-w-3xl text-[14px] font-medium leading-6 text-muted-foreground">{intro.description}</p>
            </div>
            <div className="grid gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3 text-right sm:grid-cols-3 sm:gap-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{labels.scope}</div>
                <div className="mt-1 text-[13px] font-bold text-foreground">{model.scopeLabel}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{labels.range}</div>
                <div className="mt-1 text-[13px] font-bold text-foreground">{model.dateRange.label}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{labels.topKeyword}</div>
                <div className="mt-1 text-[13px] font-bold text-foreground">{model.keywordInsights.mostResearchedLabel ?? labels.noClearSignal}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <MarketFilters model={model} actionPath={actionPath} />
        <MarketMetricGrid model={model} />
        {model.isMockData ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-right text-[13px] font-bold text-amber-700 dark:text-amber-400">
            {labels.mockDataBanner}
          </div>
        ) : null}
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-right text-[13px] font-bold text-muted-foreground">
          {model.dateRange.helperText}
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="pointer-events-none select-none opacity-35 blur-[5px]">
            <div className="p-4 md:p-6">
              {model.hasAnyData ? children : <MarketEmptyState />}
            </div>
          </div>
          <div className="absolute inset-0 bg-background/35 backdrop-blur-[2px]" />
          <MarketUnderDevelopmentOverlay pageTitle={intro.title} />
        </div>
      </div>
    </div>
  );
}
