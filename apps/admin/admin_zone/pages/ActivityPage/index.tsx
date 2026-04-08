import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { activityTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";
import { queueItems, recentActivities } from "@/admin_zone/mocks/data";

/**
 * WHY:   Operations teams need a dedicated activity surface when they want a feed-first view instead of the overview dashboard.
 * WHAT:  Renders the recent activity stream plus the current operational queue cards.
 * HOW:   Uses the same mock activity and queue datasets already powering the overview to keep surfaces aligned.
 */
export default function ActivityPage() {
  return (
    <SectionScaffold
      eyebrow="مركز القيادة"
      title="سجل النشاط"
      description="تغذية تشغيلية مخصصة للأنشطة الأخيرة وما يجب متابعته داخل طوابير العمل الحالية."
      tabs={activityTabs}
      layout="dashboard"
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <WorkspacePanel
          density="hero"
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">الأنشطة الأخيرة</h2>
              <p className="text-sm font-bold text-muted-foreground/70">آخر الإشارات التي تحتاج انتباهًا من فريق الإدارة.</p>
            </div>
          }
        >
          <div className="grid gap-4">
            {recentActivities.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-border/30 bg-muted/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-base font-black tracking-tight text-foreground">{item.title}</div>
                    <div className="text-sm font-bold text-muted-foreground/70">{item.subtitle}</div>
                    <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground/50">
                      {formatDateTime(item.createdAt)}
                    </div>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          density="compact"
          header={
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">الطوابير المفتوحة</h2>
              <p className="text-sm font-bold text-muted-foreground/70">البنود التي تحتاج متابعة سريعة داخل عمليات الشركاء.</p>
            </div>
          }
        >
          <div className="grid gap-4">
            {queueItems.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-border/30 bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-base font-black tracking-tight text-foreground">{item.label}</div>
                    <div className="text-sm font-bold text-muted-foreground/70">{item.note}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black tabular-nums text-foreground">{item.count}</div>
                    <div className="mt-2 flex justify-end">
                      <StatusBadge value={item.status} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </SectionScaffold>
  );
}
