import { cn } from "@/lib/utils";

type WorkspacePanelProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "muted" | "warn";
};

const tones = {
  default: "border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm",
  dark: "border border-slate-800 bg-slate-900 text-white shadow-sm",
  muted: "border border-slate-200/60 bg-slate-50/80 shadow-sm",
  warn: "border border-amber-200 bg-amber-50 shadow-sm",
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
