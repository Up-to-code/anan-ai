export default function AgProjectUnitSelector({
  project,
  units,
  selectedLabel,
}: {
  project: string;
  units: string[];
  selectedLabel?: string;
}) {
  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5">
      <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">اختيار المشروع والوحدة</div>
      <h3 className="mt-1 text-base font-black text-slate-950">{project}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {units.map((unit) => (
          <div
            key={unit}
            className={
              unit === selectedLabel
                ? "border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700"
                : "border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600"
            }
          >
            {unit}
          </div>
        ))}
      </div>
    </section>
  );
}
