import Link from "next/link";
import type { WorkspaceMarketPageModel } from "../../types/marketTypes";

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
    <form action={actionPath} method="GET" className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 text-right md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[14px] font-bold text-foreground">Market Explorer</div>
          <div className="text-[13px] font-medium text-muted-foreground">فلترة السوق حسب المدينة، المنطقة، الكلمات، والفترة الزمنية.</div>
        </div>
        <div className="text-[12px] font-bold text-muted-foreground">{model.dateRange.label}</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.1fr_1.2fr_0.9fr_0.9fr_auto] lg:items-end">
        <label className="grid gap-2 text-right">
          <span className="text-[12px] font-bold text-foreground">المدينة</span>
          <select
            name="city"
            defaultValue={model.filters.city}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
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
          <span className="text-[12px] font-bold text-foreground">المنطقة أو الحي</span>
          <input
            name="area"
            list="market-areas"
            defaultValue={model.filters.area}
            placeholder={model.filters.city ? "مثال: الملقا" : "اختر مدينة أو اتركه فارغاً"}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
          <datalist id="market-areas">
            {model.availableAreas.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-[12px] font-bold text-foreground">بحث إضافي</span>
          <input
            name="query"
            defaultValue={model.filters.query}
            placeholder="كلمة مفتاحية أو نطاق فرعي"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-[12px] font-bold text-foreground">من</span>
          <input
            type="date"
            name="dateFrom"
            defaultValue={model.dateRange.from}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </label>

        <label className="grid gap-2 text-right">
          <span className="text-[12px] font-bold text-foreground">إلى</span>
          <input
            type="date"
            name="dateTo"
            defaultValue={model.dateRange.to}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-[13px] font-medium text-foreground outline-none transition focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </label>

        <div className="flex gap-2 lg:justify-end">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-5 text-[13px] font-bold text-background transition hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            تحديث
          </button>
          <Link
            href={actionPath}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-[13px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            إعادة ضبط
          </Link>
        </div>
      </div>
    </form>
  );
}
