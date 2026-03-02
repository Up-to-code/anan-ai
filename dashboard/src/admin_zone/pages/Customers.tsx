import { Link } from "react-router-dom";
import { useAdminCustomers } from "@/admin_zone/api/useAdminCustomers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/public_zone/ui/table";
import { Badge } from "@/public_zone/ui/badge";
import { Avatar, AvatarFallback } from "@/public_zone/ui/avatar";
import { Button } from "@/public_zone/ui/button";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function Customers() {
  const { customers, isLoading } = useAdminCustomers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="text-muted-foreground text-sm">
        Users filtered by WhatsApp channel.
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No customers yet
                </TableCell>
              </TableRow>
            ) : (
              customers.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Link
                      to={`/admin/users/${user.userId}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(user.displayName ?? user.userId).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.displayName ?? user.userId}</div>
                        <div className="text-muted-foreground text-sm">{user.userId}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.channel ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/users/${user.userId}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
