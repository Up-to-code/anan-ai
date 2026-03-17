/**
 * WHY:   Settings pages need a clean, consistent header aligned with the account center style.
 * WHAT:  Renders a simple title + description block for settings screens.
 * HOW:   Uses the same typography and spacing as `/ws/me` while avoiding branded intro chrome.
 */
export default function SettingsHeader({
  title,
  description,
  eyebrow = "الإعدادات العامة",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <header className="space-y-4">
      <div className="inline-flex items-center gap-3">
        <span className="h-px w-8 bg-blue-600" />
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
          {eyebrow}
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 lg:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500">{description}</p>
      </div>
    </header>
  );
}
