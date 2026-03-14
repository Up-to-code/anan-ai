"use client";

import Link from "next/link";
import { FolderOpen, Pencil, UploadCloud } from "lucide-react";
import { useState, useTransition } from "react";
import FilterChipBar from "../../../_components/Visuals/FilterChipBar";
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

/**
 * WHY:   Projects should only expose controls that are backed by persisted property actions.
 * WHAT:  Renders the real project portfolio with publish and delete wired to server actions.
 * HOW:   Keeps filtering client-side, then refreshes from the server after each supported mutation.
 */
export default function ProjectsWorkspace({
  initialProjects,
  onDeleteProject,
  onPublishProject,
}: ProjectsWorkspaceProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [filterKey, setFilterKey] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceProject | null>(null);
  const [isPending, startTransition] = useTransition();

  const summary = {
    total: projects.length,
    linkedBrokers: projects.reduce((total, project) => total + project.brokers.length, 0),
    activeClients: projects.reduce(
      (total, project) => total + project.brokers.filter((broker) => Boolean(broker.clientName)).length,
      0,
    ),
    archivedCount: projects.filter((project) => project.publicationState === "archived").length,
  };

  const filteredProjects = projects.filter((project) => {
    if (filterKey === "all") return true;
    if (filterKey === "linked") return project.brokers.some((broker) => broker.state === "client-linked");
    if (filterKey === "idle") return project.brokers.some((broker) => broker.state === "idle");
    if (filterKey === "empty") return project.brokers.length === 0;
    if (filterKey === "archived") return project.publicationState === "archived";
    return true;
  });

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="المشاريع"
        title="محفظة المشاريع"
        description="جميع مشاريعك العقارية في مكان واحد مع إجراءات نشر وحذف حقيقية فقط."
        actions={
          <Link
            href="/ws/projects/create"
            className="inline-flex items-center gap-2 border-2 border-blue-600 bg-blue-600 px-6 py-3 text-xs font-black tracking-[0.18em] text-white transition hover:border-slate-950 hover:bg-slate-950"
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
            <article
              key={project.id}
              className="group overflow-hidden border border-slate-200 bg-white transition-all duration-700 hover:border-blue-600 hover:shadow-[0_22px_45px_-15px_rgba(0,41,255,0.08)]"
            >
              <div className="h-52 overflow-hidden">
                <div className="h-full transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105">
                  <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                </div>
              </div>

              <div className="grid gap-5 p-6">
                <div className="grid gap-3 text-right">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                          project.publicationState === "published"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : project.publicationState === "draft"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        {publicationLabels[project.publicationState]}
                      </span>
                      <span className="border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-500">
                        {project.brokers.length} وسيط
                      </span>
                    </div>
                    <div className="shrink-0 border-2 border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-black text-white">
                      {project.priceLabel}
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-950">{project.title}</h2>
                  <p className="text-sm font-black tracking-wide text-slate-500">{project.location}</p>
                  <p className="line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{project.summary}</p>
                </div>

                <div className="grid grid-cols-4 gap-px border border-slate-100 bg-slate-100">
                  {[
                    { label: "الغرف", value: project.specs.rooms },
                    { label: "الحمامات", value: project.specs.baths },
                    { label: "المساحة", value: project.specs.area },
                    { label: "الحالة", value: project.specs.status },
                  ].map((spec) => (
                    <div key={spec.label} className="bg-white px-2 py-3 text-center">
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{spec.label}</div>
                      <div className="mt-1.5 text-sm font-black text-slate-950">{spec.value}</div>
                    </div>
                  ))}
                </div>

                {project.brokers.length === 0 ? (
                  <div className="border border-dashed border-slate-200 py-4 text-center text-sm font-bold text-slate-400">
                    لا يوجد وسطاء مرتبطون بهذا المشروع حتى الآن
                  </div>
                ) : null}

                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="text-[10px] font-black text-slate-400">
                    حالة النشر: {publicationLabels[project.publicationState]}
                  </div>
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
                            refreshPage();
                          });
                        })
                      }
                      className="border border-blue-600 bg-blue-600 px-3 py-2 text-[10px] font-black tracking-[0.18em] text-white transition hover:border-slate-950 hover:bg-slate-950 disabled:opacity-60"
                    >
                      نشر المشروع
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!onDeleteProject || isPending}
                      onClick={() => setDeleteTarget(project)}
                      className="flex items-center gap-1.5 border border-slate-200 px-3 py-2.5 text-[10px] font-black text-slate-500 transition hover:border-red-400 hover:text-red-600 disabled:opacity-60"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      حذف
                    </button>
                    <Link
                      href="/ws/settings/invite"
                      className="flex items-center gap-1.5 border border-slate-200 px-3 py-2.5 text-[10px] font-black text-slate-500 transition hover:border-blue-600 hover:text-blue-600"
                    >
                      دعوة عضو
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/ws/projects/${project.id}/edit`}
                      className="flex items-center gap-1.5 border border-slate-200 px-4 py-2.5 text-[10px] font-black text-slate-700 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      تعديل
                    </Link>
                    <Link
                      href={`/ws/projects/${project.id}`}
                      className="flex items-center gap-2 border-2 border-blue-600 bg-blue-600 px-5 py-2.5 text-xs font-black text-white transition hover:border-slate-950 hover:bg-slate-950"
                    >
                      فتح المشروع
                    </Link>
                  </div>
                </div>
              </div>
            </article>
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
              refreshPage();
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
  function refreshPage() {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }
