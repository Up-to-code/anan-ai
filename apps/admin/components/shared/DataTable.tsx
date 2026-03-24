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
    <div className={cn("overflow-x-auto rounded-[8px] border border-border bg-white", className)}>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-slate-50">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
