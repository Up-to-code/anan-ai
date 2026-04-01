"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
import PropertyCard from "../../../_components/Visuals/PropertyCard";
import type { WorkspaceProject } from "../projectTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
import { AgDeleteConfirmModal } from "@/app/(ws)/ws/public";

type ProjectsWorkspaceProps = {
  initialProjects: WorkspaceProject[];
  onDeleteProject?: (projectId: string) => Promise<void>;
  onPublishProject?: (projectId: string) => Promise<void>;
};

/**
 * WHY:   Projects should only expose controls that are backed by persisted property actions.
 * WHAT:  Renders the real project portfolio using the shared PropertyCard primitive.
 * HOW:   Keeps filtering client-side, then refreshes from the server after each supported mutation.
 */
export default function ProjectsWorkspace({
  initialProjects,
  onDeleteProject,
  onPublishProject,
}: ProjectsWorkspaceProps) {
  const router = useRouter();
  const { dictionary } = useWebLocale();
  const [projects, setProjects] = useState(initialProjects);
  const [filterKey, setFilterKey] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceProject | null>(null);
  const [isPending, startTransition] = useTransition();

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
            <PropertyCard
              key={project.id}
              image={project.image}
              title={project.title}
              location={project.location}
              priceLabel={project.priceLabel}
              summary={project.summary}
              specs={[
                { label: dictionary.projects.rooms, value: project.specs.rooms },
                { label: dictionary.projects.baths, value: project.specs.baths },
                { label: dictionary.projects.area, value: project.specs.area },
              ]}
              density="flexible"
              footer={
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!onDeleteProject || isPending}
                      onClick={() => setDeleteTarget(project)}
                      className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/ws/projects/${project.id}/edit`}
                      className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground transition hover:border-foreground/30 hover:text-foreground shadow-sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {project.publicationState === "draft" && onPublishProject ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(() => {
                            void onPublishProject(project.id).then(() => {
                              setProjects((current) =>
                                current.map((entry) =>
                                  entry.id === project.id ? { ...entry, publicationState: "published" } : entry,
                                ),
                              );
                              router.refresh();
                            });
                          })
                        }
                        className="rounded-xl border border-border bg-foreground px-4 py-2 text-[12px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-50 shadow-sm"
                      >
                        {dictionary.projects.publish}
                      </button>
                    ) : null}
                  </div>
                  <Link
                    href={`/ws/projects/${project.id}`}
                    className="rounded-xl border border-border bg-card px-4 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted shadow-sm"
                  >
                    {dictionary.projects.openProject}
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      </div>

      <AgDeleteConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget || !onDeleteProject) return;
          startTransition(() => {
            void onDeleteProject(deleteTarget.id).then(() => {
              setProjects((current) => current.filter((entry) => entry.id !== deleteTarget.id));
              setDeleteTarget(null);
              router.refresh();
            });
          });
        }}
        title={`${dictionary.projects.deleteTitle}: ${deleteTarget?.title ?? ""}`}
        description={dictionary.projects.deleteDescription}
        confirmLabel={dictionary.projects.deleteConfirm}
      />
    </div>
  );
}
