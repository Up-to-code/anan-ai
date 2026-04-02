"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { MobileHeader, MobileViewport, PropertyResultCard, MobileIcons } from "../../components/ui";
import { getPropertyLocationLabel, normalizeBuyerProperty } from "../../lib/mobileWebData";

const ALL_FILTER = "الكل";

/**
 * WHY:   Buyers should be able to browse inventory on client web with the same direct-search surface as the mobile app.
 * WHAT:  Renders the mobile-style search screen with pill input, area/owner filters, and compact property results.
 * HOW:   Reads from the mobile buyer feed query, filters client-side, and routes detail taps into the mobile-style property screen.
 */
export default function SearchScreen() {
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

  return (
    <MobileViewport>
      <MobileHeader title="البحث" backHref="/welcome" rightSlot={<span className="block h-12 w-12" />} />

      <div className="relative z-10 px-6 pb-6">
        <div className="flex flex-row-reverse items-center gap-4">
          <Link
            href="/welcome"
            aria-label="رجوع"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <MobileIcons.ChevronLeft className="h-5 w-5" />
          </Link>

          <div className="relative flex-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن شقة أو منطقة أو مدينة"
              className="h-14 w-full rounded-full bg-white px-12 text-right text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-50"
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
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-white px-4 py-4 text-right dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-[15px] font-black text-slate-900 dark:text-slate-50">ابحث وكأنك تكمل نفس المحادثة</h2>
          <p className="mt-2 text-[14px] leading-7 text-slate-500 dark:text-slate-400">
            اختر المنطقة ونوع الجهة، ثم افتح أي عقار للعودة مباشرة إلى المساعد مع نفس السياق.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <FilterRow title="المنطقة" values={areas} selectedValue={selectedArea} onSelect={setSelectedArea} />
          <FilterRow title="نوع الجهة" values={ownerTypes} selectedValue={selectedOwnerType} onSelect={setSelectedOwnerType} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10 pt-2">
        <div className="mb-6 flex flex-row-reverse items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">نتائج البحث</h2>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[12px] font-black text-slate-500">{results.length} نتيجة</span>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="space-y-5">
            {results.map((property) => (
              <PropertyResultCard
                key={String(property.id)}
                property={property}
                onAskAssistant={(selected) => {
                  window.location.href = `/app?propertyId=${selected.id}`;
                }}
                detailHref={`/app/property/${property.id}`}
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
    </MobileViewport>
  );
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
      <div className="flex flex-row-reverse gap-3 overflow-x-auto pb-1">
        {values.map((item) => {
          const selected = item === selectedValue;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={selected ? "shrink-0 rounded-full bg-slate-900 px-5 py-2.5 text-[14px] font-black text-white dark:bg-slate-50 dark:text-slate-900" : "shrink-0 rounded-full bg-slate-100 px-5 py-2.5 text-[14px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300"}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
