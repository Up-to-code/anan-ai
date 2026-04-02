"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Eye,
  FileText,
  MapPin,
  MessageSquareMore,
  PencilLine,
  PlusCircle,
  Ruler,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";
import { AgDeleteConfirmModal } from "@/app/(ws)/ws/public";
import type { WorkspaceProject } from "../projectTypes";
import ProjectMediaGallery from "./ProjectMediaGallery";
import type { ProjectMutationActionResult } from "../ProjectsPage/actionTypes";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";

const publicationLabels: Record<WorkspaceProject["publicationState"], string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

const publicationTone: Record<WorkspaceProject["publicationState"], string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-800",
  published: "border-emerald-200 bg-emerald-50 text-emerald-800",
  archived: "border-border bg-muted/60 text-muted-foreground",
};

function buildHeroFacts(project: WorkspaceProject) {
  return [
    { label: "الموقع", value: project.location, icon: MapPin },
    { label: "السعر", value: project.priceLabel, icon: Ruler },
    { label: "الغرف", value: project.specs.rooms, icon: BedDouble },
    { label: "الحمامات", value: project.specs.baths, icon: Bath },
  ];
}

function buildFactRows(project: WorkspaceProject) {
  return [
    { label: "الغرف", value: project.specs.rooms, icon: BedDouble },
    { label: "الحمامات", value: project.specs.baths, icon: Bath },
    { label: "المساحة", value: project.specs.area, icon: Ruler },
    { label: "المواقف", value: project.parking.label, icon: UploadCloud },
    { label: "حالة التصريح", value: project.permit.statusLabel, icon: ShieldCheck },
  ];
}

function DetailBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "emphasis" | "warning";
}) {
  const className =
    tone === "emphasis"
      ? "border-sky-200 bg-sky-50 text-sky-800"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-border bg-background text-foreground";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${className}`}>
      {children}
    </span>
  );
}

function SurfaceCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-border/60 bg-card p-5 shadow-sm lg:p-6">
      <div className="text-right">
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function HeroFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/70 p-4 text-right">
      <div className="inline-flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-[14px] font-black text-foreground">{value}</div>
    </div>
  );
}

function FactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3">
      <div className="text-right">
        <div className="text-[11px] font-bold text-muted-foreground">{label}</div>
        <div className="mt-1 text-[14px] font-black text-foreground">{value}</div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

/**
 * WHY:   The project detail surface should feel owner-first, lighter, and easier to scan while still preserving shared-viewer safety.
 * WHAT:  Renders the redesigned project detail page with a clean hero, gallery, focused fact/access sections, and tracked owner actions.
 * HOW:   Tracks page and CTA events through server actions, keeps destructive actions behind a confirmation modal, and conditionally reveals owner-only controls.
 */
