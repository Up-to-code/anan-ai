"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
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
import type { WorkspaceProject } from "../../types/projectTypes";
import ProjectMediaGallery from "./ProjectMediaGallery";
import type { ProjectMutationActionResult } from "../ProjectsPage/actionTypes";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";

const publicationLabels: Record<WorkspaceProject["publicationState"], string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

const publicationTone: Record<WorkspaceProject["publicationState"], string> = {
  draft: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  archived: "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]",
};

const priceComparisonLabels: Record<string, string> = {
  below_market: "أقل من السوق",
  fair_market: "سعر عادل",
  above_market: "أعلى من السوق",
  unknown: "غير محدد",
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
      ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_26%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-foreground"
      : tone === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-foreground";

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
    <section className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-5 shadow-sm lg:p-6">
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
    <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 text-right">
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
    <div className="flex items-center justify-between rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3">
      <div className="text-right">
        <div className="text-[11px] font-bold text-muted-foreground">{label}</div>
        <div className="mt-1 text-[14px] font-black text-foreground">{value}</div>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

function ActionButton({
  children,
  icon: Icon,
  variant = "secondary",
  disabled,
  href,
  onClick,
}: {
  children: React.ReactNode;
  icon: typeof ArrowLeft;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-60"
      : variant === "danger"
        ? "inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-[13px] font-bold text-rose-700 transition hover:bg-rose-500/15 disabled:opacity-60"
        : "inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 text-[13px] font-bold text-foreground transition hover:bg-[var(--workspace-accent-soft)] disabled:opacity-60";

  if (href) {
    return (
      <Link
        href={href}
        aria-disabled={disabled ? true : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.();
        }}
        className={`${className} ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <Icon className="h-4 w-4" />
        {children}
      </Link>
    );
  }

  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function ProjectSpecCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 text-right shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      </div>
      <div className="mt-4 text-[18px] font-black text-foreground">{value}</div>
      {helper ? <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{helper}</div> : null}
    </div>
  );
}

function ProjectUnitCard({
  label,
  bedrooms,
  bathrooms,
  area,
  priceLabel,
}: {
  label: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  priceLabel?: string;
}) {
  return (
    <div className="rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 text-right">
      <div className="text-[15px] font-black text-foreground">{label}</div>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {typeof bedrooms === "number" ? (
          <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-bold text-foreground">
            {bedrooms} غرف
          </span>
        ) : null}
        {typeof bathrooms === "number" ? (
          <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-bold text-foreground">
            {bathrooms} حمامات
          </span>
        ) : null}
        {area ? (
          <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-bold text-foreground">
            {area}
          </span>
        ) : null}
        {priceLabel ? (
          <span className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] font-bold text-foreground">
            {priceLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ProjectBrokerCard({
  name,
  title,
  clientName,
  summary,
}: {
  name: string;
  title?: string;
  clientName?: string | null;
  summary?: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/60 bg-background/60 p-4 text-right">
      <div className="text-[15px] font-black text-foreground">{name}</div>
      {title ? <div className="mt-1 text-[12px] font-bold text-muted-foreground">{title}</div> : null}
      {clientName ? <div className="mt-3 text-[13px] font-bold text-foreground">العميل المرتبط: {clientName}</div> : null}
      {summary ? <div className="mt-2 text-[13px] leading-6 text-muted-foreground">{summary}</div> : null}
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
  const viewerCountLabel = isSharedReadOnly
    ? "صلاحية قراءة فقط"
    : project.visibility.viewers.length > 0
      ? `${project.visibility.viewers.length} جهة`
      : "لا توجد جهات مضافة";
  const overviewSpecs = buildHeroFacts(project);
  const detailSpecs = buildFactRows(project);
  const expertSignals = [
    project.expert.assetType ? { label: "نوع الأصل", value: project.expert.assetType } : null,
    project.expert.projectScale ? { label: "حجم المشروع", value: project.expert.projectScale } : null,
    project.expert.productMix ? { label: "مزيج المنتجات", value: project.expert.productMix } : null,
    project.expert.primaryUnitType ? { label: "الوحدة الرئيسية", value: project.expert.primaryUnitType } : null,
    project.expert.sizeRange ? { label: "نطاق المساحات", value: project.expert.sizeRange } : null,
    project.expert.priceComparison ? { label: "موقع السعر", value: priceComparisonLabels[project.expert.priceComparison] ?? project.expert.priceComparison } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const projectSignals = [
    {
      icon: Eye,
      label: "مستوى الظهور",
      value: visibilityLabel,
      helper:
        project.visibility.clientVisibility === "public"
          ? "يمكن استخدام المشروع في قنوات العميل والـ AI حسب حالة النشر."
          : "المشروع داخلي داخل مساحة العمل ولا يظهر خارجياً.",
    },
    {
      icon: Users,
      label: "الوصول الحالي",
      value: accessLabel,
      helper: isSharedReadOnly
        ? "هذا العرض مفتوح لك للقراءة فقط من خلال مشاركة مباشرة."
        : "لديك صلاحية إدارة المشروع وتحرير بياناته وملفاته.",
    },
    {
      icon: Building2,
      label: "الوحدات",
      value: project.units.length > 0 ? `${project.units.length} وحدة` : "بدون وحدات",
      helper: "عدد الوحدات المرتبطة حالياً بالمشروع داخل مساحة العمل.",
    },
    {
      icon: Users,
      label: "الوسطاء",
      value: project.brokers.length > 0 ? `${project.brokers.length} وسيط` : "بدون وسطاء",
      helper: "الوسطاء المرتبطون حالياً بهذا المشروع أو يتحركون عليه.",
    },
    {
      icon: ShieldCheck,
      label: "التصريح",
      value: project.permit.statusLabel,
      helper: project.permit.privateSummary ?? "حالة التصريح أو الملف المرجعي للمشروع.",
    },
    {
      icon: FileText,
      label: "الملفات",
      value: projectDocuments.length > 0 ? `${projectDocuments.length} ملف` : "بدون ملفات",
      helper: "الملفات العامة الظاهرة ضمن هذا المشروع داخل مساحة العمل.",
    },
  ];

  useEffect(() => {
    void onTrackProjectEvent?.({
      eventType: "project_detail_view",
      source: "project_detail_page",
    });
  }, [onTrackProjectEvent, project.id]);

  return (
    <div className="min-h-full bg-background/60 pb-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8 lg:py-8">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/ws/projects"
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للمشاريع
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${publicationTone[project.publicationState]}`}>
              {publicationLabels[project.publicationState]}
            </span>
            <DetailBadge tone="emphasis">{visibilityLabel}</DetailBadge>
            <DetailBadge tone={project.readiness.canPublish ? "default" : "warning"}>{project.readiness.label}</DetailBadge>
            <DetailBadge tone={isSharedReadOnly ? "warning" : "default"}>{accessLabel}</DetailBadge>
          </div>
        </nav>

        {actionError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-right text-[13px] font-bold text-rose-700">
            {actionError}
          </div>
        ) : null}

        {!project.readiness.canPublish ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-right text-[13px] font-bold text-amber-700 dark:text-amber-300">
            حالة الجاهزية: {project.readiness.label}. لن يظهر المشروع في البحث العام أو قنوات الذكاء الاصطناعي حتى تكتمل متطلبات السوق السعودي.
          </div>
        ) : null}

        <section data-slot="project-detail-hero" className="rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6 text-right">
              <div>
                <div className="text-[12px] font-semibold text-[var(--workspace-muted)]">تفاصيل المشروع</div>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">{project.title}</h1>
                <p className="mt-3 max-w-3xl text-[15px] leading-8 text-muted-foreground">{summary}</p>
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${publicationTone[project.publicationState]}`}>
                  {publicationLabels[project.publicationState]}
                </span>
                <DetailBadge tone="emphasis">{visibilityLabel}</DetailBadge>
                <DetailBadge tone={project.readiness.canPublish ? "default" : "warning"}>{project.readiness.label}</DetailBadge>
                <DetailBadge tone={isSharedReadOnly ? "warning" : "default"}>{accessLabel}</DetailBadge>
                <DetailBadge>{project.specs.status}</DetailBadge>
                <DetailBadge>{project.parking.label}</DetailBadge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {overviewSpecs.map((fact) => (
                  <HeroFact key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
                ))}
              </div>

              {expertSignals.length > 0 ? (
                <div className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-4">
                  <div className="text-right text-[12px] font-black text-[var(--workspace-muted)]">قراءة الخبير العقاري</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {expertSignals.map((signal) => (
                      <div key={signal.label} className="rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 text-right">
                        <div className="text-[11px] font-bold text-[var(--workspace-muted)]">{signal.label}</div>
                        <div className="mt-1 text-[13px] font-black text-foreground">{signal.value}</div>
                      </div>
                    ))}
                  </div>
                  {project.expert.comparisonNotes || project.expert.expertNotes ? (
                    <p className="mt-3 text-right text-[13px] leading-6 text-[var(--workspace-muted)]">
                      {project.expert.comparisonNotes || project.expert.expertNotes}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-5">
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--workspace-muted)]">Quick Actions</div>
                <h2 className="mt-2 text-lg font-black text-foreground">إجراءات المشروع</h2>
              </div>
              <div className="mt-5 grid gap-3">
                <ActionButton
                  icon={Eye}
                  variant="primary"
                  disabled={isPending}
                  href={`/ws/projects/${project.id}/analytics`}
                  onClick={() => {
                    void onTrackProjectEvent?.({
                      eventType: "project_analyze_click",
                      source: "project_detail_header",
                    });
                  }}
                >
                  تحليل المشروع
                </ActionButton>

                {project.canEdit ? (
                  <ActionButton
                    icon={PencilLine}
                    disabled={isPending}
                    href={`/ws/projects/${project.id}/edit`}
                    onClick={() => {
                      void onTrackProjectEvent?.({
                        eventType: "project_edit_click",
                        source: "project_detail_header",
                      });
                    }}
                  >
                    تعديل المشروع
                  </ActionButton>
                ) : null}

                {project.canEdit && project.publicationState === "draft" && onPublishProject ? (
                  <ActionButton
                    icon={UploadCloud}
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
                  >
                    نشر المشروع
                  </ActionButton>
                ) : null}

                <ActionButton
                  icon={PlusCircle}
                  disabled={isPending}
                  href={`/ws/offers/create?propertyId=${project.id}&mode=open_offer`}
                  onClick={() => {
                    void onTrackProjectEvent?.({
                      eventType: "project_create_offer_click",
                      source: "project_detail_quick_actions",
                    });
                  }}
                >
                  إنشاء عرض
                </ActionButton>

                <ActionButton
                  icon={MessageSquareMore}
                  disabled={isPending}
                  href="/ws/inbox"
                  onClick={() => {
                    void onTrackProjectEvent?.({
                      eventType: "project_open_inbox_click",
                      source: "project_detail_quick_actions",
                    });
                  }}
                >
                  فتح المحادثات
                </ActionButton>

                {project.canEdit && onDeleteProject ? (
                  <ActionButton icon={Trash2} variant="danger" disabled={isPending} onClick={() => setDeleteOpen(true)}>
                    حذف المشروع
                  </ActionButton>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div data-slot="project-detail-main" className="grid gap-6 lg:grid-cols-[minmax(0,1.22fr)_minmax(280px,0.78fr)]">
          <div className="space-y-6">
            <ProjectMediaGallery images={project.galleryImages} title={project.title} />

            <SurfaceCard title="بيانات المشروع الأساسية" description="ترتيب واضح للبيانات التي يعود لها الفريق باستمرار أثناء المراجعة أو الإرسال.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {detailSpecs.map((fact) => (
                  <ProjectSpecCard
                    key={fact.label}
                    icon={fact.icon}
                    label={fact.label}
                    value={fact.value}
                    helper={fact.label === "المواقف" ? "حالة المواقف أو عددها وفق إعدادات المشروع." : undefined}
                  />
                ))}
                <ProjectSpecCard
                  icon={Eye}
                  label="حالة النشر"
                  value={publicationLabels[project.publicationState]}
                  helper="الوضع الحالي للمشروع داخل مساحة العمل والقنوات المرتبطة."
                />
              </div>
            </SurfaceCard>

            {project.units.length > 0 ? (
              <SurfaceCard title="الوحدات المرتبطة" description="الوحدات المتاحة أو المرتبطة بالمشروع كما تظهر للفريق داخل مساحة العمل.">
                <div className="grid gap-3 md:grid-cols-2">
                  {project.units.map((unit) => (
                    <ProjectUnitCard
                      key={unit.id}
                      label={unit.label}
                      bedrooms={unit.bedrooms}
                      bathrooms={unit.bathrooms}
                      area={unit.area}
                      priceLabel={unit.priceLabel}
                    />
                  ))}
                </div>
              </SurfaceCard>
            ) : null}

            {project.brokers.length > 0 ? (
              <SurfaceCard title="الوسطاء المرتبطون" description="الجهات أو الوسطاء الذين يتحركون حالياً على المشروع أو لديهم علاقة مباشرة به.">
                <div className="grid gap-3 md:grid-cols-2">
                  {project.brokers.map((broker) => (
                    <ProjectBrokerCard
                      key={broker.id}
                      name={broker.name}
                      title={broker.title}
                      clientName={broker.clientName}
                      summary={broker.summary}
                    />
                  ))}
                </div>
              </SurfaceCard>
            ) : null}

            <SurfaceCard title="الملخص التنفيذي" description="القراءة السريعة التي تشرح المشروع قبل الدخول إلى التفاصيل التشغيلية.">
              <p className="text-[14px] leading-7 text-foreground">{summary}</p>
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

            <SurfaceCard title="الوصف الكامل" description="الوصف المرجعي الذي يمكن الاعتماد عليه عند المراجعة أو الإرسال.">
              <p className="whitespace-pre-wrap text-[14px] leading-7 text-muted-foreground">{project.summary}</p>
            </SurfaceCard>

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
            <SurfaceCard title="لوحة المشروع" description="ملخص تشغيلي سريع يوضح كيف يقف المشروع الآن داخل مساحة العمل.">
              <div className="grid gap-3">
                {projectSignals.map((signal) => (
                  <ProjectSpecCard
                    key={signal.label}
                    icon={signal.icon}
                    label={signal.label}
                    value={signal.value}
                    helper={signal.helper}
                  />
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard title="الحالة الحالية" description="حالة الوصول والظهور والجهات المرتبطة بهذا المشروع حالياً.">
              <div className="space-y-3">
                <FactRow icon={Eye} label="مستوى الظهور" value={visibilityLabel} />
                <FactRow icon={Users} label="الوصول الحالي" value={accessLabel} />
                <FactRow icon={Users} label="المشاهِدون" value={viewerCountLabel} />
                <FactRow icon={Building2} label="الوحدات" value={project.units.length > 0 ? `${project.units.length} وحدة` : "بدون وحدات"} />
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
