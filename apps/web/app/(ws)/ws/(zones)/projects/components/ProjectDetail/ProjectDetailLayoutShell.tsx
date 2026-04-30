"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AgDeleteConfirmModal } from "@/app/(ws)/ws/public";
import { deleteProjectAction } from "../../actions/deleteProject";
import { publishProjectAction } from "../../actions/publishProject";
import { trackProjectEventAction } from "../../actions/trackProjectEvent";
import {
  getAvailableProjectDetailModes,
  normalizeProjectDetailMode,
  type ProjectDetailMode,
} from "../../shared/lib/projectUi";
import type { WorkspaceProject } from "../../types/projectTypes";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";
import ProjectDetailHeader from "./ProjectDetailHeader";

type ProjectDetailLayoutShellProps = {
  project: WorkspaceProject;
  children: ReactNode;
};

function getProjectDetailModeFromPath(pathname: string, projectId: string): ProjectDetailMode {
  if (pathname === `/ws/projects/${projectId}/units` || pathname.includes(`/ws/projects/${projectId}/units/`)) {
    return "units";
  }
  if (pathname === `/ws/projects/${projectId}/analytics`) {
    return "analytics";
  }
  return "overview";
}

export default function ProjectDetailLayoutShell({
  project,
  children,
}: ProjectDetailLayoutShellProps) {
  const pathname = usePathname();
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const availableModes = getAvailableProjectDetailModes(project);
  const activeMode = normalizeProjectDetailMode(
    getProjectDetailModeFromPath(pathname, project.id),
    availableModes,
  );

  useEffect(() => {
    void trackProjectEventAction({
      propertyId: project.propertyId,
      eventType: "project_detail_view",
      source: "project_detail_layout",
    });
  }, [project.propertyId]);

  const publishProject =
    project.canEdit && project.publicationState === "draft"
      ? () =>
          startTransition(async () => {
            setActionError(null);
            const result = await publishProjectAction(project.propertyId);
            if (!result.ok) {
              setActionError(result.message);
            }
          })
      : undefined;

  const deleteProject =
    project.canEdit
      ? () =>
          startTransition(async () => {
            setActionError(null);
            const result = await deleteProjectAction(project.propertyId);
            if (!result.ok) {
              setActionError(result.message);
              setDeleteOpen(false);
            }
          })
      : undefined;

  const trackProjectEvent = (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) =>
    trackProjectEventAction({
      propertyId: project.propertyId,
      eventType: input.eventType,
      source: input.source,
    });

  return (
    <div className="min-h-full bg-background pb-24">
      <ProjectDetailHeader
        project={project}
        activeMode={activeMode}
        modes={availableModes}
        isPending={isPending}
        onPublish={publishProject}
        onDelete={project.canEdit ? () => setDeleteOpen(true) : undefined}
        onTrackProjectEvent={trackProjectEvent}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:px-8">
        <div className="sr-only">لوحة المشروع</div>

        {actionError ? (
          <div className="rounded-[22px] bg-rose-500/10 px-5 py-4 text-right text-[13px] font-black text-rose-700">
            {actionError}
          </div>
        ) : null}

        {!project.readiness.canPublish ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-right text-[12px] font-black leading-6 text-amber-700 dark:text-amber-300">
            حالة الجاهزية: {project.readiness.label}. لن يظهر المشروع في البحث العام أو قنوات الذكاء الاصطناعي حتى تكتمل متطلبات السوق السعودي.
          </div>
        ) : null}

        {children}
      </main>

      {project.canEdit ? (
        <AgDeleteConfirmModal
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteProject?.()}
          title={`حذف المشروع: ${project.title}`}
          description="سيتم حذف المشروع من مساحة العمل الحالية."
          confirmLabel="حذف المشروع"
        />
      ) : null}
    </div>
  );
}
