import MarketEmptyState from "./MarketEmptyState";
import MarketFilters from "./MarketFilters";
import type { WorkspaceMarketPageModel } from "../marketTypes";
import BrandSectionFrame from "../../../_components/WorkspaceBrand/BrandSectionFrame";
import BrandStatStrip from "../../../_components/WorkspaceBrand/BrandStatStrip";

type MarketPageIntro = {
  eyebrow: string;
  title: string;
  description: string;
};



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
  return (
    <div className="flex min-h-full flex-col pb-24">
      <BrandSectionFrame
        eyebrow={intro.eyebrow}
        title={intro.title}
        description={intro.description}
      />
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <MarketPageContent model={model} actionPath={actionPath}>
          {children}
        </MarketPageContent>
      </div>
    </div>
  );
}
