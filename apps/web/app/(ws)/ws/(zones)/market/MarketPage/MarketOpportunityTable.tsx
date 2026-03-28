import MarketPanel from "./MarketPanel";

type OpportunityRow = {
  city: string;
  area: string;
  priority: "high" | "medium" | "watch";
  demandSignals: number;
  researchRuns: number;
  inventoryCount: number;
  dominantProductType: string | null;
  strongestSellingPoint: string | null;
  reason: string;
};

function getPriorityTone(priority: OpportunityRow["priority"]): string {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";
  }
}

/**
 * WHY:   Opportunity ranking still matters, but users need the reasoning in a readable table instead of hiding it in chart tooltips.
 * WHAT:  Renders market opportunities with priority, demand/inventory totals, and the stored explanation.
 * HOW:   Shows the ranking as normal rows with short reasoning text and lightweight status chips.
 */
export default function MarketOpportunityTable({
  rows,
  priorityLabels,
  title = "فرص السوق",
}: {
  rows: OpportunityRow[];
  priorityLabels: Record<"high" | "medium" | "watch", string>;
  title?: string;
}) {
  if (rows.length === 0) {
    return (
      <MarketPanel title={title}>
        <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">لا توجد فرص واضحة ضمن هذا النطاق حالياً.</div>
      </MarketPanel>
    );
  }

  return (
    <MarketPanel title={title}>
      <div className="grid gap-3">
        {rows.map((row) => (
          <article key={`${row.city}-${row.area}-${row.priority}`} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 text-right">
                <div className="text-base font-medium text-slate-950 dark:text-slate-100">
                  {row.area}
                  <span className="mr-2 text-sm font-normal text-slate-500 dark:text-slate-400">{row.city}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{row.reason}</p>
              </div>
              <span className={`inline-flex shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium ${getPriorityTone(row.priority)}`}>
                {priorityLabels[row.priority]}
              </span>
            </div>
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 md:grid-cols-5">
              <div>
                <div className="text-xs text-slate-400 dark:text-slate-500">الطلب</div>
                <div className="mt-1 font-medium text-slate-950 dark:text-slate-100">{row.demandSignals.toLocaleString("en-US")}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 dark:text-slate-500">الأبحاث</div>
                <div className="mt-1 font-medium text-slate-950 dark:text-slate-100">{row.researchRuns.toLocaleString("en-US")}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 dark:text-slate-500">المخزون الحالي</div>
                <div className="mt-1 font-medium text-slate-950 dark:text-slate-100">{row.inventoryCount.toLocaleString("en-US")}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 dark:text-slate-500">المنتج الغالب</div>
                <div className="mt-1 font-medium text-slate-950 dark:text-slate-100">{row.dominantProductType ?? "غير واضح"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 dark:text-slate-500">الإشارة الأوضح</div>
                <div className="mt-1 font-medium text-slate-950 dark:text-slate-100">{row.strongestSellingPoint ?? "غير واضحة"}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </MarketPanel>
  );
}
