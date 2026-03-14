type LatestUpdate = {
  query: string;
  createdAt: number;
  status: "completed" | "partial" | "failed";
  sourceCount: number;
  topFindings: Array<{
    title: string;
    locationHint?: string;
    priceHint?: string;
    area?: string;
    features?: string[];
    sourceTitle?: string;
    sourceUrl?: string;
  }>;
};

/**
 * WHY:   Users asked for the newest meaningful update per city or area, and that update must come from persisted research runs.
 * WHAT:  Renders the latest matching market-research card with query, source count, and top findings.
 * HOW:   Accepts the selected persisted update from the page model so overview and research tabs can reuse the same component without exposing timestamps.
 */
export default function MarketLatestResearch({
  latestUpdate,
  title = "آخر تحديث بحثي",
}: {
  latestUpdate: LatestUpdate | null;
  title?: string;
}) {
  if (!latestUpdate) {
    return (
      <section className="border border-slate-200 bg-white p-4 text-right">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="mt-3 text-sm font-medium text-slate-500">لا يوجد بحث محفوظ يطابق هذا النطاق خلال الفترة المحددة.</p>
      </section>
    );
  }

  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="border-b border-slate-100 pb-4 text-right">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {latestUpdate.sourceCount.toLocaleString("en-US")} مصدر
        </p>
      </div>

      <div className="mt-4 text-right">
        <div className="text-xs font-black text-slate-500">الاستعلام</div>
        <div className="mt-1 text-sm font-black text-slate-950">{latestUpdate.query}</div>
        <div className="mt-1 text-xs font-bold text-slate-500">الحالة: {latestUpdate.status}</div>
      </div>

      <div className="mt-4 grid gap-3">
        {latestUpdate.topFindings.map((finding) => (
          <article key={`${finding.title}-${finding.sourceUrl ?? ""}`} className="border border-slate-200 bg-slate-50 p-4 text-right">
            <h3 className="text-sm font-black text-slate-950">{finding.title}</h3>
            <p className="mt-2 text-sm font-medium text-slate-600">
              {[finding.locationHint, finding.area, finding.priceHint].filter(Boolean).join(" • ") || "تفاصيل موقع وسعر محدودة"}
            </p>
            {finding.features && finding.features.length > 0 && (
              <p className="mt-2 text-xs font-bold text-slate-500">{finding.features.join("، ")}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
