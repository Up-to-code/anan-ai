import { memo } from "react"

/**
 * WHY:   Constraint summaries should read like natural confirmation, not a tag cloud.
 * WHAT:  Renders understood constraints as a readable sentence instead of a grid of tags.
 * HOW:   Joins constraints with commas and presents them as conversational text with a subtle accent.
 */
const AgConstraintSummaryComponent = function AgConstraintSummary({
  constraints,
}: {
  constraints: string[];
}) {
  if (constraints.length === 0) return null;

  return (
    <div className="w-full max-w-[380px] border-r-2 border-[color:color-mix(in_srgb,var(--workspace-highlight)_40%,transparent)] pr-4 py-1">
      <div className="text-[10px] font-semibold tracking-wider text-[var(--workspace-highlight)]">فهمت من طلبك</div>
      <p className="mt-1 text-sm font-medium leading-7 text-[var(--workspace-bubble-other-foreground)]">
        {constraints.join("، ")}
      </p>
    </div>
  );
}

export default memo(AgConstraintSummaryComponent)
