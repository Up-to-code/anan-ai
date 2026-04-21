/**
 * WHY:   Workspace settings should open with calm orientation copy instead of a loud dashboard hero.
 * WHAT:  Renders a compact text-only header for the settings surface.
 * HOW:   Keeps hierarchy typographic first and lets the surrounding page handle structure and chrome.
 */
export default function SettingsHeader({
  title,
  description,
  workspaceLabel,
  dir = "rtl",
}: {
  title: string;
  description: string;
  workspaceLabel: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <header className="space-y-1 px-1" dir={dir}>
      <div className="space-y-1">
        <div className="text-[11px] font-semibold text-[var(--workspace-muted)]">
          {workspaceLabel}
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-2xl text-sm font-medium leading-7 text-muted-foreground">{description}</p>
      </div>
    </header>
  );
}
