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
    <section className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="bg-white px-5 py-4">
          <div className="text-xs font-semibold text-slate-500">{item.label}</div>
          <div className="mt-2 text-lg font-black text-slate-950">{item.value}</div>
        </div>
      ))}
    </section>
  );
}
