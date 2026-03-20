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
      {/* Decorative background glow */}
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/20 to-slate-400/20 blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
      
      <div className="relative flex flex-col lg:flex-row gap-4 lg:gap-0 lg:items-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-sm p-4 lg:p-2 lg:rounded-full border border-slate-200">
        
        {/* City Filter */}
        <div className="flex-[0.8] flex items-center px-4 py-2 lg:border-l border-slate-200 focus-within:bg-slate-50 focus-within:rounded-xl lg:focus-within:rounded-full transition-colors group/input">
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
        <div className="flex-[0.8] flex items-center px-4 py-2 lg:border-l border-slate-200 focus-within:bg-slate-50 focus-within:rounded-xl lg:focus-within:rounded-full transition-colors group/input">
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
        <div className="flex-shrink-0 lg:w-44 flex items-center px-4 py-2 lg:border-l border-slate-200 focus-within:bg-slate-50 focus-within:rounded-xl lg:focus-within:rounded-full transition-colors group/input">
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
        <div className="flex-1 flex items-center px-4 py-2 focus-within:bg-slate-50 focus-within:rounded-xl lg:focus-within:rounded-full transition-colors group/input">
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
        <div className="flex items-center gap-2 px-2 shrink-0 justify-end w-full lg:w-auto mt-2 lg:mt-0">
          <Link
            href={actionPath}
            title="إعادة ضبط"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </Link>
          <button
            type="submit"
            className="flex h-10 px-6 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            بحث
          </button>
        </div>

      </div>
    </form>
  );
}
