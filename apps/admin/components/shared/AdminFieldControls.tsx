import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  className?: string;
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

/**
 * WHY:   The rewritten admin needs a single calm form-control style across filters, settings, and review flows.
 * WHAT:  Exports input, select, and textarea primitives with the same border, focus, and spacing rules.
 * HOW:   Wraps native controls so the mocked UI stays lightweight and consistent without introducing extra dependencies.
 */
export function AdminInput({ className, ...props }: FieldProps) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-border/40 bg-muted/5 px-4 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-card",
        className,
      )}
    />
  );
}

/**
 * WHY:   Filter bars and settings panels repeatedly need a consistent selection control.
 * WHAT:  Renders a native select using the admin input visual system.
 * HOW:   Reuses the same neutral classes as text inputs to keep every toolbar aligned.
 */
export function AdminSelect({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-border/40 bg-muted/5 px-4 text-sm font-bold text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-card appearance-none",
        className,
      )}
    >
      {children}
    </select>
  );
}

/**
 * WHY:   Mock review flows and settings editing need a larger text field without inventing page-local styles.
 * WHAT:  Renders a textarea matching the rewritten input family.
 * HOW:   Keeps padding, radius, and focus behavior aligned with the rest of the admin form surface.
 */
export function AdminTextarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-xl border border-border/40 bg-muted/5 px-4 py-3 text-sm font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:bg-card",
        className,
      )}
    />
  );
}
