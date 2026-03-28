import { CheckCircle2, Clock3, CircleAlert } from "lucide-react";
import { AgCardShell } from "./AgCardShell";

export default function AgExecutionResultCard({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: "done" | "running" | "blocked";
}) {
  const tone =
    status === "done"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
      : status === "running"
        ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] text-[var(--workspace-highlight)]"
        : "border-amber-500/25 bg-amber-500/10 text-amber-300";
  const Icon = status === "done" ? CheckCircle2 : status === "running" ? Clock3 : CircleAlert;

  return (
    <AgCardShell className="max-w-[340px]">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
          <p className="mt-1 text-xs font-medium leading-6 text-[var(--workspace-muted)]">{description}</p>
        </div>
      </div>
    </AgCardShell>
  );
}
