"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Grid2x2,
  MapPin,
  MessageSquareMore,
  MoreHorizontal,
  PencilLine,
  PlusCircle,
  Rows3,
  Ruler,
  Tag,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AgDeleteConfirmModal } from "@/app/(ws)/ws/public";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkspaceProject } from "../../types/projectTypes";
import ProjectMediaGallery from "./ProjectMediaGallery";
import type { ProjectMutationActionResult } from "../ProjectsPage/actionTypes";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";

const publicationLabels: Record<WorkspaceProject["publicationState"], string> = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
};

const priceComparisonLabels: Record<string, string> = {
  below_market: "أقل من السوق",
  fair_market: "سعر عادل",
  above_market: "أعلى من السوق",
  unknown: "غير محدد",
};

const unitStatusLabels: Record<string, string> = {
  available: "متاحة",
  reserved: "محجوزة",
  sold: "مباعة",
  draft: "مسودة",
};

const unitStatusTone: Record<string, string> = {
  available: "border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  reserved: "border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300",
  sold: "border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300",
  draft: "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)]",
};

type ProjectDetailMode = "overview" | "units" | "media";

const emptyValueTokens = new Set([
  "",
  "غير محدد",
  "غير محددة",
  "غير مضاف",
  "غير مضافة",
  "غير مصنفة",
  "يتم تحديدها داخل المشروع",
]);

function hasRealText(value?: string | null) {
  if (!value) return false;
  return !emptyValueTokens.has(value.trim());
}

function buildHeroFacts(project: WorkspaceProject) {
  const unitMix = project.expert.productMix || project.expert.primaryUnitType;
  return [
    hasRealText(project.location) ? { label: "الموقع", value: project.location, icon: MapPin } : null,
    hasRealText(project.priceLabel) ? { label: "متوسط السعر", value: project.priceLabel, icon: Ruler } : null,
    hasRealText(unitMix) ? { label: "أنواع الوحدات", value: unitMix as string, icon: Building2 } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof MapPin }>;
}

