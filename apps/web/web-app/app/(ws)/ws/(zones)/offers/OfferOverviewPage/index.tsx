import type { OfferMarketplaceItem } from "../offerTypes";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import OfferPaginationNav from "../OfferPaginationNav";

export default function OfferOverviewPage({
  items,
  totalItems,
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  routeBase,
}: {
  items: OfferMarketplaceItem[];
  totalItems: number;
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  routeBase: string;
}) {
  const KIND_LABELS: Record<string, string> = {
    developer: "عرض مطور",
    broker: "تعاون وسيط",
    client: "طلب عميل",
    inbox: "مهمة ربط",
  };

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="px-6 py-6 lg:px-8 lg:py-8 grid gap-6">
        <section className="border border-slate-200 bg-white p-6 text-right">
          <h1 className="text-2xl font-black text-slate-950">جميع العروض</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600">
            قائمة موحدة للعروض المنشورة والمستلمة والمرسلة داخل مساحة العمل الحالية، مع تقسيم واضح للصفحات حتى يبقى الاستعراض سريعاً.
          </p>
          <div className="mt-4 text-xs font-black tracking-[0.18em] text-slate-400">
            {totalItems} عرض في الإجمالي
          </div>
        </section>

        <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 p-4">
          <div className="flex gap-2">
            <Link
              href="/ws/offers/create"
              className="bg-blue-600 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-slate-950 transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              طرح عرض جديد
            </Link>
          </div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-4 py-2">
            صفحة {page} من {pageCount}
          </div>
        </div>

        <div className="flex flex-col border border-slate-200 bg-white w-full">
          {items.length === 0 && (
            <div className="p-16 text-center">
              <div className="text-sm font-black text-slate-400">لا توجد عروض متاحة في هذه الصفحة حالياً.</div>
            </div>
          )}
          {items.map((item, index) => (
            <article
              key={item.id}
              className={`group flex flex-col gap-6 p-6 transition hover:bg-slate-50 md:flex-row md:items-start md:justify-between ${
                index !== items.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-3 relative">
                <div className="flex items-center gap-3">
                  <Link href={`/ws/offers/${item.id}`} className="text-xl font-black text-slate-950 truncate transition-colors hover:text-blue-600">
                    {item.title}
                  </Link>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 bg-slate-50 px-3 py-1 shrink-0">
                    {KIND_LABELS[item.kind] || item.kind}
                  </div>
                  {item.demandLabel && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1 shrink-0 hidden lg:block">
                      {item.demandLabel}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-500 max-w-3xl">
                  <span className="font-bold text-slate-900 border-b border-slate-200 pb-0.5">{item.project.title}</span> • {item.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-6 items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">السعر</span>
                    <span className="text-sm font-black text-slate-950 mt-1">{item.priceLabel}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100 hidden sm:block" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">المساحة</span>
                    <span className="text-sm font-black text-slate-950 mt-1">{item.project.area}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100 hidden sm:block" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">الموقع</span>
                    <span className="text-sm font-black text-slate-950 mt-1">{item.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end w-full md:w-auto mt-4 md:mt-0">
                {item.broker && (
                  <div className="text-xs font-bold text-slate-500">
                    الوسيط: <span className="font-black text-slate-900">{item.broker.name}</span>
                  </div>
                )}
                <div className="flex gap-2 w-full md:w-auto">
                  <Link
                    href={`/ws/offers/${item.id}`}
                    className="flex items-center justify-center gap-2 flex-1 md:flex-initial border border-slate-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    استعراض
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {items.length > 0 ? (
          <OfferPaginationNav
            page={page}
            pageCount={pageCount}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            routeBase={routeBase}
          />
        ) : null}
      </div>
    </div>
  );
}
