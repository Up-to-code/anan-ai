import { memo } from "react"

/**
 * WHY:   Workspace search and listing results should make the active filters visible at a glance.
 * WHAT:  Renders applied filters as compact Arabic pills with a short section title.
 * HOW:   Uses a lightweight flex-wrap layout so the card stays readable on mobile and desktop.
 */
const AgFilterSummaryComponent = function AgFilterSummary({
  title,
  filters,
}: {
  title: string;
  filters: string[];
}) {
  if (filters.length === 0) return null;

  return (
    <section className="w-full max-w-[420px] rounded-3xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--workspace-highlight)]">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <span
            key={filter}
            className="rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_80%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--workspace-bubble-other-foreground)]"
          >
            {filter}
          </span>
        ))}
      </div>
    </section>
  );
}

export default memo(AgFilterSummaryComponent)
