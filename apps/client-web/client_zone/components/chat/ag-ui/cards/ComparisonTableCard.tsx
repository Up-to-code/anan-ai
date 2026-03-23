import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/client_zone/components/ui/card";
import type { ComparisonTableCardProps } from "../types";

/**
 * WHY:   The client assistant needs a readable side-by-side comparison block for shortlist decisions.
 * WHAT:  Renders a compact comparison table using the full thread width.
 * HOW:   Uses a simple responsive overflow container rather than a dashboard-specific table shell.
 */
export function ComparisonTableCard({ title, columns, rows, summary }: ComparisonTableCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {summary ? <CardDescription>{summary}</CardDescription> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 text-start font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className="border-b border-slate-100 last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} className="px-3 py-3 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
