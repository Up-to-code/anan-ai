import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

/**
 * WHY:   Empty admin states should stay calm and informative without adding decorative filler.
 * WHAT:  Renders a dashed empty-state panel with a title and description.
 * HOW:   Reuses the rebuilt neutral palette and centered text treatment across pages.
 */
export default function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center", className)}>
      <div className="text-base font-medium text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
