import type { ReactNode } from "react";

type AdminFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * WHY:   Flat field lists make admin data entry feel unfinished and harder to scan.
 * WHAT:  Wraps related inputs inside a titled section with the shared panel treatment.
 * HOW:   Keeps spacing and typography calm while letting the form fields define their own inner grid.
 */
export default function AdminFormSection({ title, description, children }: AdminFormSectionProps) {
  return (
    <section className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] p-5 shadow-sm">
      <div className="mb-4 space-y-1">
        <h2 className="text-base font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h2>
        {description ? <p className="text-sm leading-6 text-[var(--workspace-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
