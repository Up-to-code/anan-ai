import Link from "next/link";
import type { WorkspaceMarketPageModel } from "../marketTypes";

/**
 * WHY:   Users need a direct way to narrow the market snapshot by city, area, and lookback window using URL-backed filters.
 * WHAT:  Renders the GET filter form for the active market data route plus the reset action.
 * HOW:   Uses server-rendered controls so changing filters reloads the current market subpage without client-only state.
 */
export default function MarketFilters({
  model,
  actionPath,
}: {
  model: WorkspaceMarketPageModel;
  actionPath: string;
}) {
  return (
    <form action={actionPath} method="GET" className="border border-slate-200 bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_220px_1.2fr_auto]">
        <label className="grid gap-2 text-right">
          <span className="text-xs font-black text-slate-700">المدينة</span>
          <select
            name="city"
            defaultValue={model.filters.city}
            className="h-11 border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-950"
          >
            <option value="">كل المدن</option>
            {model.availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-xs font-black text-slate-700">الحي</span>
          <div>
            <input
              name="area"
              list="market-areas"
              defaultValue={model.filters.area}
              placeholder={model.filters.city ? "ابحث داخل المدينة المحددة" : "اختر مدينة أولاً أو اكتب الحي"}
              className="h-11 w-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-950"
            />
            <datalist id="market-areas">
              {model.availableAreas.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>
          </div>
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-xs font-black text-slate-700">الفترة الزمنية</span>
          <select
            name="windowDays"
            defaultValue={String(model.filters.windowDays)}
            className="h-11 border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-950"
          >
            {model.windowOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-xs font-black text-slate-700">بحث داخل التحليل</span>
          <input
            name="query"
            defaultValue={model.filters.query}
            placeholder="مدينة، حي، كلمة بحثية، أو نقطة بيع"
            className="h-11 w-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-slate-950"
          />
        </label>

        <div className="flex items-end justify-end gap-2">
          <Link
            href={actionPath}
            className="inline-flex h-11 items-center justify-center border border-slate-200 px-4 text-xs font-black text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            إعادة ضبط
          </Link>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-slate-800"
          >
            تطبيق
          </button>
        </div>
      </div>
    </form>
  );
}
