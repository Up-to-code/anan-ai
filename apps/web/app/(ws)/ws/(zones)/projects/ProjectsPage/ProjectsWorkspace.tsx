"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
import PropertyCard from "../../../_components/Visuals/PropertyCard";
import type { WorkspaceProject } from "../projectTypes";
import ProjectsSummary from "./ProjectsSummary";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
import AgDeleteConfirmModal from "@/components/shared/ag-aui/AgDeleteConfirmModal";

type ProjectsWorkspaceProps = {
  initialProjects: WorkspaceProject[];
  onDeleteProject?: (projectId: string) => Promise<void>;
  onPublishProject?: (projectId: string) => Promise<void>;
};

const publicationLabels: Record<WorkspaceProject["publicationState"], string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

const publicationStyles: Record<WorkspaceProject["publicationState"], string> = {
  published: "border-emerald-100 bg-emerald-50 text-emerald-700",
  draft: "border-amber-100 bg-amber-50 text-amber-700",
  archived: "border-slate-100 bg-slate-50 text-slate-500",
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
  const [projects, setProjects] = useState(initialProjects);
  const [filterKey, setFilterKey] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceProject | null>(null);
  const [isPending, startTransition] = useTransition();

  const summary = useMemo(
    () => ({
      total: projects.length,
      linkedBrokers: projects.reduce((total, project) => total + project.brokers.length, 0),
      activeClients: projects.reduce(
        (total, project) => total + project.brokers.filter((broker) => Boolean(broker.clientName)).length,
        0,
      ),
      archivedCount: projects.filter((project) => project.publicationState === "archived").length,
    }),
    [projects],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (filterKey === "all") return true;
        if (filterKey === "linked") return project.brokers.some((broker) => broker.state === "client-linked");
        if (filterKey === "idle") return project.brokers.some((broker) => broker.state === "idle");
        if (filterKey === "empty") return project.brokers.length === 0;
        if (filterKey === "archived") return project.publicationState === "archived";
        return true;
      }),
    [projects, filterKey],
  );

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="المشاريع"
        title="محفظة المشاريع"
        description="جميع مشاريعك العقارية في مكان واحد مع إجراءات نشر وحذف حقيقية فقط."
        actions={
          <Link
            href="/ws/projects/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-slate-900"
          >
            <UploadCloud className="h-4 w-4" />
            إنشاء مشروع جديد
          </Link>
        }
      />

      <div className="space-y-10 px-6 py-6 lg:px-8 lg:py-8">
        <ProjectsSummary {...summary} />
        <FilterChipBar
          chips={[
            { key: "all", label: "الكل" },
            { key: "linked", label: "مرتبط بعميل" },
            { key: "idle", label: "وسيط بدون عميل" },
            { key: "empty", label: "بدون وسطاء" },
            { key: "archived", label: "مؤرشف" },
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
                { label: "الغرف", value: project.specs.rooms },
                { label: "الحمامات", value: project.specs.baths },
                { label: "المساحة", value: project.specs.area },
                { label: "الحالة", value: project.specs.status },
              ]}
              density="flexible"
              publicationBadge={
                <span
                  className={`rounded-md px-2 py-1 text-[10px] font-bold border ${publicationStyles[project.publicationState]}`}
                >
                  {publicationLabels[project.publicationState]}
                </span>
              }
              footer={
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!onDeleteProject || isPending}
                      onClick={() => setDeleteTarget(project)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/ws/projects/${project.id}/edit`}
                      className="rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
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
                        className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        نشر
                      </button>
                    ) : null}
                  </div>
                  <Link
                    href={`/ws/projects/${project.id}`}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    فتح المشروع
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
        title={`حذف مشروع: ${deleteTarget?.title ?? ""}`}
        description="سيتم إزالة المشروع من المحفظة بشكل نهائي مع كافة البيانات المرتبطة به."
        confirmLabel="حذف المشروع"
      />
    </div>
  );
}
