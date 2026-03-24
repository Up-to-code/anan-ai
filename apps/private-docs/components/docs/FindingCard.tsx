import type { DocsFinding } from "@/lib/docs/types";

const severityStyles: Record<DocsFinding["severity"], { badge: string; border: string }> = {
  critical: {
    badge: "bg-rose-600 text-white",
    border: "border-rose-200",
  },
  high: {
    badge: "bg-amber-500 text-slate-950",
    border: "border-amber-200",
  },
  medium: {
    badge: "bg-sky-600 text-white",
    border: "border-sky-200",
  },
  low: {
    badge: "bg-slate-200 text-slate-800",
    border: "border-slate-200",
  },
};

export default function FindingCard({ finding }: { finding: DocsFinding }) {
  const tone = severityStyles[finding.severity];

  return (
    <article className={`rounded-[1.25rem] border bg-white p-5 shadow-sm ${tone.border}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${tone.badge}`}
        >
          {finding.severity}
        </span>
        <h3 className="text-base font-black tracking-tight text-slate-950">{finding.title}</h3>
      </div>

      <p className="mt-4 text-sm font-medium leading-7 text-slate-700">{finding.summary}</p>

      {finding.evidence?.length ? (
        <div className="mt-5">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Evidence
          </div>
          <ul className="mt-3 space-y-2">
            {finding.evidence.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <code>{item}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {finding.ruleRefs?.length ? (
        <div className="mt-5">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Rule References
          </div>
          <ul className="mt-3 space-y-2 text-sm font-semibold leading-7 text-slate-700">
            {finding.ruleRefs.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {finding.recommendations?.length ? (
        <div className="mt-5">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
            Recommended Direction
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-semibold leading-7 text-slate-700 marker:text-slate-400">
            {finding.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
