import type { WorkspaceMarketPageModel } from "../marketTypes";
import MarketCitiesTable from "./MarketCitiesTable";

/**
 * WHY:   City comparison reads securely as a dense graphical report after the overview route was simplified.
 * WHAT:  Renders the ranked city chart highlighting demand-versus-inventory.
 * HOW:   Uses the shared server-backed model directly so the route stays SSR and filter-driven.
 */
export default function CitiesTab({ model }: { model: WorkspaceMarketPageModel }) {
  return (
    <div className="grid gap-6">
      <MarketCitiesTable
        rows={model.topCities}
        description="ترتيب المدن يعتمد على إشارات الطلب المحفوظة ثم عدد الأبحاث ثم حجم المخزون المتاح في نفس المدينة."
      />
    </div>
  );
}
