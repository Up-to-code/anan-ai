import { Link } from "react-router-dom";
import { useAdminListPartners } from "@/admin_zone/api/useAdminPartners";
import { Button } from "@/public_zone/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public_zone/ui/table";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function Partners() {
  const { partners, isLoading } = useAdminListPartners();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Partners</h1>
        <Button asChild>
          <Link to="/admin/partners/create">Add</Link>
        </Button>
      </div>
      {isLoading || !partners ? (
        <Skeleton className="h-[300px] w-full" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No partners yet
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.status ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/partners/${p._id}`}>View</Link>
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
