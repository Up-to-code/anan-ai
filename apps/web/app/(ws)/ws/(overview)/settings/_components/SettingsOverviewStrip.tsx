type SettingsOverviewStripProps = {
  currentTabLabel: string;
  membersCount: number;
  invitesCount: number;
  roleLabel: string;
  labels: {
    currentSection: string;
    members: string;
    invites: string;
    currentRole: string;
  };
};

/**
 * WHY:   The settings page needs a compact orientation strip so users can understand where they are without relying on oversized hero cards.
 * WHAT:  Renders the active section label plus a few low-noise workspace stats.
 * HOW:   Keeps the content in one flat bordered row that wraps gracefully across RTL and LTR layouts.
 */
export default function SettingsOverviewStrip({
  currentTabLabel,
  membersCount,
  invitesCount,
  roleLabel,
  labels,
}: SettingsOverviewStripProps) {
  const items = [
    { label: labels.currentSection, value: currentTabLabel },
    { label: labels.members, value: String(membersCount) },
    { label: labels.invites, value: String(invitesCount) },
    { label: labels.currentRole, value: roleLabel },
  ];

  return (
    <section className="rounded-[22px] border border-border/70 bg-[var(--workspace-panel)] px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        {items.map((item) => (
          <div key={item.label} className="min-w-[120px]">
            <div className="text-[10px] font-black tracking-[0.18em] text-muted-foreground uppercase">
              {item.label}
            </div>
            <div className="mt-1 text-[13px] font-bold text-foreground">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
