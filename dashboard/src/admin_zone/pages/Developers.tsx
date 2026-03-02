import { useAdminDevTools } from "@/admin_zone/api/useAdminMisc";
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public_zone/ui/table";
import { Badge } from "@/public_zone/ui/badge";
import { ScrollArea } from "@/public_zone/ui/scroll-area";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function Developers() {
  const { logs, errorRate } = useAdminDevTools(50, "week");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dev Tools</h1>
      <p className="text-muted-foreground text-sm">Development mode — logs and error metrics.</p>

      {!errorRate ? (
        <Skeleton className="h-20 w-48" />
      ) : (
        <div className="flex gap-4">
          <Card className="w-48">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total (week)</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{errorRate.total}</span>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="destructive">{errorRate.errors}</Badge>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Error rate</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {(errorRate.rate * 100).toFixed(1)}%
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent error logs</CardTitle>
          <CardDescription>Search logs with failures</CardDescription>
        </CardHeader>
        <CardContent>
          {!logs ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No error logs
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((l) => (
                      <TableRow key={l._id}>
                        <TableCell className="max-w-[200px] truncate">{l.query ?? "—"}</TableCell>
                        <TableCell>{l.userId ?? "—"}</TableCell>
                        <TableCell>{l.stage ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={l.status === "failed" ? "destructive" : "outline"}>
                            {l.status ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-destructive">
                          {l.errorMessage ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
