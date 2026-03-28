import { AgUiCardHeading, AgUiCardShell, CardContent, agUiInnerPanelClassName } from "../AgUiCardPrimitives";
import type { ComparisonTableCardProps } from "../types";

/**
 * WHY:   The client assistant needs a readable side-by-side comparison block for shortlist decisions.
 * WHAT:  Renders a compact comparison table using the full thread width.
 * HOW:   Uses a simple responsive overflow container rather than a dashboard-specific table shell.
 */
export function ComparisonTableCard({ title, columns, rows, summary }: ComparisonTableCardProps) {
  return (
    <AgUiCardShell>
      <AgUiCardHeading title={title} summary={summary} />
      <CardContent className="pt-0">
        <div className={`overflow-x-auto ${agUiInnerPanelClassName()}`}>
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[color:var(--workspace-border)] text-[var(--workspace-muted)]">
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-start text-[11px] font-black uppercase tracking-[0.16em]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`} className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_86%,transparent)] last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-[15px] font-medium text-[var(--workspace-bubble-other-foreground)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </CardContent>
    </AgUiCardShell>
  );
}
