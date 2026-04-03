import Link from "next/link";
import OfferPaginationNav from "../OfferPaginationNav";
import OfferListItem from "../OfferListItem";
import SearchableSelector from "./SearchableSelector";
import type { WorkspaceOfferSummary } from "../offerTypes";
import {
  type OfferFilterOptions,
  type OffersPageFilters,
  type OffersSortValue,
  type PaginatedCollection,
} from "../offersPageData";

function sortLabel(sort: OffersSortValue) {
  return sort === "updated_asc" ? "الأقدم أولاً" : "الأحدث أولاً";
}

function countActiveFilters(filters: OffersPageFilters, sort: OffersSortValue) {
  let count = 0;
  if (sort !== "updated_desc") count += 1;
  if (filters.location.trim()) count += 1;
  if (filters.area.trim()) count += 1;
  if (filters.budgetMin != null) count += 1;
  if (filters.budgetMax != null) count += 1;
  if (filters.bedsMin != null) count += 1;
  if (filters.bathsMin != null) count += 1;
  if (filters.sqftMin != null) count += 1;
  if (filters.sqftMax != null) count += 1;
  return count;
}

const inputClassName =
  "h-11 w-full rounded-[16px] border border-border/70 bg-background/90 px-3.5 text-right text-[13px] font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[color:var(--workspace-highlight)] focus:ring-4 focus:ring-[color:var(--workspace-highlight-soft)]";

const labelClassName = "text-[12px] font-bold text-foreground";

/**
 * WHY:   The main offers page should feel like one calm marketplace surface with lightweight controls and a focused list.
 * WHAT:  Renders a compact theme-aware header, a flat paginated list of offer cards, and a slim searchable filter rail.
 * HOW:   Receives a server-prepared, deduplicated, sorted collection plus Saudi suggestion lists and keeps the active filter state in a sidebar form.
 */
export default function OfferOverviewPage({
  items,
  pagination,
  routeBase,
  filterOptions,
  sort,
  filters,
}: {
  items: WorkspaceOfferSummary[];
  pagination: PaginatedCollection<WorkspaceOfferSummary>;
  routeBase: string;
  filterOptions: OfferFilterOptions;
  sort: OffersSortValue;
  filters: OffersPageFilters;
}) {
  const activeFilterCount = countActiveFilters(filters, sort);
  const locationSelectorOptions = filterOptions.locations.map((option) => ({ label: option, value: option }));
  const areaSelectorOptions = filterOptions.areas.map((option) => ({ label: option, value: option }));
  const summaryPills = [
    `${pagination.totalItems} عرض`,
    "السعودية",
    sortLabel(sort),
  ];

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <section className="rounded-[24px] border border-border/70 bg-card/85 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75 lg:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 text-right">
              <span className="inline-flex items-center rounded-full border border-[color:var(--workspace-highlight-soft)] bg-[color:var(--workspace-highlight-soft)] px-3 py-1 text-[11px] font-bold text-[color:var(--workspace-highlight-strong)]">
                لوحة العروض
              </span>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end lg:gap-3">
                <h1 className="text-[22px] font-black tracking-tight text-foreground">العروض المفتوحة</h1>
                {activeFilterCount > 0 ? (
                  <span className="rounded-full border border-[color:var(--workspace-highlight-soft)] bg-[color:var(--workspace-highlight-soft)] px-3 py-1 text-[11px] font-bold text-[color:var(--workspace-highlight-strong)]">
                    {activeFilterCount} فلتر نشط
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {summaryPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-border/60 bg-background/80 px-3 py-1.5 text-[12px] font-bold text-muted-foreground"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {activeFilterCount > 0 ? (
                <Link
                  href="/ws/offers"
                  className="inline-flex items-center justify-center rounded-full border border-border/70 bg-background/80 px-4 py-2.5 text-[13px] font-bold text-foreground transition hover:bg-background"
                >
                  إعادة الضبط
                </Link>
              ) : null}
              <Link
                href="/ws/offers/create"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
              >
                إنشاء عرض
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-4">
            {items.length > 0 ? (
              <div className="grid gap-4" data-slot="offers-grid">
                {items.map((item) => (
                  <OfferListItem key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-border/70 bg-card/80 px-6 py-14 text-center text-[14px] font-medium text-muted-foreground">
                لا توجد عروض مطابقة حالياً.
              </div>
            )}

            {pagination.totalItems > 0 ? (
              <OfferPaginationNav
                page={pagination.page}
                pageCount={pagination.pageCount}
                hasPreviousPage={pagination.hasPreviousPage}
                hasNextPage={pagination.hasNextPage}
                routeBase={routeBase}
              />
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-6">
            <form
              action="/ws/offers"
              className="space-y-4 rounded-[24px] border border-border/70 bg-card/95 p-4 shadow-sm"
            >
              <div className="space-y-1.5 text-right">
                <div className="text-[15px] font-black text-foreground">فلترة سريعة</div>
                <p className="text-[12px] leading-6 text-muted-foreground">
                  القوائم الحالية مخصصة للسوق السعودي فقط.
                </p>
              </div>

              <div className="grid gap-3">
                <SearchableSelector
                  label="الموقع"
                  name="location"
                  value={filters.location}
                  placeholder="مثال: الرياض"
                  options={locationSelectorOptions}
                  emptyMessage="لا توجد مدن أو مواقع مطابقة"
                />

                <SearchableSelector
                  label="المنطقة"
                  name="area"
                  value={filters.area}
                  placeholder="ابحث داخل المناطق"
                  options={areaSelectorOptions}
                  emptyMessage="لا توجد مناطق مطابقة"
                />

                <label className="space-y-2 text-right">
                  <span className={labelClassName}>الترتيب</span>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className={inputClassName}
                  >
                    <option value="updated_desc">الأحدث أولاً</option>
                    <option value="updated_asc">الأقدم أولاً</option>
                  </select>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>الميزانية من</span>
                    <input
                      type="text"
                      name="budgetMin"
                      inputMode="numeric"
                      defaultValue={filters.budgetMin ?? ""}
                      placeholder="0"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>الميزانية إلى</span>
                    <input
                      type="text"
                      name="budgetMax"
                      inputMode="numeric"
                      defaultValue={filters.budgetMax ?? ""}
                      placeholder="غير محدد"
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>المساحة من</span>
                    <input
                      type="text"
                      name="sqftMin"
                      inputMode="numeric"
                      defaultValue={filters.sqftMin ?? ""}
                      placeholder="0"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>المساحة إلى</span>
                    <input
                      type="text"
                      name="sqftMax"
                      inputMode="numeric"
                      defaultValue={filters.sqftMax ?? ""}
                      placeholder="غير محدد"
                      className={inputClassName}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>الغرف من</span>
                    <input
                      type="text"
                      name="bedsMin"
                      inputMode="numeric"
                      defaultValue={filters.bedsMin ?? ""}
                      placeholder="1"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 text-right">
                    <span className={labelClassName}>الحمامات من</span>
                    <input
                      type="text"
                      name="bathsMin"
                      inputMode="numeric"
                      defaultValue={filters.bathsMin ?? ""}
                      placeholder="1"
                      className={inputClassName}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/ws/offers"
                  className="inline-flex min-w-[112px] items-center justify-center rounded-full border border-border/70 bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted/40"
                >
                  مسح الكل
                </Link>
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-foreground px-5 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90"
                >
                  تطبيق الفلاتر
                </button>
              </div>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
