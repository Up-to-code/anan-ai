import Link from "next/link";

/**
 * WHY:   Paginated offer lists need one small shared pager instead of duplicating next/previous link markup across routes.
 * WHAT:  Renders previous/next pagination controls with the current page summary.
 * HOW:   Accepts route-local href builders so each offers page can preserve its own path while only changing the `page` query param.
 */
export default function OfferPaginationNav({
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  routeBase,
}: {
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  routeBase: string;
}) {
  return (
    <div className="flex flex-col gap-3 border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-bold text-slate-600">
        صفحة {page} من {pageCount}
      </div>
      <div className="flex items-center gap-2">
        {hasPreviousPage ? (
          <Link
            href={page - 1 <= 1 ? routeBase : `${routeBase}?page=${page - 1}`}
            className="inline-flex items-center justify-center border border-slate-200 px-4 py-2 text-xs font-black tracking-[0.18em] text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
          >
            السابق
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center border border-slate-100 px-4 py-2 text-xs font-black tracking-[0.18em] text-slate-300">
            السابق
          </span>
        )}
        {hasNextPage ? (
          <Link
            href={page + 1 <= 1 ? routeBase : `${routeBase}?page=${page + 1}`}
            className="inline-flex items-center justify-center border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-black tracking-[0.18em] text-white transition hover:bg-slate-800"
          >
            التالي
          </Link>
        ) : (
          <span className="inline-flex items-center justify-center border border-slate-100 px-4 py-2 text-xs font-black tracking-[0.18em] text-slate-300">
            التالي
          </span>
        )}
      </div>
    </div>
  );
}
