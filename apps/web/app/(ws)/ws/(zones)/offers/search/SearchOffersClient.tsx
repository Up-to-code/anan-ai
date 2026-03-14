"use client";

import { useState } from "react";
import Link from "next/link";
import type { OfferMarketplaceItem } from "../offerTypes";
import { Search, SlidersHorizontal, MapPin, Home } from "lucide-react";

export default function SearchOffersClient({ items }: { items: OfferMarketplaceItem[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("الكل");
  const [filterType, setFilterType] = useState("الكل");
  const [filterKind, setFilterKind] = useState("الكل");

  const filteredItems = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.project.title.toLowerCase().includes(q) && !item.location.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterCity !== "الكل" && !item.location.includes(filterCity)) return false;
    if (filterType !== "الكل" && item.propertyType !== filterType) return false;
    if (filterKind !== "الكل" && item.kind !== filterKind) return false;
    return true;
  });

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" /> فلاتر البحث
          </div>

          <div className="relative">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الحي، أو المشروع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 py-4 pr-14 pl-4 text-base font-black text-slate-950 outline-none transition focus:bg-white focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                <MapPin className="ml-1 inline h-3 w-3" /> المدينة
              </label>
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full cursor-pointer border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950 outline-none">
                <option>الكل</option>
                <option>الرياض</option>
                <option>جدة</option>
                <option>الدمام</option>
                <option>مكة</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Home className="ml-1 inline h-3 w-3" /> نوع العقار
              </label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full cursor-pointer border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950 outline-none">
                <option>الكل</option>
                <option>عرض عام</option>
                <option>عرض خاص</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">تصنيف العرض</label>
              <select value={filterKind} onChange={(e) => setFilterKind(e.target.value)} className="w-full cursor-pointer border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-950 outline-none">
                <option>الكل</option>
                <option value="developer">عرض مطور</option>
                <option value="broker">عرض وسيط</option>
                <option value="client">طلب عميل</option>
                <option value="inbox">صندوق الربط</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-xs font-black uppercase tracking-widest text-slate-400">
          {filteredItems.length} نتيجة
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/ws/offers/${item.id}`} className="block group">
              <div className="overflow-hidden border border-slate-200 bg-white transition hover:border-blue-600">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="grid gap-3 p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="flex-1 truncate text-base font-black text-slate-950 transition group-hover:text-blue-600">{item.title}</h3>
                    <span className="shrink-0 border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {item.kind === "developer" ? "مطور" : item.kind === "broker" ? "وسيط" : item.kind === "inbox" ? "ربط" : "عميل"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs font-bold text-slate-500">{item.summary}</p>
                  <div className="flex items-end justify-between border-t border-slate-100 pt-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">السعر</div>
                      <div className="text-sm font-black text-slate-950">{item.priceLabel}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">الموقع</div>
                      <div className="text-sm font-black text-slate-700">{item.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-16 text-center">
            <div className="text-sm font-black text-slate-400">لا توجد عروض مطابقة لفلاترك الحالية.</div>
            <div className="mt-2 text-xs font-bold text-slate-400">جرب تعديل الفلاتر أو مسح البحث.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
