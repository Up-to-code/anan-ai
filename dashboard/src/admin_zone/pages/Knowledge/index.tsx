import { Link } from "react-router-dom";
import { useAdminListKnowledge } from "@/admin_zone/api/useAdminKnowledge";
import { Button } from "@/public_zone/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public_zone/ui/table";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

/**
 * WHY:   Provides the master list view of all custom knowledge documents injected into the system's AI.
 * WHAT:  Renders a table mapping over the available knowledge pages (RAG context).
 * HOW:   Acts as the Orchestrator. Relies on `useAdminListKnowledge` to fetch the data.
 */
export default function Knowledge() {
  const { pages } = useAdminListKnowledge();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Knowledge pages</h1>
        <Button asChild>
          <Link to="/admin/knowledge/create">Add</Link>
        </Button>
      </div>
      {!pages ? (
        <Skeleton className="h-[300px] w-full" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No knowledge pages yet
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.category ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/knowledge/${p._id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
