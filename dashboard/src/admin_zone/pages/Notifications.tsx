import { useAdminNotifications } from "@/admin_zone/api/useAdminMisc";
import { Card, CardContent, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { ScrollArea } from "@/public_zone/ui/scroll-area";
import { Badge } from "@/public_zone/ui/badge";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function Notifications() {
  const { notifications } = useAdminNotifications(50);

  if (!notifications) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
          <CardDescription>Order updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {notifications.length === 0 ? (
                <p className="text-muted-foreground py-4 text-sm">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={String(n.id)}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {n.type}
                      </Badge>
                      <p className="text-sm">Order {n.status}</p>
                      <p className="text-muted-foreground text-xs">
                        User: {n.userId} · {n.createdAt ? new Date(n.createdAt * 1000).toLocaleString() : "—"}
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
