import { useParams, Link } from "react-router-dom";
import { useAdminGetKnowledge } from "@/admin_zone/api/useAdminKnowledge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/public_zone/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Button } from "@/public_zone/ui/button";
import { Badge } from "@/public_zone/ui/badge";
import { ScrollArea } from "@/public_zone/ui/scroll-area";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const { page, isLoading } = useAdminGetKnowledge(id);

  if (!id) return <p className="text-muted-foreground">No page selected</p>;
  if (isLoading) return <Skeleton className="h-[200px] w-full" />;
  if (!page) return <p className="text-muted-foreground">Knowledge page not found</p>;

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/knowledge">Knowledge</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{page.title}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{page.title}</CardTitle>
          <Button variant="outline" asChild><Link to={`/admin/knowledge/${id}/edit`}>Edit</Link></Button>
        </CardHeader>
        <CardContent>
          <Badge variant="outline" className="mb-2">{page.category ?? "—"}</Badge>
          <ScrollArea className="h-[300px]">
            <pre className="text-sm whitespace-pre-wrap">{page.content}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
