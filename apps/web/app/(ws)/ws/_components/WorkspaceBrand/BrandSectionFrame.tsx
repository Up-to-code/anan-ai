export default function BrandSectionFrame({
  eyebrow: _eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 bg-white px-6 py-4 lg:px-8 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-950 dark:text-slate-100">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
