"use client";

import { useState } from "react";
import { Building2, Grid2x2, MapPin, Ruler } from "lucide-react";
import { LocationPreview } from "@anan/location-map/react";
import ProjectMediaGallery from "../../pages/ProjectDetailPage/ProjectMediaGallery";
import type { WorkspaceProject } from "../../types/projectTypes";
import { PROJECT_SUMMARY_MAX_CHARS, truncateProjectText } from "../../shared/lib/projectUi";

const priceComparisonLabels: Record<string, string> = {
  below_market: "أقل من السوق",
  fair_market: "سعر عادل",
  above_market: "أعلى من السوق",
  unknown: "غير محدد",
};

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

function ProjectStatStrip({ facts }: { facts: Array<{ label: string; value: string; icon: typeof MapPin }> }) {
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

function ProjectGallerySection({ project }: { project: WorkspaceProject }) {
  if (project.galleryImages.length === 0) return null;

  return (
    <section className="space-y-5 text-right">
      <div className="flex items-center justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pb-4">
        <div className="flex items-center gap-2 text-[var(--workspace-muted)]">
          <Grid2x2 className="h-4 w-4" />
          <span className="text-[12px] font-black">{project.galleryImages.length} وسائط</span>
        </div>
        <h2 className="text-2xl font-black tracking-normal text-foreground">المعرض</h2>
      </div>
      <div className="grid auto-rows-[150px] gap-3 md:grid-cols-4">
        {project.galleryImages.slice(0, 5).map((image, index) => (
          <div
            key={image.key}
            className={`overflow-hidden rounded-lg bg-[var(--workspace-elevated)] ${
              index === 0 ? "md:col-span-2 md:row-span-2" : ""
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={image.name || project.title} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProjectDetailOverview({ project }: { project: WorkspaceProject }) {
  const [showFullSummary, setShowFullSummary] = useState(false);
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
  const canExpandSummary = summary.trim().length > PROJECT_SUMMARY_MAX_CHARS;
  const visibleSummary = showFullSummary ? summary.trim() : truncateProjectText(summary);

  return (
    <div data-slot="project-detail-main" className="space-y-12">
      <ProjectMediaGallery
        images={project.galleryImages}
        title={project.title}
        badges={[visibilityLabel, accessLabel, project.readiness.label]}
      />

      <ProjectStatStrip facts={overviewSpecs} />

      <LocationPreview value={project.locationDetails} title="موقع المشروع" />

      {hasSummary ? (
        <section className="space-y-4 text-right">
          <div className="text-[12px] font-black text-[var(--workspace-muted)]">ملخص المشروع</div>
          <p className="max-w-4xl text-[24px] font-black leading-10 text-foreground" title={summary}>
            {visibleSummary}
          </p>
          {canExpandSummary ? (
            <button
              type="button"
              onClick={() => setShowFullSummary((current) => !current)}
              className="text-[12px] font-black text-foreground underline-offset-4 hover:underline"
              aria-expanded={showFullSummary}
            >
              {showFullSummary ? "إخفاء الوصف" : "عرض الوصف كاملاً"}
            </button>
          ) : null}
          {fullSummary && showFullSummary ? (
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

      <ProjectGallerySection project={project} />

      {!hasSummary && expertSignals.length === 0 && project.amenities.length === 0 && overviewSpecs.length === 0 ? (
        <div className="py-10 text-center text-[13px] font-black text-muted-foreground">
          لا توجد بيانات مشروع كافية للعرض الآن.
        </div>
      ) : null}
    </div>
  );
}