function ProjectActionsMenu({
  project,
  isPending,
  onPublish,
  onDelete,
  onTrackProjectEvent,
}: {
  project: WorkspaceProject;
  isPending: boolean;
  onPublish?: () => void;
  onDelete?: () => void;
  onTrackProjectEvent?: (input: {
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<{ ok: true }>;
}) {
  const itemClassName = "flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] font-black text-foreground focus:bg-[var(--workspace-elevated)]";
  const hiddenLabels = [
    "تحليل المشروع",
    project.canEdit ? "تعديل المشروع" : null,
    project.canEdit && project.publicationState === "draft" && onPublish ? "نشر المشروع" : null,
    "إنشاء عرض",
    "فتح المحادثات",
    project.canEdit && onDelete ? "حذف المشروع" : null,
  ].filter(Boolean).join(" ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <button
            type="button"
            disabled={isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--workspace-panel)_78%,transparent)] text-foreground shadow-sm backdrop-blur-xl transition hover:bg-[var(--workspace-panel)] disabled:opacity-60"
            aria-label="إجراءات المشروع"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{hiddenLabels}</span>
          </button>
        )}
      />
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(21rem,calc(100vw-1rem))] min-w-0 rounded-[18px] bg-[var(--workspace-panel)] p-2 shadow-2xl ring-1 ring-black/5"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2 text-right text-[11px] font-black text-[var(--workspace-muted)]">
            إجراءات المشروع
          </DropdownMenuLabel>
          <DropdownMenuItem
            render={<Link href={`/ws/projects/${project.id}/analytics`} />}
            className={itemClassName}
            onClick={() => {
              void onTrackProjectEvent?.({ eventType: "project_analyze_click", source: "project_detail_top_nav" });
            }}
          >
            <span className="min-w-0 flex-1">تحليل المشروع</span>
            <BarChart3 className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
          {project.canEdit ? (
            <DropdownMenuItem
              render={<Link href={`/ws/projects/${project.id}/edit`} data-testid="project-detail-edit" />}
              className={itemClassName}
              onClick={() => {
                void onTrackProjectEvent?.({ eventType: "project_edit_click", source: "project_detail_top_nav" });
              }}
            >
              <span className="min-w-0 flex-1">تعديل المشروع</span>
              <PencilLine className="h-4 w-4 text-[var(--workspace-muted)]" />
            </DropdownMenuItem>
          ) : null}
          {project.canEdit && project.publicationState === "draft" && onPublish ? (
            <DropdownMenuItem nativeButton render={<button type="button" data-testid="project-detail-publish" />} className={itemClassName} onClick={onPublish}>
              <span className="min-w-0 flex-1">نشر المشروع</span>
              <UploadCloud className="h-4 w-4 text-[var(--workspace-muted)]" />
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="my-2 bg-[var(--workspace-border)]" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href={`/ws/offers/create?propertyId=${project.propertyId}&mode=open_offer`} />}
            className={itemClassName}
            onClick={() => {
              void onTrackProjectEvent?.({ eventType: "project_create_offer_click", source: "project_detail_top_nav" });
            }}
          >
            <span className="min-w-0 flex-1">إنشاء عرض</span>
            <PlusCircle className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/ws/inbox" />}
            className={itemClassName}
            onClick={() => {
              void onTrackProjectEvent?.({ eventType: "project_open_inbox_click", source: "project_detail_top_nav" });
            }}
          >
            <span className="min-w-0 flex-1">فتح المحادثات</span>
            <MessageSquareMore className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {project.canEdit && onDelete ? (
          <>
            <DropdownMenuSeparator className="my-2 bg-[var(--workspace-border)]" />
            <DropdownMenuGroup>
              <DropdownMenuItem nativeButton render={<button type="button" data-testid="project-detail-delete" />} className="flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] font-black text-rose-700 focus:bg-rose-500/10 dark:text-rose-300" onClick={onDelete}>
                <span className="min-w-0 flex-1">حذف المشروع</span>
                <Trash2 className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProjectUnitCard({
  projectId,
  id,
  label,
  status,
  unitKind,
  bedrooms,
  bathrooms,
  area,
  floor,
  view,
  priceLabel,
}: {
  projectId: string;
  id: string;
  label: string;
  status?: string;
  unitKind?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  floor?: string;
  view?: string;
  priceLabel?: string;
}) {
  const statusLabel = status ? unitStatusLabels[status] ?? status : "غير مصنفة";
  const tone = unitStatusTone[status ?? "draft"] ?? unitStatusTone.draft;
  const metaChips = [
    typeof bedrooms === "number" ? `${bedrooms} غرف` : null,
    typeof bathrooms === "number" ? `${bathrooms} حمامات` : null,
    area ?? null,
  ].filter(Boolean) as string[];
  const secondaryMeta = [
    floor ? `الدور ${floor}` : null,
    view ? `الإطلالة ${view}` : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/ws/projects/${projectId}/units/${id}`}
      className="group block border-b border-[color:color-mix(in_srgb,var(--workspace-border)_55%,transparent)] py-4 text-right transition hover:border-foreground/30"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.9fr)_minmax(150px,0.55fr)] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-bold text-[var(--workspace-muted)]">
              {unitKind === "unit_type" ? "نموذج وحدة" : "وحدة مستقلة"}
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${tone}`}>
              {statusLabel}
            </span>
          </div>
          <div className="mt-2 text-[17px] font-black text-foreground">{label}</div>
          {metaChips.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {metaChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-[var(--workspace-elevated)] px-3 py-1.5 text-[12px] font-bold text-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 lg:justify-center">
          {secondaryMeta.length > 0 ? (
            secondaryMeta.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[var(--workspace-elevated)] px-3 py-1.5 text-[12px] font-bold text-foreground">
                <Tag className="h-3.5 w-3.5 text-[var(--workspace-muted)]" />
                {item}
              </span>
            ))
          ) : (
            <span className="text-[12px] font-bold text-[var(--workspace-muted)]">بدون تفاصيل إضافية</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <span className="text-[19px] font-black text-foreground">{priceLabel ?? "السعر غير مضاف"}</span>
          <span className="inline-flex items-center rounded-full bg-[var(--workspace-elevated)] px-3 py-1 text-[11px] font-black text-foreground">
            فتح الوحدة
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProjectStatStrip({
  facts,
}: {
  facts: Array<{ label: string; value: string; icon: typeof MapPin }>;
}) {
  if (facts.length === 0) return null;

  return (
    <section data-slot="project-detail-hero" className="grid gap-4 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pb-6 text-right md:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label} className="space-y-2">
          <div className="flex justify-end text-[var(--workspace-muted)]">
            <fact.icon className="h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-foreground">{fact.value}</div>
          <div className="text-[12px] font-black text-[var(--workspace-muted)]">{fact.label}</div>
        </div>
      ))}
    </section>
  );
}

function ProjectViewSelector({
  activeMode,
  projectId,
  modes,
}: {
  activeMode: ProjectDetailMode;
  projectId: string;
  modes: ProjectDetailMode[];
}) {
  const options: Array<{
    mode?: ProjectDetailMode;
    href?: string;
    title: string;
  }> = [
    modes.includes("overview") ? { mode: "overview", href: `/ws/projects/${projectId}` , title: "نظرة عامة" } : null,
    modes.includes("units") ? { mode: "units", href: `/ws/projects/${projectId}?tab=units`, title: "الوحدات" } : null,
    modes.includes("media") ? { mode: "media", href: `/ws/projects/${projectId}?tab=media`, title: "الصور" } : null,
    { href: `/ws/projects/${projectId}/analytics`, title: "التحليلات" },
  ].filter(Boolean) as Array<{ mode?: ProjectDetailMode; href?: string; title: string }>;

  return (
    <div className="flex min-w-0 items-center gap-5 overflow-x-auto px-1" role="tablist" aria-label="Project sections">
        {options.map((option) => {
          const active = option.mode ? activeMode === option.mode : false;
          const className = `relative whitespace-nowrap py-3 text-[13px] font-black transition ${
            active ? "text-foreground" : "text-[var(--workspace-muted)] hover:text-foreground"
          }`;
          const underline = active ? <motion.span layoutId="project-detail-top-tab" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground" /> : null;
          return option.href ? (
            <Link key={option.title} href={option.href} className={className} role={option.mode ? "tab" : undefined} aria-selected={option.mode ? active : undefined}>
              {option.title}
              {underline}
            </Link>
          ) : (
            <span key={option.title} className={className}>
              {option.title}
              {underline}
            </span>
          );
        })}
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
  const searchParams = useSearchParams();
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const summary = project.shortDescription || project.summary;
  const visibilityLabel =
    project.visibility.clientVisibility === "public" ? "مرئي للعميل والـ AI" : "داخلي داخل مساحة العمل";
  const accessLabel = project.accessMode === "shared" ? "مشاهدة فقط" : "إدارة المشروع";
  const overviewSpecs = buildHeroFacts(project);
  const expertSignals = [
    hasRealText(project.expert.projectScale) ? { label: "عدد الوحدات التقريبي", value: project.expert.projectScale as string } : null,
    hasRealText(project.expert.productMix) ? { label: "أنواع الوحدات", value: project.expert.productMix as string } : null,
    hasRealText(project.expert.primaryUnitType) ? { label: "الوحدة الرئيسية", value: project.expert.primaryUnitType as string } : null,
    hasRealText(project.expert.expertNotes) ? { label: "العميل المستهدف", value: project.expert.expertNotes as string } : null,
    project.expert.services.length > 0 ? { label: "الخدمات", value: project.expert.services.join("، ") } : null,
    hasRealText(project.expert.priceComparison) ? { label: "قراءة السعر", value: priceComparisonLabels[project.expert.priceComparison as string] ?? project.expert.priceComparison as string } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;
  const hasSummary = hasRealText(summary);
  const fullSummary = hasRealText(project.summary) && project.summary !== summary ? project.summary : null;
  const hasOverview = hasSummary || expertSignals.length > 0 || project.amenities.length > 0 || overviewSpecs.length > 0;
  const availableModes = useMemo<ProjectDetailMode[]>(() => {
    const modes: ProjectDetailMode[] = [];
    if (hasOverview) modes.push("overview");
    if (project.units.length > 0) modes.push("units");
    if (project.galleryImages.length > 0) modes.push("media");
    return modes.length > 0 ? modes : ["overview"];
  }, [hasOverview, project.galleryImages.length, project.units.length]);
  const requestedMode = searchParams.get("tab");
  const normalizedRequestedMode: ProjectDetailMode | null =
    requestedMode === "overview" || requestedMode === "units" || requestedMode === "media"
      ? requestedMode
      : null;
  const activeMode: ProjectDetailMode =
    normalizedRequestedMode
      ? (availableModes.includes(normalizedRequestedMode) ? normalizedRequestedMode : availableModes[0])
      : availableModes[0];
  useEffect(() => {
    void onTrackProjectEvent?.({
      eventType: "project_detail_view",
      source: "project_detail_page",
    });
  }, [onTrackProjectEvent, project.id]);

  const publishProject = project.canEdit && project.publicationState === "draft" && onPublishProject
    ? () =>
        startTransition(async () => {
          setActionError(null);
          const result = await onPublishProject();
          if (!result.ok) {
            setActionError(result.message);
            return;
          }
          router.refresh();
        })
    : undefined;

  return (
    <div className="min-h-full bg-background pb-24">
      <div className="sticky top-0 z-40 border-b border-black/5 bg-background/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/ws/projects" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-elevated)] hover:text-foreground" aria-label="العودة للمشاريع">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-right text-[15px] font-black text-foreground">{project.title}</div>
            <ProjectViewSelector activeMode={activeMode} projectId={project.id} modes={availableModes} />
          </div>
          <ProjectActionsMenu
            project={project}
            isPending={isPending}
            onPublish={publishProject}
            onDelete={project.canEdit && onDeleteProject ? () => setDeleteOpen(true) : undefined}
            onTrackProjectEvent={onTrackProjectEvent}
          />
        </div>
      </div>

      <ProjectMediaGallery
        images={project.galleryImages}
        title={project.title}
        badges={[
          visibilityLabel,
          accessLabel,
          project.readiness.label,
        ]}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-8">
        <div className="sr-only">لوحة المشروع</div>

        {actionError ? (
          <div className="rounded-[22px] bg-rose-500/10 px-5 py-4 text-right text-[13px] font-black text-rose-700">
            {actionError}
          </div>
        ) : null}

        {!project.readiness.canPublish ? (
          <div className="border-b border-amber-500/20 pb-4 text-right text-[13px] font-black text-amber-700 dark:text-amber-300">
            حالة الجاهزية: {project.readiness.label}. لن يظهر المشروع في البحث العام أو قنوات الذكاء الاصطناعي حتى تكتمل متطلبات السوق السعودي.
          </div>
        ) : null}

        {activeMode !== "media" ? <ProjectStatStrip facts={overviewSpecs} /> : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeMode === "overview" ? (
              <div data-slot="project-detail-main" className="space-y-12">
                {hasSummary ? (
                  <section className="space-y-4 text-right">
                    <div className="text-[12px] font-black text-[var(--workspace-muted)]">ملخص المشروع</div>
                    <p className="max-w-4xl text-[24px] font-black leading-10 text-foreground">{summary}</p>
                    {fullSummary ? (
                      <p className="max-w-4xl whitespace-pre-wrap text-[15px] leading-8 text-muted-foreground">{fullSummary}</p>
                    ) : null}
                  </section>
                ) : null}

                {expertSignals.length > 0 ? (
                  <section className="space-y-5 text-right">
                    <h2 className="text-2xl font-black tracking-normal text-foreground">بيانات المشروع</h2>
                    <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
                      {expertSignals.map((signal) => (
                        <div key={signal.label} className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_42%,transparent)] py-4">
                          <div className="text-[12px] font-black text-[var(--workspace-muted)]">{signal.label}</div>
                          <div className="mt-1 text-[17px] font-black text-foreground">{signal.value}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {project.amenities.length > 0 ? (
                  <section className="space-y-5 text-right">
                    <h2 className="text-2xl font-black tracking-normal text-foreground">خيارات إضافية</h2>
                    <div className="flex flex-wrap justify-end gap-2">
                      {project.amenities.map((amenity) => (
                        <span key={amenity} className="rounded-full bg-[var(--workspace-elevated)] px-4 py-2 text-[12px] font-black text-foreground">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {!hasSummary && expertSignals.length === 0 && project.amenities.length === 0 && overviewSpecs.length === 0 ? (
                  <div className="py-10 text-center text-[13px] font-black text-muted-foreground">
                    لا توجد بيانات مشروع كافية للعرض الآن.
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeMode === "units" ? (
              <section data-slot="project-detail-units" className="space-y-5 text-right">
                <div className="flex items-center justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pb-4">
                  <div className="flex items-center gap-2 text-[var(--workspace-muted)]">
                    <Rows3 className="h-4 w-4" />
                    <span className="text-[12px] font-black">{project.units.length} عناصر</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-normal text-foreground">الوحدات</h2>
                </div>
                {project.units.length > 0 ? (
                  <div className="divide-y divide-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)]">
                    {project.units.map((unit) => (
                      <ProjectUnitCard
                        key={unit.id}
                        projectId={project.id}
                        id={unit.id}
                        label={unit.label}
                        status={unit.status}
                        unitKind={unit.unitKind}
                        bedrooms={unit.bedrooms}
                        bathrooms={unit.bathrooms}
                        area={unit.area}
                        floor={unit.floor}
                        view={unit.view}
                        priceLabel={unit.priceLabel}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center text-[13px] font-black text-muted-foreground">
                    لا توجد وحدات مرتبطة بهذا المشروع حتى الآن.
                  </div>
                )}
                {project.canEdit ? (
                  <div className="flex justify-center border-t border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pt-6">
                    <Link
                      href={`/ws/projects/${project.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-[13px] font-black text-background transition hover:opacity-90"
                    >
                      <PlusCircle className="h-4 w-4" />
                      إضافة وحدة داخل المشروع
                    </Link>
                  </div>
                ) : null}
              </section>
            ) : null}

            {activeMode === "media" ? (
              <section className="space-y-5 text-right">
                <div className="flex items-center justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pb-4">
                  <div className="flex items-center gap-2 text-[var(--workspace-muted)]">
                    <Grid2x2 className="h-4 w-4" />
                    <span className="text-[12px] font-black">{project.galleryImages.length} صور</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-normal text-foreground">الصور</h2>
                </div>
                <div className="grid auto-rows-[180px] gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {project.galleryImages.map((image, index) => (
                    <div
                      key={image.key}
                      className={`overflow-hidden rounded-[26px] bg-[var(--workspace-elevated)] ${
                        index === 0 ? "md:col-span-2 md:row-span-2" : index === 3 ? "xl:row-span-2" : ""
                      }`}
                    >
                      <img src={image.url} alt={image.name || project.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

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
