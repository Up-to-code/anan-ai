import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
  className?: string;
};

/**
 * WHY:   Most admin pages render dense tabular data and should share one consistent table frame.
 * WHAT:  Wraps a semantic table with the admin border, spacing, and heading styles.
 * HOW:   Accepts column headers and row content while keeping the layout fully composable.
 */
export default function DataTable({ headers, children, className }: DataTableProps) {
  return (
    <div className={cn("overflow-x-auto border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm", className)}>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200/60 bg-slate-50/50">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-[0.22em] text-slate-500"
              >
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
