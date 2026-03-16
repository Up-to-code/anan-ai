/**
 * WHY:   Settings pages need a clean, consistent header aligned with the account center style.
 * WHAT:  Renders a simple title + description block for settings screens.
 * HOW:   Uses the same typography and spacing as `/ws/me` while avoiding branded intro chrome.
 */
export default function SettingsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-black tracking-tight text-slate-950">{title}</h1>
      <p className="text-sm font-medium text-slate-500">{description}</p>
    </header>
  );
}
