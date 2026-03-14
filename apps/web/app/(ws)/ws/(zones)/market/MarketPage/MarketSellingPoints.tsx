type SellingPointItem = {
  label: string;
  count: number;
  source: "features" | "derived_configuration";
};

/**
 * WHY:   The selected city or area needs a concise explanation of which selling points repeat most often in stored market signals.
 * WHAT:  Renders the ranked selling-point list derived from features first, then fallback configuration signals.
 * HOW:   Accepts pre-aggregated items so overview and research tabs can trim or reorder the list without duplicating presentation logic.
 */
export default function MarketSellingPoints({
  items,
  title = "أبرز نقاط البيع في هذا النطاق",
  description,
}: {
  items: SellingPointItem[];
  title?: string;
  description?: string;
}) {
  return (
    <section className="border border-slate-200 bg-white p-4">
      <div className="border-b border-slate-100 pb-4 text-right">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm font-medium text-slate-500">{description}</p> : null}
      </div>

      {items.length === 0 ? (
        <p className="pt-4 text-sm font-medium text-slate-500">لا توجد إشارات كافية حتى الآن.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {items.map((item) => (
            <li key={`${item.source}-${item.label}`} className="flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-right">
                <div className="text-sm font-black text-slate-950">{item.label}</div>
                <div className="mt-1 text-xs font-bold text-slate-500">
                  {item.source === "features" ? "من الخصائص المكررة في الأبحاث" : "من تكرار التكوينات والمنتجات"}
                </div>
              </div>
              <div className="text-sm font-black text-slate-700">{item.count.toLocaleString("en-US")}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
