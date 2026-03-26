type MarketPanelProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * WHY:   The new market workspace needs one normal section shell instead of many unrelated card styles.
 * WHAT:  Renders a bordered market panel with a compact header and content body.
 * HOW:   Keeps spacing, borders, and optional actions consistent across the rebuilt market page.
 */
export default function MarketPanel({ title, description, actions, children }: MarketPanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 text-right">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{description}</p> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}
