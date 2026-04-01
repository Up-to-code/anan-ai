import Link from "next/link";
import { ArrowLeft, Eye, FileText, MapPin, MessageSquareMore, PencilLine, Users } from "lucide-react";
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
    { label: "الغرف", value: project.specs.rooms },
    { label: "الحمامات", value: project.specs.baths },
    { label: "المساحة", value: project.specs.area },
    { label: "المواقف", value: project.parking.label },
    { label: "التصريح", value: project.permit.statusLabel },
    { label: "الحالة", value: project.specs.status },
  ];
}

function DetailCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border/70 pt-6 first:border-t-0 first:pt-0">
      <div className="mb-5 text-right">
        <h2 className="text-xl font-black text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-[14px] leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function DetailRows({
  rows,
}: {
  rows: Array<{ label: string; value: string; helper?: string }>;
}) {
  return (
    <div className="grid gap-3">
      {rows.map((row) => (
        <div key={row.label} className="border-b border-border/60 pb-3 text-right last:border-b-0 last:pb-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{row.label}</div>
          <div className="mt-2 text-[14px] font-black text-foreground">{row.value}</div>
          {row.helper ? <div className="mt-1 text-[13px] leading-6 text-muted-foreground">{row.helper}</div> : null}
        </div>
      ))}
    </div>
  );
}

/**
 * WHY:   Project detail needs a clearer operational surface that separates summary, access, and sales-ready context.
 * WHAT:  Renders one gallery-led project page with card-based sections for facts, visibility, documents, and units.
 * HOW:   Keeps the detail page visual-first while rewriting the copy and grouping related data into clearer reading cards.
 */
