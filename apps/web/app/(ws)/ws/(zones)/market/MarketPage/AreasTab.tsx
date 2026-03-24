import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketAreasTable from "./MarketAreasTable";

/**
 * WHY:   Area analysis visually drills down into district-level demand and product fit via structured charts.
 * WHAT:  Renders the scoped area chart.
 * HOW:   Uses only server-provided rows and route filters, so the full section stays SSR.
 */
export default function AreasTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <MarketAreasTable
        rows={model.topAreas}
        showCityColumn={!model.filters.city}
        description="يعرض هذا الرسم البياني أكثر الأحياء ظهوراً في الطلب داخل النطاق المحدد، مع مقارنة مباشرة بالمخزون ونقطة البيع الأوضح."
      />
    </div>
  );
}
