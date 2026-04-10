import { memo } from "react"

/**
 * WHY:   Destructive workspace actions need one explicit target summary before the user confirms execution.
 * WHAT:  Renders the selected target, a short description, and key identifying lines.
 * HOW:   Keeps the content structured and compact so confirmation flows stay clear and hard to misread.
 */
const AgTargetSummaryComponent = function AgTargetSummary({
  title,
  description,
  lines,
}: {
  title: string;
  description: string;
  lines: string[];
}) {
  return (
    <section className="w-full max-w-[420px] rounded-3xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <h3 className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
      <p className="mt-2 text-xs font-medium leading-6 text-[var(--workspace-muted)]">{description}</p>
      <div className="mt-4 space-y-2">
        {lines.map((line) => (
          <div
            key={line}
            className="rounded-2xl border border-[color:color-mix(in_srgb,var(--workspace-border)_85%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_84%,black)] px-4 py-3 text-xs font-semibold text-[var(--workspace-bubble-other-foreground)]"
          >
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(AgTargetSummaryComponent)
