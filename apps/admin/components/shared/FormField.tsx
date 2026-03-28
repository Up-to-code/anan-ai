import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
  className?: string;
  labelClassName?: string;
};

/**
 * WHY:   The admin CRUD surfaces should share one consistent field label and hint pattern.
 * WHAT:  Wraps form controls with institutional labels and optional helper text.
 * HOW:   Leaves the actual control implementation to callers while standardizing spacing and typography.
 */
export default function FormField({ label, htmlFor, children, hint, className, labelClassName }: FormFieldProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <label 
        htmlFor={htmlFor} 
        className={cn("block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50", labelClassName)}
      >
        {label}
      </label>
      <div className="relative group">
        {children}
      </div>
      {hint ? (
        <p className="text-[11px] font-bold text-muted-foreground/40 leading-relaxed italic">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
