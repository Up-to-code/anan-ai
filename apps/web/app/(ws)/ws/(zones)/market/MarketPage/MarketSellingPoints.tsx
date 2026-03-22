type SellingPointItem = {
  label: string;
  count: number;
  source: "features" | "derived_configuration";
};

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
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-md">
      <div className="border-b border-slate-100 pb-5 text-right">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-xs font-semibold text-slate-500">{description}</p> : null}
      </div>
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-bold text-slate-400">لا توجد إشارات أو تكوينات متكررة كافية لاستخلاص نقاط بيع مؤكدة.</p>
          <p className="text-xs font-semibold text-slate-400 mt-2">تشغيل مزيد من الأبحاث في هذا النطاق سيُثري هذه النتائج.</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3">
          {items.map((item) => (
            <li key={`${item.source}-${item.label}`} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-5 py-4 shadow-sm transition-colors hover:bg-slate-100/50">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{item.label}</div>
                <div className="mt-1 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                  {item.source === "features" ? "من الخصائص المكررة في الأبحاث" : "من تكرار التكوينات والمنتجات"}
                </div>
              </div>
              <div className="text-lg font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                {item.count.toLocaleString("en-US")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
