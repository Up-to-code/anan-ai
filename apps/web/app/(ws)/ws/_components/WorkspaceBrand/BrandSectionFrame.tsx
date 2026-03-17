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
    <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fcfdfe_100%)] px-6 py-8 lg:px-10 lg:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.03),transparent_40%)]" />
      
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-4">
            <span className="h-[2px] w-12 rounded-full bg-blue-600" />
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600">
              {eyebrow}
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        </div>
        {actions ? (
          <div className="shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
