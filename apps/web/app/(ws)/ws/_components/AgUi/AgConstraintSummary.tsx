/**
 * WHY:   Constraint summaries should read like natural confirmation, not a tag cloud.
 * WHAT:  Renders understood constraints as a readable sentence instead of a grid of tags.
 * HOW:   Joins constraints with commas and presents them as conversational text with a subtle accent.
 */
export default function AgConstraintSummary({
  constraints,
}: {
  constraints: string[];
}) {
  if (constraints.length === 0) return null;

  return (
    <div className="w-full max-w-[380px] border-r-2 border-slate-300 pr-4 py-1">
      <div className="text-[10px] font-semibold tracking-wider text-slate-500">فهمت من طلبك</div>
      <p className="mt-1 text-sm font-medium leading-7 text-slate-700">
        {constraints.join("، ")}
      </p>
    </div>
  );
}
