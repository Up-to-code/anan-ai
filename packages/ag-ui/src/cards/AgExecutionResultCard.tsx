import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";

/**
 * WHY:   Action execution needs a lightweight status card that works across hosts and agent flows.
 * WHAT:  Displays a title, description, and status tone for done, running, or blocked execution states.
 * HOW:   Chooses the matching icon and tone class from the `status` prop.
 */
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "running"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-amber-200 bg-amber-50 text-amber-700";
  const Icon = status === "done" ? CheckCircle2 : status === "running" ? Clock3 : CircleAlert;

  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center border ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-xs font-medium leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </section>
  );
}
