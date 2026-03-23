type SettingsSummaryItem = {
  label: string;
  value: string | number;
};

/**
 * WHY:   Organization settings need a compact snapshot without branded stat chrome.
 * WHAT:  Renders a 2x2 summary grid with readable labels and values.
 * HOW:   Uses a simple bordered grid with neutral text to keep scanability high.
 */
export default function SettingsSummary({ items }: { items: SettingsSummaryItem[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div 
          key={item.label} 
          className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
        >
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">
            {item.label}
          </div>
          <div className="mt-2 text-xl font-black tracking-tight text-slate-950">
            {item.value}
          </div>
        </div>
      ))}
    </section>
  );
}
