"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import FilterChipBar from "../../../../_components/Visuals/FilterChipBar";
import type { WorkspaceProject } from "../../types/projectTypes";
import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";
import type { ProjectMutationActionResult } from "./actionTypes";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";
import ProjectPortfolioCard from "./ProjectPortfolioCard";

type ProjectsWorkspaceProps = {
  initialProjects: WorkspaceProject[];
  onDeleteProject?: (projectId: string) => Promise<ProjectMutationActionResult>;
  onPublishProject?: (projectId: string) => Promise<ProjectMutationActionResult>;
  onTrackProjectEvent?: (input: {
    id: string;
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<{ ok: true }>;
};

/**
 * WHY:   Projects should only expose controls that are backed by persisted property actions.
 * WHAT:  Renders the real project portfolio using the shared PropertyCard primitive.
 * HOW:   Keeps filtering client-side, then refreshes from the server after each supported mutation.
 */
export default function ProjectsWorkspace({
  initialProjects,
  onTrackProjectEvent,
}: ProjectsWorkspaceProps) {
  const { dictionary } = useWebLocale();
  const [projects] = useState(initialProjects);
  const [filterKey, setFilterKey] = useState("all");

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (filterKey === "all") return true;
        if (filterKey === "linked") return project.brokers.some((broker) => broker.state === "client-linked");
        if (filterKey === "idle") return project.brokers.some((broker) => broker.state === "idle");
        if (filterKey === "empty") return project.brokers.length === 0;
        return true;
      }),
    [projects, filterKey],
  );

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow={dictionary.projects.eyebrow}
        title={dictionary.projects.title}
        description={dictionary.projects.description}
        actions={
          <Link
            href="/ws/projects/create"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-bold text-background transition hover:bg-foreground/90 shadow-sm"
          >
            <UploadCloud className="h-4 w-4" />
            {dictionary.projects.create}
          </Link>
        }
      />

      <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
        <FilterChipBar
          chips={[
            { key: "all", label: dictionary.projects.all },
            { key: "linked", label: dictionary.projects.linkedClient },
            { key: "idle", label: dictionary.projects.idleBroker },
            { key: "empty", label: dictionary.projects.noBrokers },
          ]}
          activeKey={filterKey}
          onChange={setFilterKey}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-5 py-4">
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Portfolio</div>
            <div className="mt-1 text-[15px] font-black text-foreground">
              {filteredProjects.length > 0 ? `${filteredProjects.length} بطاقة مشروع` : "لا توجد بطاقات ضمن هذا الفلتر"}
            </div>
          </div>
          <div className="text-right text-[12px] font-semibold leading-6 text-muted-foreground">
            تعرض البطاقات الجاهزية والمخزون والظهور والملفات قبل فتح صفحة المشروع.
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectPortfolioCard
              key={project.id}
              project={project}
              onTrackProjectEvent={onTrackProjectEvent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
