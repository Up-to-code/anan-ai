import { useParams, Link } from "react-router-dom";
import { useAdminGetPartner } from "@/admin_zone/api/useAdminPartners";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/public_zone/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Button } from "@/public_zone/ui/button";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function PartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const { partner, isLoading } = useAdminGetPartner(id);

  if (!id) return <p className="text-muted-foreground">No partner selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!partner) return <p className="text-muted-foreground">Partner not found</p>;

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/partners">Partners</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{partner.name}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{partner.name}</CardTitle>
            <Badge variant="outline" className="mt-2">{partner.status ?? "—"}</Badge>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to={`/admin/properties/create?partnerId=${id}`}>Create property</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/admin/partners/${id}/edit`}>Edit</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{partner.description ?? "—"}</p>
          <p>Properties: {partner.properties?.length ?? 0}</p>
        </CardContent>
      </Card>
    </div>
  );
}
