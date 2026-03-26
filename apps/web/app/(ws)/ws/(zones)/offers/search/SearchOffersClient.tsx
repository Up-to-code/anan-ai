"use client";

import { useState } from "react";
import Link from "next/link";
import type { OfferMarketplaceItem } from "../offerTypes";
import { Search, SlidersHorizontal, MapPin, Home, Eye } from "lucide-react";

export type SearchOfferFilters = {
  searchQuery: string;
  filterCity: string;
  filterType: string;
  filterKind: "الكل" | OfferMarketplaceItem["kind"];
};

function avatarLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "؟";
  return [...trimmed].slice(0, 1).join("").toUpperCase();
}

function kindLabel(kind: OfferMarketplaceItem["kind"]) {
  if (kind === "developer") return "مطور";
  if (kind === "broker") return "وسيط";
  if (kind === "inbox") return "ربط";
  return "عميل";
}

function ownerTypeLabel(kind: OfferMarketplaceItem["kind"]) {
  if (kind === "broker") return "وسيط";
  if (kind === "developer") return "شركة تطوير";
  return "جهة العرض";
}

function SearchOfferOwner({ item }: { item: OfferMarketplaceItem }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
        {avatarLabel(item.ownerLabel)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{item.ownerLabel}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{ownerTypeLabel(item.kind)}</div>
      </div>
    </div>
  );
}

function SearchOfferMeta({ item }: { item: OfferMarketplaceItem }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
      <div className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
        <div className="text-xs text-slate-500 dark:text-slate-400">السعر</div>
        <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{item.priceLabel}</div>
      </div>
      <div className="rounded-md border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
        <div className="text-xs text-slate-500 dark:text-slate-400">نوع العرض</div>
        <div className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{item.propertyType}</div>
      </div>
    </div>
  );
}

function SearchOfferFooter({ item }: { item: OfferMarketplaceItem }) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <div className="inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        <span className="truncate">{item.location}</span>
      </div>
      <Link
        href={`/ws/offers/${item.id}`}
        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
      >
        <Eye className="h-3.5 w-3.5" />
        استعراض
      </Link>
    </div>
  );
}

function SearchOfferCard({ item }: { item: OfferMarketplaceItem }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <Link href={`/ws/offers/${item.id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/ws/offers/${item.id}`} className="line-clamp-2 text-base font-semibold text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300">
            {item.title}
          </Link>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {kindLabel(item.kind)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{item.summary}</p>
        <SearchOfferOwner item={item} />
        <SearchOfferMeta item={item} />
        <SearchOfferFooter item={item} />
      </div>
    </article>
  );
}

export function filterSearchOffers(items: OfferMarketplaceItem[], filters: SearchOfferFilters) {
  return items.filter((item) => {
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.project.title.toLowerCase().includes(q) &&
        !item.location.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filters.filterCity !== "الكل" && !item.location.includes(filters.filterCity)) return false;
    if (filters.filterType !== "الكل" && item.propertyType !== filters.filterType) return false;
    if (filters.filterKind !== "الكل" && item.kind !== filters.filterKind) return false;
    return true;
  });
}

export default function SearchOffersClient({ items }: { items: OfferMarketplaceItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("الكل");
  const [filterType, setFilterType] = useState("الكل");
  const [filterKind, setFilterKind] = useState<SearchOfferFilters["filterKind"]>("الكل");

  const filteredItems = filterSearchOffers(items, {
    searchQuery,
    filterCity,
    filterType,
    filterKind,
  });

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" /> فلاتر البحث
          </div>

          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الحي، أو المشروع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pr-14 pl-4 text-base font-black text-slate-950 outline-none transition focus:bg-white focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950 dark:focus:ring-blue-500/40"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <MapPin className="ml-1 inline h-3 w-3" /> المدينة
              </label>
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <option>الكل</option>
                <option>الرياض</option>
                <option>جدة</option>
                <option>الدمام</option>
                <option>مكة</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <Home className="ml-1 inline h-3 w-3" /> نوع العقار
              </label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <option>الكل</option>
                <option>عرض عام</option>
                <option>عرض خاص</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">تصنيف العرض</label>
              <select
                value={filterKind}
                onChange={(e) => setFilterKind(e.target.value as SearchOfferFilters["filterKind"])}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option>الكل</option>
                <option value="developer">عرض مطور</option>
                <option value="broker">عرض وسيط</option>
                <option value="client">طلب عميل</option>
                <option value="inbox">صندوق الربط</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {filteredItems.length} نتيجة
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-slot="offers-grid">
          {filteredItems.map((item) => (
            <SearchOfferCard key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="text-sm font-black text-slate-400 dark:text-slate-500">لا توجد عروض مطابقة لفلاترك الحالية.</div>
            <div className="mt-2 text-xs font-bold text-slate-400 dark:text-slate-500">جرب تعديل الفلاتر أو مسح البحث.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
