import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

/**
 * WHY:   Admin pages need one consistent empty-state treatment across tables, feeds, and detail panels.
 * WHAT:  Renders a minimal institutional empty state with a title and description.
 * HOW:   Uses the shared token palette and border treatment from the admin design system.
 */
export default function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center", className)}>
      <div className="text-sm font-black uppercase tracking-widest text-slate-500">{title}</div>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}
