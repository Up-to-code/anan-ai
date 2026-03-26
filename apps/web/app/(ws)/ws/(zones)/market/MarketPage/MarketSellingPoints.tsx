import MarketPanel from "./MarketPanel";

type SellingPointItem = {
  label: string;
  count: number;
  source: "features" | "derived_configuration";
};

function getSourceLabel(source: SellingPointItem["source"]): string {
  return source === "features" ? "من خصائص متكررة" : "من التكوينات والمنتجات";
}

/**
 * WHY:   Selling points still matter to market analysis, but they should appear as direct evidence instead of decorative badges.
 * WHAT:  Renders repeated selling points with their frequency and origin.
 * HOW:   Uses a plain ranked list that matches the rest of the rebuilt market reporting UI.
 */
export default function MarketSellingPoints({
  items,
  title = "نقاط البيع المتكررة",
  description,
}: {
  items: SellingPointItem[];
  title?: string;
  description?: string;
}) {
  if (items.length === 0) {
    return (
      <MarketPanel title={title} description={description}>
        <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">لا توجد إشارات متكررة كافية لاستخلاص نقاط بيع مؤكدة.</div>
      </MarketPanel>
    );
  }

  return (
    <MarketPanel title={title} description={description}>
      <ol className="grid gap-3">
        {items.map((item) => (
          <li key={`${item.source}-${item.label}`} className="flex items-start justify-between gap-4 rounded-md border border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="min-w-0 text-right">
              <div className="text-sm font-medium text-slate-950 dark:text-slate-100">{item.label}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{getSourceLabel(item.source)}</div>
            </div>
            <div className="shrink-0 text-sm font-medium text-slate-950 dark:text-slate-100">{item.count.toLocaleString("en-US")}</div>
          </li>
        ))}
      </ol>
    </MarketPanel>
  );
}
