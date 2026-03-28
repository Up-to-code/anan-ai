import MarketPanel from "./MarketPanel";

const DATE_FORMATTER = new Intl.DateTimeFormat("ar-SA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

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

function getStatusLabel(status: LatestUpdate["status"]): string {
  switch (status) {
    case "completed":
      return "مكتمل";
    case "partial":
      return "جزئي";
    default:
      return "فشل";
  }
}

/**
 * WHY:   The user asked for the latest market results within the selected period, and those results must come from saved research.
 * WHAT:  Renders the newest matching research run with its query, date, status, and top findings.
 * HOW:   Keeps the layout compact and text-first so the panel reads like a usable research summary.
 */
export default function MarketLatestResearch({
  latestUpdate,
  title = "آخر نتائج البحث في هذه الفترة",
}: {
  latestUpdate: LatestUpdate | null;
  title?: string;
}) {
  if (!latestUpdate) {
    return (
      <MarketPanel title={title}>
        <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">لا يوجد بحث محفوظ يطابق هذا النطاق حتى الآن.</div>
      </MarketPanel>
    );
  }

  return (
    <MarketPanel
      title={title}
      actions={
        <div className="text-left text-xs text-slate-500 dark:text-slate-400">
          {DATE_FORMATTER.format(new Date(latestUpdate.createdAt))}
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-medium text-slate-950 dark:text-slate-100">{latestUpdate.query}</div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{getStatusLabel(latestUpdate.status)}</span>
              <span>•</span>
              <span>{latestUpdate.sourceCount.toLocaleString("en-US")} مصدر</span>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          {latestUpdate.topFindings.map((finding) => (
            <article key={`${finding.title}-${finding.sourceUrl ?? ""}`} className="rounded-md border border-slate-200 p-4 text-right dark:border-slate-800">
              <h3 className="text-sm font-medium text-slate-950 dark:text-slate-100">{finding.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {[finding.locationHint, finding.area, finding.priceHint].filter(Boolean).join(" • ") || "تفاصيل محدودة"}
              </p>
              {finding.features?.length ? (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{finding.features.join("، ")}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </MarketPanel>
  );
}
