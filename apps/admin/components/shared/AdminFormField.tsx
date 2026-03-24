import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminFormFieldProps = {
  label: string;
  helpText?: string;
  className?: string;
  children: ReactNode;
};

/**
 * WHY:   Admin forms need a reusable field wrapper so labels, help text, and spacing stay consistent.
 * WHAT:  Renders one labeled field block around native controls.
 * HOW:   Applies simple vertical spacing and leaves the control rendering to the caller.
 */
export default function AdminFormField({ label, helpText, className, children }: AdminFormFieldProps) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {helpText ? <span className="text-xs leading-5 text-slate-500">{helpText}</span> : null}
    </label>
  );
}
