import { FileSearch, CheckCircle2, AlertCircle, Clock } from "lucide-react";

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

type MarketLatestResearchProps = {
  latestUpdate: LatestUpdate | null;
  title?: string;
};

function LatestResearchEmptyState({ title }: { title: string }) {
  return (
    <section className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white/95 p-8 text-center text-right shadow-sm backdrop-blur-md">
      <div className="mb-4 rounded-lg bg-blue-50 p-4 text-blue-500">
        <FileSearch className="w-8 h-8" />
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm">
        لا يوجد بحث محفوظ يطابق هذا النطاق. إجراء أبحاث جديدة سيُحسّن من دقة وسعة قاعدة المعرفة السوقية لدينا بشكل تدريجي.
      </p>
    </section>
  );
}

function LatestFindingCard({ finding }: { finding: LatestUpdate["topFindings"][number] }) {
  const summary = [finding.locationHint, finding.area, finding.priceHint].filter(Boolean).join(" • ");
  return (
    <article className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-right transition-colors hover:bg-slate-50">
      <h3 className="text-sm font-bold text-slate-900">{finding.title}</h3>
      <p className="mt-2 text-xs font-semibold text-slate-600">{summary || "تفاصيل موقع وسعر محدودة"}</p>
      {finding.features && finding.features.length > 0 ? (
        <p className="mt-2 inline-block rounded-md border border-slate-100 bg-white px-2 py-1 text-[10px] font-bold text-slate-400 shadow-sm">
          {finding.features.join("، ")}
        </p>
      ) : null}
    </article>
  );
}

/**
 * WHY:   Users asked for the newest meaningful update per city or area, and that update must come from persisted research runs.
 * WHAT:  Renders the latest matching market-research card with query, source count, and top findings.
 * HOW:   Accepts the selected persisted update from the page model so overview and research tabs can reuse the same component without exposing timestamps.
 */
export default function MarketLatestResearch({
  latestUpdate,
  title = "آخر تحديث بحثي",
}: MarketLatestResearchProps) {
  if (!latestUpdate) {
    return <LatestResearchEmptyState title={title} />;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-md">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <span className="rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
          {latestUpdate.sourceCount.toLocaleString("en-US")} مصدر
        </span>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>

      <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-right">
        <div className="flex items-center justify-between mb-2">
          {latestUpdate.status === "completed" ? (
            <span className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
              <CheckCircle2 className="w-3 h-3" /> مكتمل
            </span>
          ) : latestUpdate.status === "partial" ? (
            <span className="flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600">
              <Clock className="w-3 h-3" /> جزئي (يُمكن تحسينه)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
              <AlertCircle className="w-3 h-3" /> فشل التحليل
            </span>
          )}
          <span className="text-[10px] font-black uppercase text-slate-400">الاستعلام الأخير</span>
        </div>
        <div className="text-sm font-bold text-slate-900 pr-2 border-r-2 border-slate-200">{latestUpdate.query}</div>
      </div>

      <div className="mt-5 grid gap-3">
        {latestUpdate.topFindings.map((finding) => <LatestFindingCard key={`${finding.title}-${finding.sourceUrl ?? ""}`} finding={finding} />)}
      </div>
    </section>
  );
}
