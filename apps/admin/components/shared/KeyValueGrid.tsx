import { cn } from "@/lib/utils";

type KeyValueGridProps = {
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: 2 | 3;
};

/**
 * WHY:   Detail pages across organizations, users, banks, and settings need the same compact summary layout.
 * WHAT:  Renders a responsive grid of labeled values.
 * HOW:   Uses a simple bordered grid so dense metadata stays readable in both desktop and mobile layouts.
 */
export default function KeyValueGrid({ items, columns = 2 }: KeyValueGridProps) {
  return (
    <div className={cn("grid gap-3", columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2")}>
      {items.map((item) => (
        <div key={String(item.label)} className="rounded-2xl border border-border/30 bg-muted/5 p-4 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40 leading-none">{item.label}</div>
          <div className="text-[13px] font-black leading-tight text-foreground tracking-tight">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
