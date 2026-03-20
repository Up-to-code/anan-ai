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
    <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-8 text-right flex flex-col items-center justify-center text-center">
      <div className="bg-blue-50 text-blue-500 p-4 rounded-full mb-4">
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
    <article className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl text-right transition-colors hover:bg-slate-50">
      <h3 className="text-sm font-bold text-slate-900">{finding.title}</h3>
      <p className="mt-2 text-xs font-semibold text-slate-600">{summary || "تفاصيل موقع وسعر محدودة"}</p>
      {finding.features && finding.features.length > 0 ? (
        <p className="mt-2 text-[10px] font-bold text-slate-400 bg-white inline-block px-2 py-1 rounded shadow-sm border border-slate-100">
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
    <section className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          {latestUpdate.sourceCount.toLocaleString("en-US")} مصدر
        </span>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>

      <div className="mt-5 text-right bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          {latestUpdate.status === "completed" ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
              <CheckCircle2 className="w-3 h-3" /> مكتمل
            </span>
          ) : latestUpdate.status === "partial" ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 uppercase">
              <Clock className="w-3 h-3" /> جزئي (يُمكن تحسينه)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 uppercase">
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
