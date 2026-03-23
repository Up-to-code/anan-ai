import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
};

/**
 * WHY:   The admin CRUD surfaces should share one consistent field label and hint pattern.
 * WHAT:  Wraps form controls with institutional labels and optional helper text.
 * HOW:   Leaves the actual control implementation to callers while standardizing spacing and typography.
 */
export default function FormField({ label, htmlFor, children, hint }: FormFieldProps) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
