type ChartItem = {
  label: string;
  value: number;
  secondaryValue?: number;
  valueLabel?: string;
  secondaryLabel?: string;
};

/**
 * WHY:   The market page needs compact charts that support scanning without overwhelming the tables.
 * WHAT:  Renders a small inline horizontal bar chart with optional secondary comparison bars.
 * HOW:   Uses plain CSS widths derived from the maximum row value and keeps the component label-first and table-friendly.
 */
export default function MarketMiniBarChart({
  title,
  items,
}: {
  title: string;
  items: ChartItem[];
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const maxSecondaryValue = Math.max(...items.map((item) => item.secondaryValue ?? 0), 1);

  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="text-right">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {items.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">لا توجد بيانات كافية لهذا الرسم.</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="grid gap-2">
              <div className="flex items-center justify-between gap-4 text-right">
                <div className="text-sm font-black text-slate-950">{item.label}</div>
                <div className="text-xs font-bold text-slate-600">{item.valueLabel ?? item.value.toLocaleString("en-US")}</div>
              </div>
              <div className="h-2 bg-slate-100">
                <div className="h-full bg-slate-950" style={{ width: `${Math.max(8, (item.value / maxValue) * 100)}%` }} />
              </div>
              {typeof item.secondaryValue === "number" && (
                <div className="grid gap-1">
                  <div className="text-[11px] font-bold text-slate-500">{item.secondaryLabel ?? item.secondaryValue.toLocaleString("en-US")}</div>
                  <div className="h-1.5 bg-slate-100">
                    <div
                      className="h-full bg-slate-400"
                      style={{ width: `${Math.max(8, (item.secondaryValue / maxSecondaryValue) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
