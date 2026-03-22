import Link from "next/link";
import { Search, MapPin, Map, Calendar, RotateCcw } from "lucide-react";
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
    <form action={actionPath} method="GET" className="relative group">
      <div className="relative flex flex-col gap-4 rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-xl lg:flex-row lg:gap-0 lg:items-center">
        
        {/* City Filter */}
        <div className="flex flex-[0.8] items-center rounded-lg px-4 py-2 transition-colors focus-within:bg-slate-50 lg:border-l lg:border-slate-200 group/input">
          <Map className="w-4 h-4 text-slate-400 ml-3 shrink-0 group-focus-within/input:text-blue-500 transition-colors" />
          <div className="flex-1 relative">
            <span className="absolute -top-3 right-0 text-[9px] font-black text-slate-400">المدينة</span>
            <select
              name="city"
              defaultValue={model.filters.city}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer mt-1"
            >
              <option value="">كل المدن</option>
              {model.availableCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Area Filter */}
        <div className="flex flex-[0.8] items-center rounded-lg px-4 py-2 transition-colors focus-within:bg-slate-50 lg:border-l lg:border-slate-200 group/input">
          <MapPin className="w-4 h-4 text-slate-400 ml-3 shrink-0 group-focus-within/input:text-blue-500 transition-colors" />
          <div className="flex-1 text-right relative">
            <span className="absolute -top-3 right-0 text-[9px] font-black text-slate-400">الحي</span>
            <input
              name="area"
              list="market-areas"
              defaultValue={model.filters.area}
              placeholder={model.filters.city ? "ابحث داخل المدينة..." : "اختر مدينة أولاً"}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 mt-1"
            />
            <datalist id="market-areas">
              {model.availableAreas.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Window Days */}
        <div className="flex flex-shrink-0 items-center rounded-lg px-4 py-2 transition-colors focus-within:bg-slate-50 lg:w-44 lg:border-l lg:border-slate-200 group/input">
          <Calendar className="w-4 h-4 text-slate-400 ml-3 shrink-0 group-focus-within/input:text-blue-500 transition-colors" />
          <div className="flex-1 relative">
            <span className="absolute -top-3 right-0 text-[9px] font-black text-slate-400">الفترة</span>
            <select
              name="windowDays"
              defaultValue={String(model.filters.windowDays)}
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer mt-1"
            >
              {model.windowOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Query */}
        <div className="flex flex-1 items-center rounded-lg px-4 py-2 transition-colors focus-within:bg-slate-50 group/input">
          <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0 group-focus-within/input:text-blue-500 transition-colors" />
          <div className="flex-1 relative">
            <span className="absolute -top-3 right-0 text-[9px] font-black text-slate-400">استعلام حر</span>
            <input
              name="query"
              defaultValue={model.filters.query}
              placeholder="مدينة، حي، كلمة بحثية..."
              className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 mt-1"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex w-full shrink-0 items-center justify-end gap-2 px-2 lg:mt-0 lg:w-auto">
          <Link
            href={actionPath}
            title="إعادة ضبط"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <RotateCcw className="w-4 h-4" />
          </Link>
          <button
            type="submit"
            className="flex h-10 items-center justify-center rounded-lg bg-slate-950 px-6 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800 active:scale-95"
          >
            بحث
          </button>
        </div>

      </div>
    </form>
  );
}
