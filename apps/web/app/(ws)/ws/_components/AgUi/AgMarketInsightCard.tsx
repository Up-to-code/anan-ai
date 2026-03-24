export default function AgMarketInsightCard({
  title,
  body,
  metrics,
}: {
  title: string;
  body: string;
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5">
      <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">رؤية سوقية</div>
      <h3 className="mt-1 text-base font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-xs font-medium leading-6 text-slate-500">{body}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">{metric.label}</div>
            <div className="mt-1 text-sm font-black text-slate-950">{metric.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
