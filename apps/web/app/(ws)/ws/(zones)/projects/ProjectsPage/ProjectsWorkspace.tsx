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
import type { ProjectMutationActionResult } from "./actionTypes";
import { cn } from "@/lib/utils";

type ProjectsWorkspaceProps = {
  initialProjects: WorkspaceProject[];
  onDeleteProject?: (projectId: string) => Promise<ProjectMutationActionResult>;
  onPublishProject?: (projectId: string) => Promise<ProjectMutationActionResult>;
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
  const [actionError, setActionError] = useState<{ code: string; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const verificationSettingsHref = "/ws/settings?tab=verification";
  const showVerificationShortcut =
    actionError?.code === "VERIFICATION_REQUIRED" &&
    actionError.message.toLowerCase().includes("organization verification");

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

  const handleMutationFailure = (result: Extract<ProjectMutationActionResult, { ok: false }>) => {
    setActionError({ code: result.code, message: result.message });
  };

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
        {actionError ? (
          <div
            className={cn(
              "rounded-[24px] border px-5 py-4 shadow-sm",
              actionError.code === "VERIFICATION_REQUIRED"
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : "border-red-200 bg-red-50 text-red-950",
            )}
          >
            <div className="text-sm font-bold">{actionError.message}</div>
            {showVerificationShortcut ? (
              <div className="mt-3">
                <Link
                  href={verificationSettingsHref}
                  className="inline-flex items-center rounded-xl border border-amber-300 bg-white px-3 py-2 text-[12px] font-bold text-amber-900 transition hover:bg-amber-100"
                >
                  {dictionary.settings.verification}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

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
                          startTransition(async () => {
                            setActionError(null);
                            try {
                              const result = await onPublishProject(project.id);
                              if (!result.ok) {
                                handleMutationFailure(result);
                                return;
                              }
                              setProjects((current) =>
                                current.map((entry) =>
                                  entry.id === project.id ? { ...entry, publicationState: "published" } : entry,
                                ),
                              );
                              router.refresh();
                            } catch {
                              setActionError({ code: "INTERNAL_ERROR", message: dictionary.projects.actionFailed });
                            }
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
          startTransition(async () => {
            setActionError(null);
            try {
              const result = await onDeleteProject(deleteTarget.id);
              if (!result.ok) {
                handleMutationFailure(result);
                setDeleteTarget(null);
                return;
              }
              setProjects((current) => current.filter((entry) => entry.id !== deleteTarget.id));
              setDeleteTarget(null);
              router.refresh();
            } catch {
              setActionError({ code: "INTERNAL_ERROR", message: dictionary.projects.actionFailed });
              setDeleteTarget(null);
            }
          });
        }}
        title={`${dictionary.projects.deleteTitle}: ${deleteTarget?.title ?? ""}`}
        description={dictionary.projects.deleteDescription}
        confirmLabel={dictionary.projects.deleteConfirm}
      />
    </div>
  );
}
