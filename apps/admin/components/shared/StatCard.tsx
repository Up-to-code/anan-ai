import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  delta?: number | null;
  className?: string;
};

/**
 * WHY:   Leadership and operations views need a shared metric tile that works for both quick KPIs and supporting counters.
 * WHAT:  Renders a bordered metric card with optional icon, helper text, and period delta.
 * HOW:   Formats the delta as a percentage when provided and keeps the rest of the card intentionally plain.
 */
export default function StatCard({ label, value, hint, icon: Icon, delta, className }: StatCardProps) {
  const numericDelta = typeof delta === "number" ? delta : null;
  const deltaLabel =
    typeof numericDelta === "number"
      ? `${numericDelta > 0 ? "+" : ""}${new Intl.NumberFormat("ar-SA", {
          style: "percent",
          maximumFractionDigits: 0,
        }).format(numericDelta)}`
      : null;

  return (
    <div className={cn("rounded-xl border border-stone-300 bg-white p-5 transition-colors hover:border-stone-400", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-100 text-slate-500">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {deltaLabel ? (
        <div className={cn("mt-3 text-sm font-medium", (numericDelta ?? 0) >= 0 ? "text-emerald-700" : "text-rose-700")}>
          {deltaLabel} مقارنة بالفترة السابقة
        </div>
      ) : null}
      {hint ? <p className="mt-3 text-sm leading-7 text-slate-500">{hint}</p> : null}
    </div>
  );
}
