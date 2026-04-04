import DonutBreakdownChart from "@/components/shared/DonutBreakdownChart";
import MetricBarChart from "@/components/shared/MetricBarChart";
import SectionScaffold from "@/components/shared/SectionScaffold";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { analyticsTabs } from "@/lib/adminSectionTabs";
import {
  overviewOfferQueueMix,
  overviewPartnerMix,
  overviewUserRoleDistribution,
  overviewVerificationPressure,
} from "@/admin_zone/mocks/data";

/**
 * WHY:   Command-center users need a dedicated analytics surface separate from the overview headline dashboard.
 * WHAT:  Renders partner, verification, user-role, and offer-status analytics from the mock admin dataset.
 * HOW:   Reuses the standardized admin chart primitives so this page matches the command-center visual system.
 */
export default function AnalyticsPage() {
  return (
    <SectionScaffold
      eyebrow="مركز القيادة"
      title="التحليلات"
      description="قراءة تشغيلية مركزة على الشركاء، حالات التوثيق، توزيع الأدوار، وحالة مراجعة العروض."
      tabs={analyticsTabs}
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <WorkspacePanel className="rounded-[32px] p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">توزيع الشركاء</h2>
            <p className="text-sm font-bold text-muted-foreground/70">المنظمات النشطة حسب النوع داخل بيانات الأدمن التجريبية.</p>
          </div>
          <DonutBreakdownChart data={overviewPartnerMix} height={260} />
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[32px] p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">ضغط التوثيق</h2>
            <p className="text-sm font-bold text-muted-foreground/70">أين تتكدس مراجعات التوثيق داخل عمليات الشركاء.</p>
          </div>
          <MetricBarChart
            data={overviewVerificationPressure}
            series={[{ dataKey: "count", label: "الحالات", color: "#2563EB" }]}
            horizontal
            height={260}
          />
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[32px] p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">توزيع الأدوار</h2>
            <p className="text-sm font-bold text-muted-foreground/70">من يستخدم الإدارة والسطوح المرتبطة بها داخل البيانات الحالية.</p>
          </div>
          <MetricBarChart
            data={overviewUserRoleDistribution}
            series={[{ dataKey: "count", label: "المستخدمون", color: "#0F766E" }]}
            horizontal
            height={260}
          />
        </WorkspacePanel>

        <WorkspacePanel className="rounded-[32px] p-8">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">حالة العروض</h2>
            <p className="text-sm font-bold text-muted-foreground/70">توزيع العروض بين الاعتماد، الانتظار، والرفض.</p>
          </div>
          <DonutBreakdownChart data={overviewOfferQueueMix} height={260} />
        </WorkspacePanel>
      </div>
    </SectionScaffold>
  );
}
