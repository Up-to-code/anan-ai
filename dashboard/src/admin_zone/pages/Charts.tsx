import { useAdminCharts } from "@/admin_zone/api/useAdminMisc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/public_zone/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public_zone/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/public_zone/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/public_zone/ui/skeleton";

export default function Charts() {
  const { searchActivity, channelDist } = useAdminCharts("week");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Charts</h1>
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Search Activity</TabsTrigger>
          <TabsTrigger value="channels">Channel Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Search activity</CardTitle>
              <CardDescription>Success vs failed over time</CardDescription>
            </CardHeader>
            <CardContent>
              {!searchActivity ? (
                <Skeleton className="h-[300px] w-full" />
              ) : searchActivity.labels.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No data yet</p>
              ) : (
                <ChartContainer
                  config={{
                    success: { color: "hsl(var(--chart-1))" },
                    failed: { color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={searchActivity.labels.map((l, i) => ({
                    label: l,
                    success: searchActivity.successSeries[i] ?? 0,
                    failed: searchActivity.failedSeries[i] ?? 0,
                  }))}>
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="success" fill="var(--color-success)" name="Success" />
                    <Bar dataKey="failed" fill="var(--color-failed)" name="Failed" />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>Channel distribution</CardTitle>
              <CardDescription>Requests by channel</CardDescription>
            </CardHeader>
            <CardContent>
              {!channelDist ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <div className="flex gap-4">
                  <div className="rounded border p-4">
                    <div className="text-2xl font-bold">{channelDist.whatsapp}</div>
                    <div className="text-muted-foreground text-sm">WhatsApp</div>
                  </div>
                  <div className="rounded border p-4">
                    <div className="text-2xl font-bold">{channelDist.app}</div>
                    <div className="text-muted-foreground text-sm">App</div>
                  </div>
                  <div className="rounded border p-4">
                    <div className="text-2xl font-bold">{channelDist.web}</div>
                    <div className="text-muted-foreground text-sm">Web</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
