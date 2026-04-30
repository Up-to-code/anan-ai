"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";
import type { ProjectMutationActionResult } from "../../pages/ProjectsPage/actionTypes";
import type { ProjectDetailMode } from "../../shared/lib/projectUi";
import { formatProjectHeaderTitle } from "../../shared/lib/projectUi";
import type { WorkspaceProject } from "../../types/projectTypes";
import ProjectActionsMenu from "./ProjectActionsMenu";
import ProjectDetailTabs from "./ProjectDetailTabs";

type ProjectDetailHeaderProps = {
  project: WorkspaceProject;
  activeMode: ProjectDetailMode;
  modes: ProjectDetailMode[];
  isPending: boolean;
  onPublish?: () => void;
  onDelete?: () => void;
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<ProjectMutationActionResult>;
};

export default function ProjectDetailHeader({
  project,
  activeMode,
  modes,
  isPending,
  onPublish,
  onDelete,
  onTrackProjectEvent,
}: ProjectDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-[color:var(--workspace-border)] bg-background/90 backdrop-blur-2xl">
      <div
        className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[minmax(260px,0.9fr)_minmax(320px,1fr)_44px] lg:items-center lg:gap-4 lg:px-8"
        dir="rtl"
        data-slot="project-detail-topbar"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 lg:justify-start">
          <Link
            href="/ws/projects"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-elevated)] hover:text-foreground"
            aria-label="العودة للمشاريع"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="min-w-0 text-right">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--workspace-muted)]">المشروع</div>
            <div title={project.title} className="mt-1 truncate text-[14px] font-black leading-5 text-foreground">
              {formatProjectHeaderTitle(project.title)}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 justify-start lg:justify-center">
          <ProjectDetailTabs activeMode={activeMode} projectId={project.id} modes={modes} />
        </div>

        <div className="absolute left-4 top-3 sm:left-6 lg:static lg:flex lg:justify-end">
          <ProjectActionsMenu
            project={project}
            isPending={isPending}
            onPublish={onPublish}
            onDelete={onDelete}
            onTrackProjectEvent={onTrackProjectEvent}
          />
        </div>
      </div>
    </div>
  );
}
