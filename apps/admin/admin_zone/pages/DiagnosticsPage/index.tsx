import DonutBreakdownChart from "@/components/shared/DonutBreakdownChart";
import SectionScaffold from "@/components/shared/SectionScaffold";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { diagnosticsTabs } from "@/lib/adminSectionTabs";
import { overviewModelConsumption, queueItems } from "@/admin_zone/mocks/data";
import { formatNumber } from "@/lib/format";

/**
 * WHY:   Admins need a dedicated diagnostics surface for model usage and operational load without mixing it into partner-management pages.
 * WHAT:  Renders a mock diagnostics page covering model consumption and active operational queues.
 * HOW:   Reuses the standardized dashboard mock datasets while presenting them as diagnostic panels.
 */
export default function DiagnosticsPage() {
  return (
    <SectionScaffold
      eyebrow="مركز القيادة"
      title="التشخيص"
      description="مؤشرات تشخيصية تجريبية عن استهلاك النماذج وضغط الطوابير التشغيلية داخل لوحة الأدمن."
      tabs={diagnosticsTabs}
      layout="dashboard"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)]">
        <WorkspacePanel
          density="hero"
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">استهلاك النماذج</h2>
              <p className="text-sm font-bold text-muted-foreground/70">حجم استخدام النماذج داخل العمليات الذكية الحالية.</p>
            </div>
          }
        >
          <DonutBreakdownChart data={overviewModelConsumption} height={280} />
        </WorkspacePanel>

        <WorkspacePanel
          density="compact"
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">نبض الطوابير</h2>
              <p className="text-sm font-bold text-muted-foreground/70">قراءة سريعة لأكثر النقاط التشغيلية ضغطًا.</p>
            </div>
          }
        >
          <div className="grid gap-4">
            {queueItems.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-border/30 bg-muted/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-base font-black tracking-tight text-foreground">{item.label}</div>
                    <div className="text-sm font-bold text-muted-foreground/70">{item.note}</div>
                  </div>
                  <div className="text-2xl font-black tabular-nums text-foreground">{formatNumber(item.count)}</div>
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </SectionScaffold>
  );
}
