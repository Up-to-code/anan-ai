import { useREDOverview } from "@/red_zone/api/useREDData";
import { Skeleton } from "@/public_zone/ui/skeleton";
import { MetricCard } from "@/admin_zone/components/MetricCard";
import { DashboardChart } from "@/shared_logic/general/components/DashboardChart";
import { Button } from "@/public_zone/ui/button";
import { MoreHorizontal, TrendingUp, ArrowLeft } from "lucide-react";

/**
 * WHY:   Provides the main landing dashboard for Real Estate Developers (RED).
 * WHAT:  Displays high-level metrics (active projects, broker interest) and recent project activity.
 * HOW:   Designed as an Orchestrator. Relies on `useREDOverview` for data and delegates to `MetricCard` for UI.
 */
export default function DeveloperOverview() {
  const { stats } = useREDOverview();

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
          <h2 className="text-xl font-bold tracking-tight text-slate-900 text-right w-full">نظرة عامة على المحفظة</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full text-[13px] h-9 px-4">
              هذا العام <span className="ml-1 opacity-50">▼</span>
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-3 border border-border/40 rounded-2xl overflow-hidden divide-x divide-x-reverse divide-border/40 shadow-sm bg-white">
          <MetricCard
            title="المشاريع المدارة"
            value={stats.properties}
            info="إجمالي المشاريع العقارية تحت إدارتك حالياً"
            className="border-none rounded-none text-right"
          />
          <MetricCard
            title="شبكة الوسطاء"
            value="٤٢"
            info="عدد الوسطاء النشطين في تسويق مشاريعك"
            className="border-none rounded-none text-right"
          />
          <MetricCard
            title="اهتمام المستثمرين"
            value="٨٩"
            info="عدد المستثمرين الذين أبدوا اهتماماً بمشاريعك"
            className="border-none rounded-none text-right"
          />
        </div>

        <div className="mt-8 bg-white p-6 rounded-2xl border border-border/40 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">توقعات العائد الاستثماري</span>
            </div>
            <h3 className="font-bold">تحليلات النمو</h3>
          </div>
          <DashboardChart />
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Project Activity Stream */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400 text-right w-full">نشاط المشاريع</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: "الملقا ريزيدنس", status: "تم بيع ٨٠٪", progress: 80, color: "bg-orange-500" },
              { title: "برج فيجن - جدة", status: "تحت الإنشاء", progress: 35, color: "bg-blue-500" }
            ].map((project, i) => (
              <div key={i} className="group p-6 bg-white border border-border/40 rounded-2xl space-y-4 hover:shadow-xl transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded uppercase">{project.status}</span>
                  <h4 className="font-bold text-lg">{project.title}</h4>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${project.color} transition-all duration-1000`} style={{ width: `${project.progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>إجمالي الوحدات: ٤٥٠</span>
                  <span>نسبة الإنجاز: {project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market Insights */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400 text-right w-full">رؤى السوق الذكية</h3>
          </div>
          <div className="border border-border/40 rounded-2xl bg-slate-900 p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -top-12 -left-12 h-48 w-48 bg-orange-500/20 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-end gap-3 text-right">
                <div>
                  <h4 className="font-bold text-orange-400">طلب متزايد في شمال الرياض</h4>
                  <p className="text-xs text-slate-400 mt-1">توقع ارتفاع الأسعار بنسبة ١٢٪ للربع القادم</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed text-right">
                اكتشف الذكاء الاصطناعي زيادة بنسبة ١٥٪ في طلبات الفلل المكونة من ٣ غرف في منطقة شمال شرق الرياض. نقترح إعطاء الأولوية لهذه المشاريع في خطتكم القادمة.
              </p>

              <Button className="w-full bg-white text-slate-950 font-bold rounded-2xl py-6 hover:bg-slate-100 border-none group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span>عرض مراجعة السوق الكاملة</span>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