export default function ProjectDetailPage({ project }: { project: WorkspaceProject }) {
  const isSharedReadOnly = project.accessMode === "shared";
  const factItems = buildFactItems(project);
  const summary = project.shortDescription || project.summary;
  const projectDocuments = project.assets.filter((asset) => asset.kind === "pdf");
  const visibilityLabel =
    project.visibility.clientVisibility === "public" ? "مرئي للعميل والـ AI" : "داخلي داخل مساحة العمل";

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <section className="border-b border-border/70 pb-8">
          <div className="flex flex-col gap-6 border-b border-border/60 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4 text-right">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${publicationTone[project.publicationState]}`}
                >
                  {publicationLabels[project.publicationState]}
                </span>
                <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                  {visibilityLabel}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-[11px] font-bold text-muted-foreground">
                  {isSharedReadOnly ? "مشاهدة فقط" : "إدارة المشروع"}
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">{project.title}</h1>
                <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">{summary}</p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 text-[13px] font-medium text-muted-foreground">
                <span>{project.priceLabel}</span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href={`/ws/offers/create?propertyId=${project.id}&mode=open_offer`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-muted shadow-sm"
              >
                إنشاء عرض من المشروع
              </Link>
              <Link
                href="/ws/inbox"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90 shadow-sm"
              >
                <MessageSquareMore className="h-4 w-4" />
                فتح المحادثات
              </Link>
              {project.canEdit ? (
                <Link
                  href={`/ws/projects/${project.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground shadow-sm"
                >
                  <PencilLine className="h-4 w-4" />
                  تعديل بيانات المشروع
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-8">
            <ProjectMediaGallery images={project.galleryImages} title={project.title} />

            <DetailCard title="نظرة سريعة" description="ملخص واضح للمشروع مع أهم المعلومات التي يحتاجها الفريق أثناء القراءة والمتابعة.">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
                <div className="text-right">
                  <p className="text-[15px] leading-8 text-foreground">{summary}</p>
                </div>
                <DetailRows
                  rows={[
                    { label: "الموقع", value: project.location },
                    { label: "السعر", value: project.priceLabel },
                    { label: "نوع الوصول", value: isSharedReadOnly ? "مشاهدة فقط" : "إدارة المشروع" },
                  ]}
                />
              </div>
            </DetailCard>

            <DetailCard title="تفاصيل المشروع" description="العناصر الأساسية للمشروع بشكل مرتب وسهل المسح البصري.">
              <div className="grid gap-8 lg:grid-cols-2">
                <DetailRows
                  rows={factItems.slice(0, 3).map((fact) => ({
                    label: fact.label,
                    value: fact.value,
                  }))}
                />
                <DetailRows
                  rows={factItems.slice(3).map((fact) => ({
                    label: fact.label,
                    value: fact.value,
                  }))}
                />
              </div>
            </DetailCard>

            {project.amenities.length > 0 ? (
              <DetailCard title="المزايا والخدمات" description="العناصر التي ترفع قيمة العرض وتساعد على تمييز المشروع بسرعة.">
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
              </DetailCard>
            ) : null}

            <DetailCard title="الوصف الكامل" description="الوصف المرجعي الذي يشرح المشروع بتفاصيل أكثر للفريق والمستلمين.">
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-muted-foreground">{project.summary}</p>
            </DetailCard>

            <DetailCard title="الملفات المرتبطة" description="الملفات التي يسمح لك هذا السياق بمشاهدتها أو مشاركتها.">
              <div className="space-y-2">
                {project.permit.canShowPrivatePanel && project.permit.privateFiles.length > 0 ? (
                  project.permit.privateFiles.map((file) => (
                    <a
                      key={file.key}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border-b border-border/60 px-1 py-3 text-[13px] font-bold text-foreground transition hover:text-foreground/80 last:border-b-0"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </span>
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                    </a>
                  ))
                ) : projectDocuments.length > 0 ? (
                  projectDocuments.map((asset) => (
                    <a
                      key={asset.key}
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border-b border-border/60 px-1 py-3 text-[13px] font-bold text-foreground transition hover:text-foreground/80 last:border-b-0"
                    >
                      <span className="inline-flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 shrink-0" />
                        <span className="truncate">{asset.name}</span>
                      </span>
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                    </a>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-[13px] font-semibold text-muted-foreground">
                    لا توجد ملفات إضافية متاحة ضمن هذا السياق حالياً.
                  </div>
                )}
              </div>
            </DetailCard>

            <DetailCard title="الوحدات المرتبطة" description="تفاصيل الوحدات التي يعتمد عليها العرض داخل هذا المشروع.">
              {project.units.length > 0 ? (
                <div className="grid gap-3">
                  {project.units.map((unit) => (
                    <div key={unit.id} className="border-b border-border/60 pb-4 text-right last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[14px] font-bold text-foreground">{unit.label}</div>
                        <div className="px-3 py-1 text-[11px] font-bold text-foreground">
                          {unit.priceLabel}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap justify-end gap-2 text-[12px] font-bold text-muted-foreground">
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
                <div className="px-4 py-10 text-center text-[13px] font-semibold text-muted-foreground">
                  لا توجد وحدات مفصلة حالياً.
                </div>
              )}
            </DetailCard>
          </div>

          <aside className="space-y-6">
            <DetailCard title="حالة المشروع" description="ملخص سريع يوضح الرؤية والوصول في هذا السياق.">
              <div className="space-y-4">
                <div className="border-b border-border/60 pb-3 text-right">
                  <div className="inline-flex items-center gap-2 text-[13px] font-black text-foreground">
                    <Eye className="h-4 w-4" />
                    مستوى الظهور
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{visibilityLabel}</p>
                </div>

                <div className="border-b border-border/60 pb-3 text-right">
                  <div className="inline-flex items-center gap-2 text-[13px] font-black text-foreground">
                    <Users className="h-4 w-4" />
                    نوع الوصول
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    {project.visibility.clientVisibility === "private"
                      ? isSharedReadOnly
                        ? "هذا مشروع خاص وتم فتحه لك من مشاركة مباشرة. يمكنك مشاهدة التفاصيل فقط."
                        : `هذا المشروع داخلي. عدد الجهات المصرح لها بالمشاهدة حالياً: ${project.visibility.viewers.length}.`
                      : "هذا المشروع مرئي خارجياً وفق حالة النشر الحالية ويمكن استخدامه في قنوات العميل والـ AI."}
                  </p>
                </div>

                {project.permit.canShowPrivatePanel ? (
                  <div className="border-r-2 border-emerald-300 bg-emerald-50/60 p-4 dark:bg-emerald-500/10">
                    <div className="text-[13px] font-bold text-emerald-900 dark:text-emerald-200">تصريح خاص بهذه المحادثة</div>
                    <p className="mt-2 text-[12px] leading-6 text-emerald-900/85 dark:text-emerald-200/85">
                      {project.permit.privateSummary ?? "تمت مشاركة هذا التصريح بشكل خاص مع طرف هذه المحادثة فقط."}
                    </p>
                  </div>
                ) : (
                  <div className="p-1 text-[13px] leading-6 text-muted-foreground">
                    {isSharedReadOnly
                      ? "تمت مشاركة هذا المشروع للقراءة فقط. أي مستندات خاصة إضافية تظهر فقط عندما تكون مرفقة بالمحادثة المصرح بها."
                      : "المستندات الخاصة لا تظهر هنا بشكل عام. إذا تمت مشاركتها مع طرف محدد فستظهر له فقط من خلال رابط المشروع القادم من المحادثة."}
                  </div>
                )}
              </div>
            </DetailCard>
          </aside>
        </div>
      </div>
    </div>
  );
}
