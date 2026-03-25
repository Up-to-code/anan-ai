import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketPanel from "./MarketPanel";

/**
 * WHY:   The overview route needs a direct answer to "what happened in this market range?" before deeper tables.
 * WHAT:  Renders the most important structured results from the selected scope and date range.
 * HOW:   Pulls the headline, top area, top city, best opportunity, and top keyword from the shared page model.
 */
export default function MarketResultsSummary({ model }: { model: WorkspaceMarketPageModel }) {
  const leadingCity = model.topCities[0]?.city ?? "لا توجد مدينة واضحة";
  const leadingArea = model.topAreas[0]
    ? `${model.topAreas[0].area}${model.filters.city ? "" : ` - ${model.topAreas[0].city}`}`
    : "لا توجد منطقة واضحة";
  const leadingOpportunity = model.opportunities[0]
    ? `${model.opportunities[0].area} - ${model.opportunities[0].city}`
    : "لا توجد فرصة واضحة";

  return (
    <MarketPanel
      title="نتائج الفترة"
      description={`يعرض هذا الملخص ما برز في ${model.dateRange.label} داخل نطاق ${model.scopeLabel}.`}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-4 text-right">
          <div className="text-xs text-slate-500">المدينة الأوضح</div>
          <div className="mt-1 text-base font-medium text-slate-950">{leadingCity}</div>
        </div>
        <div className="rounded-md border border-slate-200 p-4 text-right">
          <div className="text-xs text-slate-500">المنطقة الأوضح</div>
          <div className="mt-1 text-base font-medium text-slate-950">{leadingArea}</div>
        </div>
        <div className="rounded-md border border-slate-200 p-4 text-right">
          <div className="text-xs text-slate-500">أكثر عبارة بحثاً</div>
          <div className="mt-1 text-base font-medium text-slate-950">{model.keywordInsights.mostResearchedLabel ?? "لا توجد عبارة واضحة"}</div>
        </div>
        <div className="rounded-md border border-slate-200 p-4 text-right">
          <div className="text-xs text-slate-500">أقرب فرصة حالية</div>
          <div className="mt-1 text-base font-medium text-slate-950">{leadingOpportunity}</div>
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">
        المخزون الحالي يبقى معبراً عن العرض النشط اليوم، بينما إشارات الطلب والأبحاث في هذه الصفحة تتبع الفترة المحددة فقط.
      </div>
    </MarketPanel>
  );
}
