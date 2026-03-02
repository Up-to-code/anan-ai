import { useAdminPipeline } from "@/admin_zone/api/useAdminMisc";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public_zone/ui/table";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

const STAGES = [
  "new_lead",
  "contacted",
  "qualified",
  "offer_made",
  "under_contract",
  "closed_won",
  "closed_lost",
] as const;

/**
 * WHY:   Provides the master view of all sales and request orders passing through the system.
 * WHAT:  Renders a table of orders, grouped and counted by their current pipeline stage.
 * HOW:   Acts as the Orchestrator. Uses `useAdminPipeline` to fetch all current orders.
 */
export default function Pipeline() {
  const { orders } = useAdminPipeline();

  if (!orders) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const byStage = STAGES.map((s) => ({
    stage: s,
    count: orders.filter((o) => o.status === s).length,
    items: orders.filter((o) => o.status === s),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pipeline</h1>
      <div className="flex gap-2 flex-wrap">
        {byStage.map(({ stage, count }) => (
          <Badge key={stage} variant="outline" className="px-3 py-1">
            {stage.replace(/_/g, " ")}: {count}
          </Badge>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Pipeline orders by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Channel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No orders yet
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o._id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link to={`/admin/pipeline/${o._id}`} className="block">
                          {o.userId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/admin/pipeline/${o._id}`} className="block">
                          {o.type}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/admin/pipeline/${o._id}`} className="block">
                          <Badge variant="outline">{o.status}</Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/admin/pipeline/${o._id}`} className="block">
                          {o.sourceChannel ?? "—"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
