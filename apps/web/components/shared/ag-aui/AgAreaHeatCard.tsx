export default function AgAreaHeatCard({
  city,
  area,
  heat,
  summary,
}: {
  city: string;
  area: string;
  heat: "hot" | "warm" | "cold";
  summary: string;
}) {
  const tone =
    heat === "hot"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : heat === "warm"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <section className="w-full max-w-[300px] border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">{city}</div>
          <h3 className="mt-1 text-sm font-black text-slate-950">{area}</h3>
        </div>
        <div className={`border px-2 py-1 text-[10px] font-black tracking-[0.18em] ${tone}`}>
          {heat === "hot" ? "ساخن" : heat === "warm" ? "متوازن" : "بارد"}
        </div>
      </div>
      <p className="mt-3 text-xs font-medium leading-6 text-slate-500">{summary}</p>
    </section>
  );
}
