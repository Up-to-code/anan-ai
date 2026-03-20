import MarketEmptyState from "./MarketEmptyState";
import MarketFilters from "./MarketFilters";
import MarketUnderDevelopmentOverlay from "./MarketUnderDevelopmentOverlay";
import type { WorkspaceMarketPageModel } from "../marketTypes";
import BrandSectionFrame from "../../../_components/WorkspaceBrand/BrandSectionFrame";
import BrandStatStrip from "../../../_components/WorkspaceBrand/BrandStatStrip";

type MarketPageIntro = {
  eyebrow: string;
  title: string;
  description: string;
};

function getMarketUnderDevelopmentFlag() {
  const envValue =
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
      ?.NEXT_PUBLIC_MARKET_UNDER_DEVELOPMENT;

  return String(envValue ?? "").toLowerCase() === "true";
}

function buildScopeLabel(model: WorkspaceMarketPageModel) {
  if (model.headline.selectedAreaLabel && model.headline.selectedAreaLabel !== "كل الأحياء") {
    return `${model.headline.selectedCityLabel} / ${model.headline.selectedAreaLabel}`;
  }

  return model.headline.selectedCityLabel;
}

function buildMarketStatItems(model: WorkspaceMarketPageModel) {
  return [
    { label: "النطاق", value: buildScopeLabel(model) },
    { label: "إشارات الطلب", value: model.headline.demandSignals.toLocaleString("en-US"), tone: "blue" as const },
    { label: "الأبحاث", value: model.headline.researchRuns.toLocaleString("en-US") },
    { label: "المخزون", value: model.headline.inventoryCount.toLocaleString("en-US") },
    { label: "متوسط السعر", value: model.headline.averagePriceLabel ?? "غير كافٍ" },
    { label: "الأكثر بحثاً", value: model.keywordInsights.mostResearchedLabel ?? "لا توجد إشارة واضحة" },
  ];
}

function MarketPageContent({ model, actionPath, children }: Pick<MarketPageProps, "model" | "actionPath" | "children">) {
  const statItems = buildMarketStatItems(model);
  return (
    <>
      <BrandStatStrip items={statItems} />
      <MarketFilters model={model} actionPath={actionPath} />
      {model.hasAnyData ? children : <MarketEmptyState />}
    </>
  );
}

type MarketPageProps = {
  model: WorkspaceMarketPageModel;
  actionPath: string;
  intro: MarketPageIntro;
  children: React.ReactNode;
};

export default function MarketPage({ model, actionPath, intro, children }: MarketPageProps) {
  const isUnderDevelopment = getMarketUnderDevelopmentFlag();

  return (
    <div className="flex min-h-full flex-col pb-24">
      <BrandSectionFrame
        eyebrow={intro.eyebrow}
        title={intro.title}
        description={intro.description}
      />
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        {isUnderDevelopment ? (
          <div className="relative overflow-hidden border border-slate-200 bg-slate-100">
            <div className="pointer-events-none select-none space-y-6 p-6 blur-[10px] opacity-45 lg:p-8">
              <MarketPageContent model={model} actionPath={actionPath} children={children} />
            </div>
            <MarketUnderDevelopmentOverlay />
          </div>
        ) : (
          <MarketPageContent model={model} actionPath={actionPath} children={children} />
        )}
      </div>
    </div>
  );
}
