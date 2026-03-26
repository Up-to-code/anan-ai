import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
  className?: string;
};

/**
 * WHY:   Admin pages render dense operational tables and should share one clean, modern table frame.
 * WHAT:  Wraps a semantic table with the rebuilt admin border, header, and spacing styles.
 * HOW:   Accepts header labels and arbitrary row content while keeping the outer treatment consistent.
 */
export default function DataTable({ headers, children, className }: DataTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-3xl border border-border/40 bg-card shadow-sm", className)}>
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr className="bg-muted/5">
            {headers.map((header) => (
              <th key={header} className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 border-b border-border/20">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">{children}</tbody>
      </table>
    </div>
  );
}
