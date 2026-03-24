import { cn } from "@/lib/utils";

type InlineBarChartProps = {
  items: Array<{ label: string; value: number; tone?: "primary" | "danger" | "neutral" }>;
  className?: string;
};

const toneClassName = {
  primary: "bg-slate-900",
  danger: "bg-rose-700",
  neutral: "bg-amber-700",
};

/**
 * WHY:   Some admin pages still benefit from a lightweight bar list where a full chart would be unnecessary.
 * WHAT:  Renders a compact horizontal bar summary with the rebuilt admin color treatment.
 * HOW:   Normalizes widths against the largest value and keeps bars visually plain and readable.
 */
export default function InlineBarChart({ items, className }: InlineBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 font-medium text-slate-900">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-stone-200">
            <div
              className={cn("h-full rounded-full", toneClassName[item.tone ?? "primary"])}
              style={{ width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 6 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
