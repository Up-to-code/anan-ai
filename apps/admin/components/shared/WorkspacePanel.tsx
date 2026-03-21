import { cn } from "@/lib/utils";

type WorkspacePanelProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "muted" | "warn";
};

const tones = {
  default: "rounded-xl border border-stone-300 bg-white",
  dark: "rounded-xl border border-slate-800 bg-slate-900 text-white",
  muted: "rounded-xl border border-stone-300 bg-stone-50",
  warn: "rounded-xl border border-amber-300 bg-amber-50",
};

/**
 * WHY:   Rebuilt admin pages need one shared container surface for charts, tables, and dense operational panels.
 * WHAT:  Wraps content in a consistent bordered panel with optional tonal variants.
 * HOW:   Applies the selected tone class and shared panel spacing while allowing page-level extensions.
 */
export default function WorkspacePanel({
  children,
  className,
  tone = "default",
}: WorkspacePanelProps) {
  return (
    <section className={cn("p-5 sm:p-6", tones[tone], className)}>
      {children}
    </section>
  );
}
