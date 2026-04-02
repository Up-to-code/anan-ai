"use client";

import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
import type { WorkspaceProject } from "../projectTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
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

        <div className="grid gap-8 xl:grid-cols-2">
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
