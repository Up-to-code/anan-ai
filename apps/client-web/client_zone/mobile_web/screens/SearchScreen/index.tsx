"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convexApi";
import { BuyerRailCard, ResponsiveBuyerShell } from "../../components/layout";
import { MobileHeader, MobileIcons, PropertyResultCard } from "../../components/ui";
import { getPropertyLocationLabel, normalizeBuyerProperty } from "../../lib/mobileWebData";

const ALL_FILTER = "الكل";

/**
 * WHY:   Buyers should be able to browse inventory with the same direct-search flow used in mobile while taking advantage of desktop space.
 * WHAT:  Renders the responsive search route with shared filters, buyer guidance, and breakpoint-aware result grids.
 * HOW:   Reads from the mobile buyer feed query, keeps filtering local, and exposes the controls in the main pane on small screens and the desktop rail on large screens.
 */
export default function SearchScreen() {
  const router = useRouter();
  const feed = usePaginatedQuery(api.user_zone.mobile.feed.listFeed, {} as never, {
    initialNumItems: 24,
  });
  const [query, setQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState(ALL_FILTER);
  const [selectedOwnerType, setSelectedOwnerType] = useState(ALL_FILTER);
  const properties = useMemo(
    () => ((feed.results ?? []) as Array<unknown>).map((property) => normalizeBuyerProperty(property)),
    [feed.results],
  );

  const areas = useMemo(
    () => [ALL_FILTER, ...new Set(properties.map((property) => getPropertyLocationLabel(property)))],
    [properties],
  );
  const ownerTypes = [ALL_FILTER, "وسيط", "مطور"];

  const results = properties.filter((property) => {
    const matchesText =
      query.trim().length === 0 ||
      property.title.includes(query) ||
      property.address.includes(query) ||
      getPropertyLocationLabel(property).includes(query) ||
      property.owner.name.includes(query);

    const matchesArea = selectedArea === ALL_FILTER || getPropertyLocationLabel(property) === selectedArea;
    const matchesOwner =
      selectedOwnerType === ALL_FILTER ||
      (selectedOwnerType === "وسيط" ? property.owner.type === "broker" : property.owner.type === "RED");

    return matchesText && matchesArea && matchesOwner;
  });

  const header = (
    <MobileHeader
      title="البحث"
      backHref="/app"
      rightSlot={<span className="block h-12 w-12" />}
    />
  );

  const filters = (
    <>
      <FilterRow title="المنطقة" values={areas} selectedValue={selectedArea} onSelect={setSelectedArea} />
      <FilterRow title="نوع الجهة" values={ownerTypes} selectedValue={selectedOwnerType} onSelect={setSelectedOwnerType} />
    </>
  );

  const main = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-6 pb-6 md:px-8 lg:px-8">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن شقة أو منطقة أو مدينة"
            className="h-14 w-full rounded-full bg-white px-12 text-right text-[15px] font-medium text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-50 dark:ring-slate-800"
          />
          <div className="absolute left-4 top-0 flex h-full items-center text-slate-400">
            <MobileIcons.Search className="h-4 w-4" />
          </div>
          {query.length > 0 ? (
            <button type="button" onClick={() => setQuery("")} className="absolute right-4 top-0 flex h-full items-center text-slate-400">
              ×
            </button>
          ) : null}
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white px-4 py-4 text-right dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-[15px] font-black text-slate-900 dark:text-slate-50">ابحث وكأنك تكمل نفس المحادثة</h2>
          <p className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400">
            اختر المنطقة ونوع الجهة، ثم افتح أي عقار للعودة مباشرة إلى المساعد مع نفس السياق.
          </p>
        </div>

        <div className="mt-8 space-y-6 lg:hidden">{filters}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10 pt-2 md:px-8 lg:px-8">
        <div className="mb-6 flex flex-row-reverse items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">نتائج البحث</h2>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[12px] font-black text-slate-500">{results.length} نتيجة</span>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {results.map((property) => (
              <PropertyResultCard
                key={String(property.id)}
                property={property}
                onAskAssistant={(selected) => {
                  router.push(`/app?propertyId=${selected.id}`);
                }}
                detailHref={`/app/property/${property.id}`}
                detailTestId="client-search-property-link"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <MobileIcons.Search className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mb-3 text-xl font-black text-slate-900 dark:text-slate-50">لا توجد نتائج مطابقة</h3>
            <p className="text-[15px] leading-relaxed font-medium text-slate-500">
              جرّب مدينة أخرى أو خفف شروط البحث لنقربك من الخيارات المتاحة.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const desktopRail = (
    <>
      <BuyerRailCard title="فلاتر البحث" eyebrow="المعايير">
        {filters}
      </BuyerRailCard>

      <BuyerRailCard title="كيف تستخدم هذا المسار؟" eyebrow="إرشاد">
        <p className="text-[14px] leading-7 font-medium text-slate-500 dark:text-slate-400">
          استخدم البحث لتصفية النتائج بسرعة، ثم افتح أي عقار أو ارجع للمساعد بنفس السياق والجهة والعقار المختار.
        </p>
        <Link
          href="/app"
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-[14px] font-black text-white dark:bg-slate-50 dark:text-slate-950"
        >
          العودة إلى المساعد
        </Link>
      </BuyerRailCard>
    </>
  );

  return <ResponsiveBuyerShell header={header} main={main} desktopRail={desktopRail} />;
}

function FilterRow({
  title,
  values,
  selectedValue,
  onSelect,
}: {
  title: string;
  values: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div dir="rtl">
      <p className="mb-3 text-right text-[12px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      <div className="flex flex-row-reverse gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {values.map((item) => {
          const selected = item === selectedValue;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={
                selected
                  ? "shrink-0 rounded-full bg-slate-900 px-5 py-2.5 text-[14px] font-black text-white dark:bg-slate-50 dark:text-slate-900"
                  : "shrink-0 rounded-full bg-slate-100 px-5 py-2.5 text-[14px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
