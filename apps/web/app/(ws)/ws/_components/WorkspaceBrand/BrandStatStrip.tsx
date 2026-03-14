type BrandStatItem = {
  label: string;
  value: string | number;
  tone?: "default" | "blue";
};

/**
 * WHY:   Dashboard summaries should read as one branded strip instead of four unrelated utility cards.
 * WHAT:  Renders a responsive stat strip with a shared frame and emphasized values.
 * HOW:   Accepts serializable label/value pairs and varies only the value tone for emphasis.
 */
export default function BrandStatStrip({
  items,
}: {
  items: BrandStatItem[];
}) {
  return (
    <section className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-5 py-5">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
          <div className={item.tone === "blue" ? "mt-3 text-3xl font-black tracking-tight text-blue-700" : "mt-3 text-3xl font-black tracking-tight text-slate-950"}>
            {item.value}
          </div>
        </div>
      ))}
    </section>
  );
}
