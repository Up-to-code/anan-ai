export default function AgLatestUpdateCard({
  entity,
  headline,
  details,
}: {
  entity: string;
  headline: string;
  details: string[];
}) {
  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5">
      <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">آخر تحديث</div>
      <h3 className="mt-1 text-base font-black text-slate-950">{entity}</h3>
      <p className="mt-2 text-sm font-bold text-slate-700">{headline}</p>
      <div className="mt-4 grid gap-2">
        {details.map((detail) => (
          <div key={detail} className="border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            {detail}
          </div>
        ))}
      </div>
    </section>
  );
}
