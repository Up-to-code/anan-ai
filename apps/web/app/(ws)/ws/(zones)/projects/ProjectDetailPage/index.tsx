import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CarFront,
  FileText,
  MapPin,
  MessageSquareMore,
  PencilLine,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import type { WorkspaceProject } from "../projectTypes";
import ProjectMediaGallery from "./ProjectMediaGallery";

const publicationLabels: Record<WorkspaceProject["publicationState"], string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

const publicationTone: Record<WorkspaceProject["publicationState"], string> = {
  draft: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  published: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  archived: "border-border bg-muted/50 text-muted-foreground",
};

function buildFactItems(project: WorkspaceProject) {
  return [
    { label: "الغرف", value: project.specs.rooms, icon: BedDouble },
    { label: "الحمامات", value: project.specs.baths, icon: Bath },
    { label: "المساحة", value: project.specs.area, icon: Ruler },
    { label: "المواقف", value: project.parking.label, icon: CarFront },
    { label: "التصريح", value: project.permit.statusLabel, icon: ShieldCheck },
  ];
}

/**
 * WHY:   Project detail needs a simpler, more realistic reading surface for both owners and shared recipients.
 * WHAT:  Renders one gallery-led project page with compact facts, amenities, and access-aware actions.
 * HOW:   Uses the new presentation data to keep the page visual-first while limiting sensitive permit files to shared access only.
 */
export default function ProjectDetailPage({ project }: { project: WorkspaceProject }) {
  const isSharedReadOnly = project.accessMode === "shared";
  const factItems = buildFactItems(project);
  const summary = project.shortDescription || project.summary;

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${publicationTone[project.publicationState]}`}
                >
                  {publicationLabels[project.publicationState]}
                </span>
                <span className="inline-flex items-center rounded-full border border-border bg-muted/20 px-3 py-1 text-[11px] font-bold text-muted-foreground">
                  {isSharedReadOnly ? "مشاهدة مشتركة" : "إدارة المشروع"}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </span>
                <span className="text-border">•</span>
                <span>{project.priceLabel}</span>
              </div>
              <p className="max-w-3xl text-[14px] leading-relaxed text-muted-foreground">{summary}</p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/ws/inbox"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90 shadow-sm"
              >
                <MessageSquareMore className="h-4 w-4" />
                فتح المحادثات
              </Link>
              {project.canEdit ? (
                <Link
                  href={`/ws/projects/${project.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground shadow-sm"
                >
                  <PencilLine className="h-4 w-4" />
                  تعديل المشروع
                </Link>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.85fr)]">
            <ProjectMediaGallery images={project.galleryImages} title={project.title} />

            <div className="space-y-4">
              <section className="rounded-2xl border border-border bg-muted/20 p-5 shadow-sm">
                <div className="text-[11px] font-black tracking-[0.16em] text-muted-foreground uppercase">ملخص سريع</div>
                <p className="mt-3 text-[13px] leading-relaxed text-foreground">{project.summary}</p>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="text-[11px] font-black tracking-[0.16em] text-muted-foreground uppercase">حقائق المشروع</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {factItems.map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-xl border border-border bg-background px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
                        <fact.icon className="h-4 w-4" />
                        {fact.label}
                      </div>
                      <div className="mt-2 text-[14px] font-black text-foreground">{fact.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {project.amenities.length > 0 ? (
                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="text-[11px] font-black tracking-[0.16em] text-muted-foreground uppercase">المزايا والخدمات</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-[12px] font-bold text-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">الوصف الكامل</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground whitespace-pre-wrap">{project.summary}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="text-[11px] font-black tracking-[0.16em] text-muted-foreground uppercase">الوصول والتصاريح</div>
            {project.permit.canShowPrivatePanel ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <div className="text-[13px] font-bold text-emerald-900 dark:text-emerald-200">تصريح خاص بهذه المحادثة</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-emerald-900/85 dark:text-emerald-200/85">
                    {project.permit.privateSummary ?? "تمت مشاركة هذا التصريح بشكل خاص مع طرف هذه المحادثة فقط."}
                  </p>
                </div>

                {project.permit.privateFiles.length > 0 ? (
                  <div className="space-y-2">
                    {project.permit.privateFiles.map((file) => (
                      <a
                        key={file.key}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:border-foreground/30 shadow-sm"
                      >
                        <span className="inline-flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </span>
                        <ArrowLeft className="h-4 w-4 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4 text-[13px] leading-relaxed text-muted-foreground">
                {isSharedReadOnly
                  ? "تمت مشاركة هذا المشروع للقراءة فقط. أي مستندات خاصة إضافية تظهر فقط عندما تكون مرفقة بالمحادثة المصرح بها."
                  : "المستندات الخاصة لا تظهر هنا بشكل عام. إذا تمت مشاركتها مع طرف محدد فستظهر له فقط من خلال رابط المشروع القادم من المحادثة."}
              </div>
            )}
          </section>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">الوحدات المعروضة</h2>
              <p className="mt-1 text-[13px] font-medium text-muted-foreground">تفاصيل الوحدات المرتبطة بهذا المشروع.</p>
            </div>
          </div>
          {project.units.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {project.units.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-[24px] border border-border bg-background p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-bold text-foreground">{unit.label}</div>
                    <div className="rounded-full border border-border bg-muted/20 px-3 py-1 text-[11px] font-bold text-foreground">
                      {unit.priceLabel}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-bold text-muted-foreground">
                    <span>{unit.bedrooms} نوم</span>
                    <span>•</span>
                    <span>{unit.bathrooms} حمام</span>
                    <span>•</span>
                    <span>{unit.area}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
              لا توجد وحدات مفصلة حالياً.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
