/**
 * WHY:   Workspace sections need one shared branded frame so `/ws` feels like the same product as the landing page.
 * WHAT:  Renders an eyebrow, title, description, and optional actions inside a landing-style section shell.
 * HOW:   Uses muted slate framing, a blue signal rail, and Cairo-led hierarchy without changing page data contracts.
 */
export default function BrandSectionFrame({
  eyebrow,
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
    <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-7 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="inline-flex items-center gap-3">
            <span className="h-px w-10 bg-blue-600" />
            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-700">{eyebrow}</div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 lg:text-[2rem]">{title}</h1>
          <p className="max-w-3xl text-sm font-medium leading-7 text-slate-600">{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
