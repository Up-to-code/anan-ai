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
    <section className="w-full max-w-[340px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">آخر تحديث</div>
      <h3 className="mt-1 text-base font-black text-[var(--workspace-bubble-other-foreground)]">{entity}</h3>
      <p className="mt-2 text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">{headline}</p>
      <div className="mt-4 grid gap-2">
        {details.map((detail) => (
          <div key={detail} className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2 text-xs font-medium text-[var(--workspace-muted)]">
            {detail}
          </div>
        ))}
      </div>
    </section>
  );
}
