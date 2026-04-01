import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CarFront,
  Eye,
  FileText,
  MapPin,
  MessageSquareMore,
  PencilLine,
  Ruler,
  ShieldCheck,
  Users,
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

function DetailBadge({ tone = "default", children }: { tone?: "default" | "sky" | "amber"; children: React.ReactNode }) {
  const className =
    tone === "sky"
      ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        : "border-border bg-card/70 text-muted-foreground";

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${className}`}>{children}</span>;
}

function SidebarCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-border/60 bg-card p-5 shadow-sm">
      <div className="text-right">
        <h2 className="text-[15px] font-black text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-[12px] leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4 text-right shadow-sm">
      <div className="inline-flex items-center gap-2 text-[12px] font-bold text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-3 text-[14px] font-black text-foreground">{value}</div>
    </div>
  );
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
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 text-right">
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
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
  const accessSummary = isSharedReadOnly
    ? "تم فتح المشروع لك عبر مشاركة مباشرة."
    : project.visibility.clientVisibility === "private"
      ? `${project.visibility.viewers.length} جهة لديها صلاحية مشاهدة.`
      : "المشروع جاهز للظهور وفق حالة النشر.";

  return (
    <div className="flex min-h-full flex-col pb-32">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/ws/projects"
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للمشاريع
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${publicationTone[project.publicationState]}`}>
              {publicationLabels[project.publicationState]}
            </span>
            <DetailBadge tone="sky">{visibilityLabel}</DetailBadge>
            <DetailBadge tone={isSharedReadOnly ? "amber" : "default"}>{isSharedReadOnly ? "مشاهدة فقط" : "إدارة المشروع"}</DetailBadge>
          </div>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:[direction:ltr]">
          <aside data-slot="project-detail-sidebar" className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-6 lg:self-start">
            <SidebarCard title="إجراءات المشروع" description="اختصارات سريعة للعمل على هذا المشروع مباشرة.">
              <div className="grid gap-3">
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
            </SidebarCard>

            <SidebarCard title="بطاقة الحالة" description="ملخص سريع للحالة الحالية والظهور والوصول.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <SummaryTile icon={MapPin} label="الموقع والسعر" value={`${project.location} · ${project.priceLabel}`} />
                <SummaryTile icon={Eye} label="مستوى الظهور" value={visibilityLabel} />
                <SummaryTile icon={Users} label="الوصول الحالي" value={accessSummary} />
              </div>
            </SidebarCard>

            <SidebarCard title="بطاقة الحقائق" description="أهم الأرقام التي يحتاجها الفريق بسرعة أثناء المتابعة.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {factItems.map((fact) => (
                  <div key={fact.label} className="rounded-2xl border border-border bg-background px-4 py-4 shadow-sm">
                    <div className="flex items-center justify-end gap-2 text-[12px] font-bold text-muted-foreground">
                      {fact.label}
                      <fact.icon className="h-4 w-4" />
                    </div>
                    <div className="mt-2 text-right text-[14px] font-black text-foreground">{fact.value}</div>
                  </div>
                ))}
              </div>
            </SidebarCard>
          </aside>

          <main data-slot="project-detail-main" className="order-1 space-y-6 lg:order-2">
            <section data-slot="project-detail-hero" className="rounded-[28px] border border-border/60 bg-card p-6 shadow-sm lg:p-8">
              <div className="space-y-5 text-right">
                <div className="text-[12px] font-semibold text-muted-foreground">تفاصيل المشروع</div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-foreground">{project.title}</h1>
                  <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground">{summary}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <SummaryTile icon={MapPin} label="الموقع" value={project.location} />
                  <SummaryTile icon={Ruler} label="القيمة" value={project.priceLabel} />
                  <SummaryTile icon={Users} label="الوصول" value={isSharedReadOnly ? "مشاهدة فقط" : "قابل للإدارة"} />
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <ProjectMediaGallery images={project.galleryImages} title={project.title} />

              <div className="space-y-6">
                <DetailCard title="الملخص التنفيذي" description="قراءة سريعة تعطي الفريق أو المستلم صورة واضحة عن المشروع.">
                  <p className="text-[14px] leading-7 text-foreground">{summary}</p>
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
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <DetailCard title="الوصف الكامل" description="الوصف المرجعي الذي يشرح المشروع بتفاصيل أكثر للفريق والمستلمين.">
                <p className="whitespace-pre-wrap text-[14px] leading-7 text-muted-foreground">{project.summary}</p>
              </DetailCard>

              <div className="space-y-6">
                <DetailCard title="الرؤية والوصول" description="تعرف من يمكنه مشاهدة المشروع وكيف يتم التعامل مع الوصول الخاص.">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 text-right">
                      <div className="text-sm font-black text-foreground">نوع الوصول</div>
                      <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                        {project.visibility.clientVisibility === "private"
                          ? isSharedReadOnly
                            ? "هذا مشروع خاص وتم فتحه لك من مشاركة مباشرة. يمكنك مشاهدة التفاصيل فقط."
                            : `هذا المشروع داخلي. عدد الجهات المصرح لها بالمشاهدة حالياً: ${project.visibility.viewers.length}.`
                          : "هذا المشروع مرئي خارجياً وفق حالة النشر الحالية ويمكن استخدامه في قنوات العميل والـ AI."}
                      </p>
                    </div>

                    {project.permit.canShowPrivatePanel ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                        <div className="text-[13px] font-bold text-emerald-900 dark:text-emerald-200">تصريح خاص بهذه المحادثة</div>
                        <p className="mt-2 text-[12px] leading-6 text-emerald-900/85 dark:text-emerald-200/85">
                          {project.permit.privateSummary ?? "تمت مشاركة هذا التصريح بشكل خاص مع طرف هذه المحادثة فقط."}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border bg-muted/20 p-4 text-[13px] leading-6 text-muted-foreground">
                        {isSharedReadOnly
                          ? "تمت مشاركة هذا المشروع للقراءة فقط. أي مستندات خاصة إضافية تظهر فقط عندما تكون مرفقة بالمحادثة المصرح بها."
                          : "المستندات الخاصة لا تظهر هنا بشكل عام. إذا تمت مشاركتها مع طرف محدد فستظهر له فقط من خلال رابط المشروع القادم من المحادثة."}
                      </div>
                    )}
                  </div>
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
                          className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:border-foreground/30 shadow-sm"
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
                          className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-bold text-foreground transition hover:border-foreground/30"
                        >
                          <span className="inline-flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{asset.name}</span>
                          </span>
                          <ArrowLeft className="h-4 w-4 shrink-0" />
                        </a>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-[13px] font-semibold text-muted-foreground">
                        لا توجد ملفات إضافية متاحة ضمن هذا السياق حالياً.
                      </div>
                    )}
                  </div>
                </DetailCard>
              </div>
            </section>

            <DetailCard title="الوحدات المرتبطة" description="تفاصيل الوحدات التي يعتمد عليها العرض داخل هذا المشروع.">
              {project.units.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {project.units.map((unit) => (
                    <div key={unit.id} className="rounded-[24px] border border-border bg-background p-5 shadow-sm">
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
            </DetailCard>
          </main>
        </div>
      </div>
    </div>
  );
}
