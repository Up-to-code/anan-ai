import { useAdminOverview } from "@/admin_zone/api/useAdminOverview";
import { Skeleton } from "@/public_zone/ui/skeleton";
import { MetricCard } from "@/admin_zone/components/MetricCard";
import { DashboardChart } from "@/shared_logic/general/components/DashboardChart";
import { Button } from "@/public_zone/ui/button";
import { MoreHorizontal, Play, Youtube } from "lucide-react";

export default function Overview() {
  const { stats, isLoading } = useAdminOverview();

  if (isLoading || !stats) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold tracking-tight">Overview</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-md text-[13px] h-9">
              7 days <span className="ml-1 opacity-50">▼</span>
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-md">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-3 border border-border/40 rounded-xl overflow-hidden divide-x divide-border/40">
          <MetricCard
            title="Gross annualized revenue"
            value="-"
            info="The estimated annual revenue based on current subscriptions"
            className="border-none rounded-none"
          />
          <MetricCard
            title="Paid subscribers"
            value={stats.users}
            info="Total number of users with active paid plans"
            className="border-none rounded-none"
          />
          <MetricCard
            title="Total subscribers"
            value={stats.users + 9}
            info="Total number of users (free + paid)"
            className="border-none rounded-none"
          />
        </div>

        <DashboardChart />
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80">Latest post</h3>
            <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">View stats</Button>
          </div>
          <div className="border border-border/40 rounded-xl p-4 bg-white flex items-center gap-4">
            <div className="h-16 w-24 bg-gradient-to-br from-pink-400 to-orange-300 rounded overflow-hidden flex items-center justify-center relative group cursor-pointer">
              <Play className="h-6 w-6 text-white fill-white opacity-90 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">Afternoon chillin'</h4>
              <p className="text-xs text-muted-foreground mt-0.5">12:11 PM • Sam Lee</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] text-muted-foreground">♡ 0</span>
                <span className="text-[11px] text-muted-foreground">💬 0</span>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Paid</span>
              </div>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </div>
          <div className="border border-border/40 rounded-xl p-4 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-red-600 rounded flex items-center justify-center">
                <Youtube className="h-3 w-3 text-white fill-white" />
              </div>
              <span className="text-sm font-medium">Connect YouTube to increase traffic</span>
            </div>
            <Button variant="link" className="text-xs text-foreground font-semibold p-0 h-auto">Connect ↗</Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground/80">Drafts</h3>
            <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">View all</Button>
          </div>
          <div className="space-y-0 border border-border/40 rounded-xl bg-white divide-y divide-border/40 overflow-hidden">
            {[
              { title: "[COPY] A Day in My Life as a Designer", date: "Edited Feb 5, 12:13 PM" },
              { title: "Untitled", date: "Edited Feb 4, 1:18 PM" },
              { title: "Live with Sam Lee", date: "Edited Feb 1, 9:02 PM" }
            ].map((draft, i) => (
              <div key={i} className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors cursor-pointer">
                <div>
                  <h4 className="text-sm font-bold">{draft.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{draft.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase border border-border/60 px-1.5 py-0.5 rounded tracking-tighter">Draft</span>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
