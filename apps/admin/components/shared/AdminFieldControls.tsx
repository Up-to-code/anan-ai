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
        "h-10 w-full rounded-[8px] border border-border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500",
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
        "h-10 w-full rounded-[8px] border border-border bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500",
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
        "min-h-28 w-full rounded-[8px] border border-border bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500",
        className,
      )}
    />
  );
}
