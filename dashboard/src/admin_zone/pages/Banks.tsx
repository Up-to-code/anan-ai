import { Link } from "react-router-dom";
import { useAdminListBanks } from "@/admin_zone/api/useAdminBanks";
import { Button } from "@/public_zone/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/public_zone/ui/table";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function Banks() {
  const { banks, isLoading } = useAdminListBanks();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Banks</h1>
        <Button asChild>
          <Link to="/admin/banks/create">Add</Link>
        </Button>
      </div>
      {isLoading || !banks ? (
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
              {banks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No banks yet
                  </TableCell>
                </TableRow>
              ) : (
                banks.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{b.status ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/banks/${b._id}`}>View</Link>
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
