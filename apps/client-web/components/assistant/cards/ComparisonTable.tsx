import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonTableProps {
  title: string;
  columns: string[];
  rows: string[][];
  summary: string;
}

export function ComparisonTable({ title, columns, rows, summary }: ComparisonTableProps) {
  return (
    <Card data-testid="client-ag-ui-card-comparison_table" className="my-4 overflow-hidden border-primary/10 shadow-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-widest">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-primary/5">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-3 font-black uppercase tracking-tighter text-muted-foreground whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-muted/20">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summary && (
          <div className="p-4 bg-primary/5 text-[11px] text-primary/80 leading-relaxed italic border-t border-primary/5">
            {summary}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
