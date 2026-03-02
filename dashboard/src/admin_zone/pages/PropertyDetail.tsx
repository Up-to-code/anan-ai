import { useParams, Link } from "react-router-dom";
import { useAdminGetProperty } from "@/admin_zone/api/useAdminProperties";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/public_zone/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Button } from "@/public_zone/ui/button";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { property, isLoading } = useAdminGetProperty(id);

  if (!id) return <p className="text-muted-foreground">No property selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!property) return <p className="text-muted-foreground">Property not found</p>;

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/properties">Properties</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{property.title}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{property.title}</CardTitle>
          <Button variant="outline" asChild><Link to={`/admin/properties/${id}/edit`}>Edit</Link></Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{property.address}</p>
          <p>Price: {property.price.toLocaleString()}</p>
          <p>Beds: {property.beds} · Baths: {property.baths}</p>
          <Badge variant="outline">{property.status ?? "—"}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
