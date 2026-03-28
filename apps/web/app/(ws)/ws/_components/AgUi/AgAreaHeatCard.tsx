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
      ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
      : heat === "warm"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
        : "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]";

  return (
    <section className="w-full max-w-[300px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black tracking-[0.18em] text-[var(--workspace-muted)]">{city}</div>
          <h3 className="mt-1 text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{area}</h3>
        </div>
        <div className={`rounded-lg border px-2 py-1 text-[10px] font-black tracking-[0.18em] ${tone}`}>
          {heat === "hot" ? "ساخن" : heat === "warm" ? "متوازن" : "بارد"}
        </div>
      </div>
      <p className="mt-3 text-xs font-medium leading-6 text-[var(--workspace-muted)]">{summary}</p>
    </section>
  );
}
