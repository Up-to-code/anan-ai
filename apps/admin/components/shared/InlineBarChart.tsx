import { cn } from "@/lib/utils";

type InlineBarChartProps = {
  items: Array<{ label: string; value: number; tone?: "primary" | "danger" | "neutral" }>;
  className?: string;
};

const toneClassName = {
  primary: "bg-blue-600",
  danger: "bg-rose-600",
  neutral: "bg-slate-700",
};

/**
 * WHY:   The admin app needs lightweight visual summaries without introducing a full charting dependency.
 * WHAT:  Renders a simple labeled horizontal bar list for small operational datasets.
 * HOW:   Normalizes widths against the largest value and applies the institutional admin palette.
 */
export default function InlineBarChart({ items, className }: InlineBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-600">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 text-slate-900">{item.value}</span>
          </div>
          <div className="h-2 bg-slate-100">
            <div
              className={cn("h-full", toneClassName[item.tone ?? "primary"])}
              style={{ width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 6 : 0)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
