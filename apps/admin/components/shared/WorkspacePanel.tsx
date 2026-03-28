import { cn } from "@/lib/utils";

type WorkspacePanelProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "muted" | "warn";
};

const tones = {
  default: "rounded-3xl border border-border/40 bg-card shadow-sm",
  dark: "rounded-3xl border border-border bg-slate-900 text-white shadow-xl",
  muted: "rounded-3xl border border-border/40 bg-muted/10",
  warn: "rounded-3xl border border-amber-200/50 bg-amber-50 shadow-sm",
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
    <section className={cn("p-4 sm:p-5", tones[tone], className)}>
      {children}
    </section>
  );
}
