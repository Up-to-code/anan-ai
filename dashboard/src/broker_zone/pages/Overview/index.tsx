import { useBrokerOverview } from "@/broker_zone/api/useBrokerData";
import { Skeleton } from "@/public_zone/ui/skeleton";
import { MetricCard } from "@/admin_zone/components/MetricCard";
import { DashboardChart } from "@/shared_logic/general/components/DashboardChart";
import { Button } from "@/public_zone/ui/button";
import { MoreHorizontal, MessageSquare } from "lucide-react";

/**
 * WHY:   Acts as the main landing dashboard for brokers, providing a quick summary of their performance.
 * WHAT:  Displays key metrics (properties, leads, active matches) and recent activity logs.
 * HOW:   Designed as an Orchestrator. Relies on `useBrokerOverview` for data and delegates to `MetricCard` for UI.
 */
export default function BrokerOverview() {
  const { stats } = useBrokerOverview();

  if (!stats) {
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
          <h2 className="text-xl font-bold tracking-tight text-slate-900 text-right w-full">نظرة عامة على السوق</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full text-[13px] h-9 px-4">
              آخر ٣٠ يوم <span className="ml-1 opacity-50">▼</span>
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-3 border border-border/40 rounded-2xl overflow-hidden divide-x divide-x-reverse divide-border/40 shadow-sm bg-white">
          <MetricCard
            title="العقارات النشطة"
            value={stats.properties}
            info="إجمالي العقارات المدرجة حالياً في حسابك"
            className="border-none rounded-none text-right"
          />
          <MetricCard
            title="مطابقات ذكية"
            value="١٤"
            info="مطابقات تم اكتشافها بواسطة الذكاء الاصطناعي مع مشترين نشطين"
            className="border-none rounded-none text-right"
          />
          <MetricCard
            title="تفاعل العملاء"
            value="١٢٨"
            info="إجمالي عدد التفاعلات مع عقاراتك خلال الساعات الماضية"
            className="border-none rounded-none text-right"
          />
        </div>

        <div className="mt-8 bg-white p-6 rounded-2xl border border-border/40 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">معدل النمو اللحظي</span>
            </div>
            <h3 className="font-bold">تحليلات الأداء</h3>
          </div>
          <DashboardChart />
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Live Matches Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400 text-right w-full">مطابقات ذكية فورية</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: "فيلا شمال الرياض", match: "٩٨٪", client: "إبراهيم س.", time: "منذ دقيقتين" },
              { title: "شقة حي الملقا", match: "٩٢٪", client: "سارة م.", time: "منذ ساعة" }
            ].map((match, i) => (
              <div key={i} className="group p-5 bg-white border border-border/40 rounded-2xl flex items-center gap-4 hover:border-blue-600/20 hover:shadow-lg transition-all cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {match.match}
                </div>
                <div className="flex-1 text-right">
                  <h4 className="font-bold text-sm tracking-tight">{match.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">متطابقة مع طلب العميل: {match.client}</p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{match.time}</div>
              </div>
            ))}
            <Button variant="ghost" className="w-full rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs py-8 hover:bg-slate-50">
              استكشاف جميع المطابقات
            </Button>
          </div>
        </section>

        {/* Latest Activity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400 text-right w-full">آخر النشاطات</h3>
          </div>
          <div className="border border-border/40 rounded-2xl bg-white divide-y divide-border/40 overflow-hidden shadow-sm">
            {[
              { user: "أحمد منصور", msg: "بانتظار معاينة عقار North Riyadh", time: "٢ س" },
              { user: "سارة نورة", msg: "طلبت تفاصيل التمويل البنكي", time: "٥ س" },
              { user: "فهد العتيبي", msg: "تم إرسال عرض سعر جديد", time: "٨ س" }
            ].map((inquiry, i) => (
              <div key={i} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="text-[11px] text-slate-400 font-medium">{inquiry.time}</div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <h4 className="text-sm font-bold">{inquiry.user}</h4>
                    <p className="text-[11px] text-muted-foreground">{inquiry.msg}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center relative">
                    <MessageSquare className="h-5 w-5 text-slate-400" />
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-blue-600 rounded-full border-2 border-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
