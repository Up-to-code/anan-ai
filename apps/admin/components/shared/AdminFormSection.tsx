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
    <section className="rounded-[8px] border border-border bg-white p-5">
      <div className="mb-4 space-y-1">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
