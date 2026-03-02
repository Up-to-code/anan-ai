import { useAdminActivities } from "@/admin_zone/api/useAdminMisc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { ScrollArea } from "@/public_zone/ui/scroll-area";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function Activities() {
  const { activities } = useAdminActivities(50);

  if (!activities) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Activities</h1>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Activities</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Knowledge research and search logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No activities yet</p>
              ) : (
                activities.map((a) => (
                  <div
                    key={String(a.id)}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {a.type}
                      </Badge>
                      <p className="text-sm">{a.query ?? "—"}</p>
                      <p className="text-muted-foreground text-xs">
                        User: {a.userId ?? "—"} ·{" "}
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
