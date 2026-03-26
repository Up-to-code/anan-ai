import { cn } from "@/lib/utils";

type WorkspacePanelProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "muted" | "warn";
};

const tones = {
  default: "border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
  dark: "border border-slate-800 bg-slate-900 text-white dark:border-slate-700 dark:bg-slate-950",
  muted: "border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100",
  warn: "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100",
};

export default function WorkspacePanel({
  children,
  className,
  tone = "default",
}: WorkspacePanelProps) {
  return (
    <section
      className={cn(
        "p-6",
        tones[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}
