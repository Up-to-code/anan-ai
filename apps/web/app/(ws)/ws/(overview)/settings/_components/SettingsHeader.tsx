"use client";

import { useWebLocale } from "@/app/_components/WebLocaleProvider";

/**
 * Clean, RTL-friendly settings header.
 */
export default function SettingsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { locale, dictionary } = useWebLocale();

  return (
    <header
      className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--workspace-panel)_92%,transparent)_0%,color-mix(in_srgb,var(--workspace-elevated)_96%,transparent)_100%)] px-6 py-6 shadow-sm sm:px-7"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="space-y-2">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--workspace-muted)]">
          {dictionary.settings.workspaceLabel}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-[30px]">{title}</h1>
        <p className="max-w-2xl text-sm font-medium leading-7 text-muted-foreground">{description}</p>
      </div>
    </header>
  );
}
