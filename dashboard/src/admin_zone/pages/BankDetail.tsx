import { useParams, Link } from "react-router-dom";
import { useAdminGetBank } from "@/admin_zone/api/useAdminBanks";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/public_zone/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Button } from "@/public_zone/ui/button";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function BankDetail() {
  const { id } = useParams<{ id: string }>();
  const { bank, isLoading } = useAdminGetBank(id);

  if (!id) return <p className="text-muted-foreground">No bank selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!bank) return <p className="text-muted-foreground">Bank not found</p>;

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/banks">Banks</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{bank.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{bank.name}</CardTitle>
            <Badge variant="outline" className="mt-2">{bank.status ?? "—"}</Badge>
          </div>
          <Button variant="outline" asChild>
            <Link to={`/admin/banks/${id}/edit`}>Edit</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p>{bank.contactEmail}</p>
          <p className="text-muted-foreground">{bank.description ?? "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
