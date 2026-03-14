export default function AgConstraintSummary({
  constraints,
}: {
  constraints: string[];
}) {
  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5">
      <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">القيود المفهومة من الطلب</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {constraints.map((constraint) => (
          <div
            key={constraint}
            className="border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
          >
            {constraint}
          </div>
        ))}
      </div>
    </section>
  );
}
