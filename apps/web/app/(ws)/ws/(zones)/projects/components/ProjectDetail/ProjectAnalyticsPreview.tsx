"use client";

import Link from "next/link";
import { BarChart3, CheckCircle2, Eye, Rows3 } from "lucide-react";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";
import type { ProjectMutationActionResult } from "../../pages/ProjectsPage/actionTypes";
import type { WorkspaceProject } from "../../types/projectTypes";

export default function ProjectAnalyticsPreview({
  project,
  onTrackProjectEvent,
}: {
  project: WorkspaceProject;
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<ProjectMutationActionResult>;
}) {
  const signals = [
    { label: "حالة الظهور", value: project.visibility.clientVisibility === "public" ? "عام" : "خاص", icon: Eye },
    { label: "جاهزية النشر", value: project.readiness.label, icon: CheckCircle2 },
    { label: "المخزون", value: project.portfolio.unitSummary, icon: Rows3 },
  ];

  return (
    <section data-slot="project-detail-analytics" className="space-y-6 text-right">
      <div className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pb-4">
        <h2 className="text-2xl font-black tracking-normal text-foreground">تحليلات المشروع</h2>
        <p className="mt-2 text-[13px] font-semibold leading-7 text-muted-foreground">
          نظرة تشغيلية سريعة لهذا المشروع فقط. افتح التحليلات الكاملة لقراءة المشاهدات، التفاعل، وحركة الوسطاء.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div key={signal.label} className="rounded-lg border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4">
              <div className="flex justify-end text-[var(--workspace-muted)]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-[12px] font-black text-[var(--workspace-muted)]">{signal.label}</div>
              <div className="mt-1 text-[17px] font-black text-foreground">{signal.value}</div>
            </div>
          );
        })}
      </div>
      <Link
        href={`/ws/projects/${project.id}/analytics`}
        onClick={() => {
          void onTrackProjectEvent?.({ eventType: "project_analyze_click", source: "project_detail_analytics_tab" });
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-[13px] font-black text-background transition hover:opacity-90"
      >
        <BarChart3 className="h-4 w-4" />
        فتح التحليلات الكاملة
      </Link>
    </section>
  );
}