export default function ProjectDetailPage({
  project,
  onPublishProject,
  onDeleteProject,
  onTrackProjectEvent,
}: {
  project: WorkspaceProject;
  onPublishProject?: () => Promise<ProjectMutationActionResult>;
  onDeleteProject?: () => Promise<ProjectMutationActionResult>;
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<{ ok: true }>;
}) {
  const router = useRouter();
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isSharedReadOnly = project.accessMode === "shared";
  const heroFacts = buildHeroFacts(project);
  const factRows = buildFactRows(project);
  const summary = project.shortDescription || project.summary;
  const projectDocuments = project.assets.filter((asset) => asset.kind === "pdf");
  const visibilityLabel =
    project.visibility.clientVisibility === "public" ? "مرئي للعميل والـ AI" : "داخلي داخل مساحة العمل";
  const accessLabel = isSharedReadOnly ? "مشاهدة فقط" : "إدارة المشروع";
  const hasAccessSection =
    isSharedReadOnly ||
    project.visibility.clientVisibility === "private" ||
    project.visibility.viewers.length > 0 ||
    projectDocuments.length > 0 ||
    (project.permit.canShowPrivatePanel && project.permit.privateFiles.length > 0);

  useEffect(() => {
    void onTrackProjectEvent?.({
      eventType: "project_detail_view",
      source: "project_detail_page",
    });
  }, [onTrackProjectEvent, project.id]);

  return (
    <div className="min-h-full bg-background/60 pb-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/ws/projects")}
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للمشاريع
          </button>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${publicationTone[project.publicationState]}`}>
              {publicationLabels[project.publicationState]}
            </span>
            <DetailBadge tone="emphasis">{visibilityLabel}</DetailBadge>
            <DetailBadge tone={isSharedReadOnly ? "warning" : "default"}>{accessLabel}</DetailBadge>
          </div>
        </nav>

        {actionError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-right text-[13px] font-bold text-rose-700">
            {actionError}
          </div>
        ) : null}

        <section data-slot="project-detail-hero" className="rounded-[28px] border border-border/60 bg-card p-6 shadow-sm lg:p-8">
          <div className="space-y-6 text-right">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <div className="text-[12px] font-semibold text-muted-foreground">تفاصيل المشروع</div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-foreground">{project.title}</h1>
                  <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">{summary}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      await onTrackProjectEvent?.({
                        eventType: "project_analyze_click",
                        source: "project_detail_header",
                      });
                      router.push(`/ws/projects/${project.id}/analytics`);
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-60"
                >
                  <Eye className="h-4 w-4" />
                  تحليل المشروع
                </button>

                {project.canEdit ? (
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await onTrackProjectEvent?.({
                          eventType: "project_edit_click",
                          source: "project_detail_header",
                        });
                        router.push(`/ws/projects/${project.id}/edit`);
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-60"
                  >
                    <PencilLine className="h-4 w-4" />
                    تعديل المشروع
                  </button>
                ) : null}

                {project.canEdit && project.publicationState === "draft" && onPublishProject ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        setActionError(null);
                        const result = await onPublishProject();
                        if (!result.ok) {
                          setActionError(result.message);
                          return;
                        }
                        router.refresh();
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-60"
                  >
                    <UploadCloud className="h-4 w-4" />
                    نشر المشروع
                  </button>
                ) : null}

                {project.canEdit && onDeleteProject ? (
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await onTrackProjectEvent?.({
                      eventType: "project_create_offer_click",
                      source: "project_detail_quick_actions",
                    });
                    router.push(`/ws/offers/create?propertyId=${project.id}&mode=open_offer`);
                  })
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-60"
              >
                <PlusCircle className="h-4 w-4" />
                إنشاء عرض
              </button>

              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await onTrackProjectEvent?.({
                      eventType: "project_open_inbox_click",
                      source: "project_detail_quick_actions",
                    });
                    router.push("/ws/inbox");
                  })
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted disabled:opacity-60"
              >
                <MessageSquareMore className="h-4 w-4" />
                فتح المحادثات
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroFacts.map((fact) => (
                <HeroFact key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
              ))}
            </div>
          </div>
        </section>

        <div data-slot="project-detail-main" className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
          <div className="space-y-6">
            <ProjectMediaGallery images={project.galleryImages} title={project.title} />

            <SurfaceCard title="الملخص التنفيذي" description="قراءة سريعة تساعد الفريق على فهم المشروع في أقل وقت ممكن.">
              <p className="text-[14px] leading-7 text-foreground">{summary}</p>
            </SurfaceCard>

            <SurfaceCard title="الوصف الكامل" description="الوصف المرجعي الذي يمكن الاعتماد عليه عند المراجعة أو الإرسال.">
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-muted-foreground">{project.summary}</p>
            </SurfaceCard>

            {project.amenities.length > 0 ? (
              <SurfaceCard title="المزايا والخدمات" description="أهم العناصر التي ترفع قيمة العرض وتسهّل تمييز المشروع.">
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-[12px] font-bold text-foreground"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </SurfaceCard>
            ) : null}

            {hasAccessSection ? (
              <SurfaceCard title="الملفات والوصول" description="الملفات المتاحة وسياق الوصول الحالي لهذا المشروع.">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-background/70 p-4 text-right">
                    <div className="text-[13px] font-black text-foreground">حالة الوصول</div>
                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                      {isSharedReadOnly
                        ? "أنت تشاهد هذا المشروع بصلاحية قراءة فقط من خلال مشاركة مباشرة."
                        : project.visibility.clientVisibility === "private"
                          ? `هذا المشروع داخلي حالياً. عدد الجهات التي لديها صلاحية مشاهدة الآن: ${project.visibility.viewers.length}.`
                          : "هذا المشروع مرئي خارجياً وفق حالة النشر الحالية ويمكن استخدامه في قنوات العميل والـ AI."}
                    </p>
                  </div>

                  {project.permit.canShowPrivatePanel ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-right">
                      <div className="text-[13px] font-black text-emerald-900">تصريح خاص بهذه المحادثة</div>
                      <p className="mt-2 text-[13px] leading-6 text-emerald-900/85">
                        {project.permit.privateSummary ?? "تمت مشاركة هذا التصريح ضمن هذا السياق فقط."}
                      </p>
                    </div>
                  ) : null}

                  {project.visibility.viewers.length > 0 && !isSharedReadOnly ? (
                    <div className="rounded-2xl border border-border bg-background/70 p-4">
                      <div className="text-right text-[13px] font-black text-foreground">المشاهدون الحاليون</div>
                      <div className="mt-3 space-y-2">
                        {project.visibility.viewers.map((viewer) => (
                          <div
                            key={`${viewer.authUserId}-${viewer.createdAt}`}
                            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                          >
                            <div className="text-right">
                              <div className="text-[13px] font-bold text-foreground">{viewer.name}</div>
                              <div className="mt-1 text-[12px] text-muted-foreground">
                                {viewer.email ?? "بدون بريد"} · {viewer.accessSource === "chat_share" ? "مشاركة محادثة" : "إضافة مباشرة"}
                              </div>
                            </div>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    {project.permit.canShowPrivatePanel && project.permit.privateFiles.length > 0
                      ? project.permit.privateFiles.map((file) => (
                          <a
                            key={file.key}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() =>
                              void onTrackProjectEvent?.({
                                eventType: "project_asset_open_click",
                                source: "project_detail_private_file",
                              })
                            }
                            className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:border-foreground/30"
                          >
                            <span className="inline-flex items-center gap-2 truncate">
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="truncate">{file.name}</span>
                            </span>
                            <ArrowLeft className="h-4 w-4 shrink-0" />
                          </a>
                        ))
                      : null}

                    {projectDocuments.map((asset) => (
                      <a
                        key={asset.key}
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() =>
                          void onTrackProjectEvent?.({
                            eventType: "project_asset_open_click",
                            source: "project_detail_document",
                          })
                        }
                        className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:border-foreground/30"
                      >
                        <span className="inline-flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{asset.name}</span>
                        </span>
                        <ArrowLeft className="h-4 w-4 shrink-0" />
                      </a>
                    ))}

                    {project.permit.canShowPrivatePanel ||
                    projectDocuments.length > 0 ||
                    project.visibility.viewers.length > 0 ? null : (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-[13px] font-semibold text-muted-foreground">
                        لا توجد ملفات أو صلاحيات إضافية ظاهرة ضمن هذا السياق حالياً.
                      </div>
                    )}
                  </div>
                </div>
              </SurfaceCard>
            ) : null}
          </div>

          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <SurfaceCard title="بطاقة الحقائق" description="أهم الأرقام التي يحتاجها الفريق أثناء المتابعة اليومية.">
              <div className="grid gap-3">
                {factRows.map((fact) => (
                  <FactRow key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard title="الحالة الحالية" description="ملخص واضح للظهور والوصول وطبيعة العمل على هذا المشروع.">
              <div className="space-y-3">
                <FactRow icon={Eye} label="مستوى الظهور" value={visibilityLabel} />
                <FactRow icon={Users} label="الوصول الحالي" value={accessLabel} />
                <FactRow
                  icon={MapPin}
                  label="المشاهِدون"
                  value={
                    isSharedReadOnly
                      ? "صلاحية قراءة فقط"
                      : project.visibility.viewers.length > 0
                        ? `${project.visibility.viewers.length} جهة`
                        : "لا توجد جهات مضافة"
                  }
                />
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>

      <AgDeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (!onDeleteProject) return;
          startTransition(async () => {
            setActionError(null);
            const result = await onDeleteProject();
            if (!result.ok) {
              setActionError(result.message);
              setDeleteOpen(false);
              return;
            }
            setDeleteOpen(false);
            router.push("/ws/projects");
          });
        }}
        title={`حذف المشروع: ${project.title}`}
        description="سيتم حذف المشروع من مساحة العمل الحالية."
        confirmLabel="حذف المشروع"
      />
    </div>
  );
}
