import Link from "next/link";
import type { WorkspaceMarketPageModel } from "../marketTypes";

/**
 * WHY:   The rebuilt market page depends on exact dates and scope filters instead of the old preset-only bar.
 * WHAT:  Renders a simple GET form for city, area, free-text search, and inclusive start/end dates.
 * HOW:   Uses server-friendly native controls so every route can stay SSR and deep-linkable.
 */
export default function MarketFilters({
  model,
  actionPath,
}: {
  model: WorkspaceMarketPageModel;
  actionPath: string;
}) {
  return (
    <form action={actionPath} method="GET" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 text-right md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-950">Market Explorer</div>
          <div className="text-sm text-slate-500">فلترة السوق حسب المدينة، المنطقة، الكلمات، والفترة الزمنية.</div>
        </div>
        <div className="text-sm text-slate-500">{model.dateRange.label}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_1.2fr_0.9fr_0.9fr_auto] lg:items-end">
        <label className="grid gap-2 text-right">
          <span className="text-sm font-medium text-slate-700">المدينة</span>
          <select
            name="city"
            defaultValue={model.filters.city}
            className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:bg-white"
          >
            <option value="">كل مدن السعودية</option>
            {model.availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-sm font-medium text-slate-700">المنطقة أو الحي</span>
          <input
            name="area"
            list="market-areas"
            defaultValue={model.filters.area}
            placeholder={model.filters.city ? "مثال: الملقا" : "اختر مدينة أو اتركه فارغاً"}
            className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white"
          />
          <datalist id="market-areas">
            {model.availableAreas.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-sm font-medium text-slate-700">بحث إضافي</span>
          <input
            name="query"
            defaultValue={model.filters.query}
            placeholder="كلمة مفتاحية أو نطاق فرعي"
            className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:bg-white"
          />
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-sm font-medium text-slate-700">من</span>
          <input
            type="date"
            name="dateFrom"
            defaultValue={model.dateRange.from}
            className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:bg-white"
          />
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-sm font-medium text-slate-700">إلى</span>
          <input
            type="date"
            name="dateTo"
            defaultValue={model.dateRange.to}
            className="h-11 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500 focus:bg-white"
          />
        </label>

        <div className="flex gap-2 lg:justify-end">
          <button
            type="submit"
            className="h-11 rounded-lg bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            تحديث
          </button>
          <Link
            href={actionPath}
            className="inline-flex h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
          >
            إعادة ضبط
          </Link>
        </div>
      </div>
    </form>
  );
}
