import type { OfferSenderProfile } from "../offersPageData";
import OfferPaginationNav from "../OfferPaginationNav";

/**
 * WHY:   The offers zone now needs focused broker/developer profile tabs instead of one flat marketplace list only.
 * WHAT:  Renders a paginated sender-profile directory for either broker or developer offer owners.
 * HOW:   Receives already-grouped profiles from the route and renders one card per sender with count and pricing summaries.
 */
export default function OfferProfilesPage({
  title,
  description,
  profiles,
  totalItems,
  page,
  pageCount,
  hasPreviousPage,
  hasNextPage,
  routeBase,
}: {
  title: string;
  description: string;
  profiles: OfferSenderProfile[];
  totalItems: number;
  page: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  routeBase: string;
}) {
  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="grid gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <section className="border border-slate-200 bg-white p-6 text-right">
          <h1 className="text-2xl font-black text-slate-950">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-600">{description}</p>
          <div className="mt-4 text-xs font-black tracking-[0.18em] text-slate-400">
            {totalItems} ملف ظاهر في هذه الصفحة
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <article key={profile.id} className="border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black text-slate-950">{profile.name}</h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {profile.kind === "broker" ? "ملف وسيط" : "ملف مطور"}
                  </p>
                </div>
                <div className="border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-slate-600">
                  {profile.offerCount} عروض
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-px border border-slate-100 bg-slate-100">
                <div className="bg-white px-3 py-3">
                  <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">عام</div>
                  <div className="mt-1 text-sm font-black text-slate-950">{profile.publicCount}</div>
                </div>
                <div className="bg-white px-3 py-3">
                  <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">خاص</div>
                  <div className="mt-1 text-sm font-black text-slate-950">{profile.privateCount}</div>
                </div>
                <div className="bg-white px-3 py-3">
                  <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">متوسط السعر</div>
                  <div className="mt-1 text-sm font-black text-slate-950">{profile.averagePriceLabel}</div>
                </div>
                <div className="bg-white px-3 py-3">
                  <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">آخر موقع</div>
                  <div className="mt-1 text-sm font-black text-slate-950">{profile.latestLocation}</div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-right">
                <div>
                  <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">المشروع الأبرز</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">{profile.topProjectTitle}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">آخر عرض</div>
                  <div className="mt-1 text-sm font-bold text-slate-800">{profile.latestOfferTitle}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {profiles.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-16 text-center text-sm font-bold text-slate-500">
            لا توجد ملفات متاحة ضمن هذا التصنيف حالياً.
          </div>
        ) : (
          <OfferPaginationNav
            page={page}
            pageCount={pageCount}
            hasPreviousPage={hasPreviousPage}
            hasNextPage={hasNextPage}
            routeBase={routeBase}
          />
        )}
      </div>
    </div>
  );
}
