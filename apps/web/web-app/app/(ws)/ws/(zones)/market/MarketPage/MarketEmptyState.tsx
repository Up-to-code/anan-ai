/**
 * WHY:   The market page should explicitly state when persisted data is insufficient instead of inventing insights.
 * WHAT:  Renders the empty-state block shown when the selected city/area has no useful market signal yet.
 * HOW:   Uses neutral workspace styling and short Arabic copy that tells the user what to change next.
 */
export default function MarketEmptyState({
  title = "لا توجد إشارات كافية لهذا النطاق",
  description = "غيّر المدينة أو الحي، أو وسّع الفترة الزمنية، وسنظهر لك الإشارات المتاحة من أبحاث أنان وبيانات المخزون الحالية.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="border border-slate-200 bg-white p-10 text-right">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-600">{description}</p>
    </div>
  );
}
