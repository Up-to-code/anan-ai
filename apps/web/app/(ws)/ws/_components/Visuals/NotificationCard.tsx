export default function NotificationCard({
  title,
  summary,
  severity,
  source,
  actionLabel,
}: {
  title: string;
  summary: string;
  severity: "info" | "warning" | "success";
  source: string;
  actionLabel: string;
}) {
  const severityClasses =
    severity === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
      : severity === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";

  return (
    <article className="border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92)_0%,rgba(2,6,23,0.98)_100%)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">{source}</div>
          <div className="mt-2 text-lg font-black text-slate-950 dark:text-slate-100">{title}</div>
          <div className="mt-2 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{summary}</div>
        </div>
        <div className={`border px-3 py-1 text-[11px] font-black tracking-[0.18em] ${severityClasses}`}>
          {severity === "warning" ? "تنبيه" : severity === "success" ? "نشط" : "إشارة"}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="h-px w-10 bg-blue-600" />
        <div className="text-xs font-black tracking-[0.25em] text-blue-700 dark:text-blue-300">{actionLabel}</div>
      </div>
    </article>
  );
}
