/**
 * WHY:   Workspace relation gaps should still feel intentional and branded instead of plain dashed placeholders.
 * WHAT:  Renders a neutral empty-state panel with optional description.
 * HOW:   Uses the same border, spacing, and blue accent cues as the rest of the workspace brand layer.
 */
export default function BrandEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="border border-dashed border-slate-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-8 text-center">
      <div className="text-[11px] font-black uppercase tracking-[0.26em] text-blue-700">Anan</div>
      <div className="mt-3 text-sm font-black text-slate-950">{title}</div>
      {description ? <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{description}</p> : null}
    </section>
  );
}
