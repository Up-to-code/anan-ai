import { cn } from "@/lib/utils";

type WorkspacePanelProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "muted" | "warn";
};

const tones = {
  default: "border-2 border-slate-100 bg-white",
  dark: "border-2 border-slate-800 bg-slate-900 text-white",
  muted: "border-2 border-slate-100 bg-slate-50",
  warn: "border-2 border-amber-200 bg-amber-50",
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
