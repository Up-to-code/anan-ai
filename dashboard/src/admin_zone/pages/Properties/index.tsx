import { Link } from "react-router-dom";
import { useAdminListProperties } from "@/admin_zone/api/useAdminProperties";
import { Button } from "@/public_zone/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public_zone/ui/table";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

/**
 * WHY:   Provides the master list view for all properties within the Admin Zone.
 * WHAT:  Renders a table mapping over a paginated list of properties fetched from the backend.
 * HOW:   Acts as the Orchestrator. Relies on `useAdminListProperties` for data fetching and state.
 */
export default function Properties() {
  const { properties: results, status, loadMore } = useAdminListProperties();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <Button asChild>
          <Link to="/admin/properties/create">Add</Link>
        </Button>
      </div>
      {status === "LoadingFirstPage" ? (
        <Skeleton className="h-[300px] w-full" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No properties yet
                  </TableCell>
                </TableRow>
              ) : (
                results.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.address}</TableCell>
                    <TableCell>{p.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.status ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/properties/${p._id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {status === "CanLoadMore" && (
        <Button onClick={() => loadMore(20)}>Load more</Button>
      )}
    </div>
  );
}
