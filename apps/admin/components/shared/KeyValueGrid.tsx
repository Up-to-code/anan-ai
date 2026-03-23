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
    <div className={`grid gap-2.5 ${columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"}`}>
      {items.map((item) => (
        <div key={String(item.label)} className="rounded-[8px] border border-border bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] text-slate-500">{item.label}</div>
          <div className="mt-1 text-sm font-medium leading-5 text-slate-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
