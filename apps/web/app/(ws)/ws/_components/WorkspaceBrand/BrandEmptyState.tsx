import { memo } from "react"

/**
 * WHY:   Workspace relation gaps should still feel intentional and branded instead of plain dashed placeholders.
 * WHAT:  Renders a neutral empty-state panel with optional description.
 * HOW:   Uses the same border, spacing, and blue accent cues as the rest of the workspace brand layer.
 */
const BrandEmptyStateComponent = function BrandEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="rounded-3xl border border-dashed border-border/60 bg-muted/10 px-6 py-12 text-center transition-colors hover:bg-muted/20">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-background/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 shadow-sm border border-border/40">
        A
      </div>
      <div className="mt-4 text-[15px] font-black tracking-tight text-foreground">{title}</div>
      {description ? (
        <p className="mx-auto mt-2 max-w-[240px] text-[13px] font-medium leading-relaxed text-muted-foreground/60">
          {description}
        </p>
      ) : null}
    </section>
  );
}

export default memo(BrandEmptyStateComponent)
