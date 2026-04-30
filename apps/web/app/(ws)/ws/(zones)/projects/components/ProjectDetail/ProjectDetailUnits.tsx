"use client";

import Link from "next/link";
import { Bath, BedDouble, Eye, Pencil, PlusCircle, Rows3, Ruler, Tag } from "lucide-react";
import { unitStatusLabels, unitStatusTone } from "../../shared/lib/projectUi";
import type { WorkspaceProject } from "../../types/projectTypes";

function UnitChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[var(--workspace-elevated)] px-3 text-[12px] font-black text-foreground">
      {children}
    </span>
  );
}

function ProjectUnitCard({
  projectId,
  id,
  canEdit,
  label,
  status,
  unitKind,
  bedrooms,
  bathrooms,
  area,
  floor,
  view,
  priceLabel,
  image,
}: {
  projectId: string;
  id: string;
  canEdit?: boolean;
  label: string;
  status?: string;
  unitKind?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  floor?: string;
  view?: string;
  priceLabel?: string;
  image: string;
}) {
  const statusLabel = status ? unitStatusLabels[status] ?? status : "غير مصنفة";
  const tone = unitStatusTone[status ?? "draft"] ?? unitStatusTone.draft;
  const metaChips = [
    typeof bedrooms === "number" ? { icon: BedDouble, label: `${bedrooms} غرف` } : null,
    typeof bathrooms === "number" ? { icon: Bath, label: `${bathrooms} حمامات` } : null,
    area ? { icon: Ruler, label: area } : null,
  ].filter(Boolean) as Array<{ icon: typeof BedDouble; label: string }>;
  const secondaryMeta = [floor ? `الدور ${floor}` : null, view ? `الإطلالة ${view}` : null].filter(Boolean) as string[];

  return (
    <article className="group overflow-hidden rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] transition hover:border-foreground/25 hover:bg-[var(--workspace-elevated)]">
      <Link href={`/ws/projects/${projectId}/units/${id}`} className="block">
        <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="relative min-h-36 overflow-hidden bg-[var(--workspace-elevated)] md:min-h-full">
            <img src={image} alt={label} className="h-full min-h-36 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <span className={`absolute right-3 top-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${tone}`}>
              {statusLabel}
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-5 p-4 text-right">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-black text-[var(--workspace-muted)]">
                  {unitKind === "unit_type" ? "نموذج وحدة" : "وحدة مستقلة"}
                </div>
                <h3 className="mt-1 truncate text-xl font-black text-foreground" title={label}>
                  {label}
                </h3>
              </div>
              <div className="shrink-0 text-left">
                <div className="text-[11px] font-black text-[var(--workspace-muted)]">السعر</div>
                <div className="mt-1 text-lg font-black text-foreground">{priceLabel ?? "غير مضاف"}</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {metaChips.map(({ icon: Icon, label: chip }) => (
                <UnitChip key={chip}>
                  <Icon className="h-3.5 w-3.5 text-[var(--workspace-muted)]" />
                  {chip}
                </UnitChip>
              ))}
              {secondaryMeta.length > 0 ? (
                secondaryMeta.map((item) => (
                  <UnitChip key={item}>
                    <Tag className="h-3.5 w-3.5 text-[var(--workspace-muted)]" />
                    {item}
                  </UnitChip>
                ))
              ) : (
                <span className="text-[12px] font-bold text-[var(--workspace-muted)]">بدون تفاصيل إضافية</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--workspace-border)] px-4 py-3">
        <Link
          href={`/ws/projects/${projectId}/units/${id}`}
          className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-foreground px-4 text-[12px] font-black text-background transition hover:bg-foreground/90"
        >
          <Eye className="h-4 w-4" />
          فتح الوحدة
        </Link>
        {canEdit ? (
          <Link
            href={`/ws/projects/${projectId}/units/${id}/edit`}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[color:var(--workspace-border)] px-4 text-[12px] font-black text-foreground transition hover:bg-[var(--workspace-elevated)]"
          >
            <Pencil className="h-4 w-4" />
            تعديل
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function ProjectDetailUnits({ project }: { project: WorkspaceProject }) {
  return (
    <section data-slot="project-detail-units" className="space-y-5 text-right">
      <div className="flex items-center justify-between gap-3 border-b border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pb-4">
        <div className="flex items-center gap-2 text-[var(--workspace-muted)]">
          <Rows3 className="h-4 w-4" />
          <span className="text-[12px] font-black">{project.units.length} عناصر</span>
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-normal text-foreground">الوحدات</h2>
          <p className="mt-1 text-[12px] font-bold text-[var(--workspace-muted)]">كل وحدة تظهر كأصل مستقل داخل المشروع.</p>
        </div>
      </div>
      {project.units.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {project.units.map((unit) => (
            <ProjectUnitCard
              key={unit.id}
              projectId={project.id}
              id={unit.id}
              canEdit={project.canEdit}
              label={unit.label}
              status={unit.status}
              unitKind={unit.unitKind}
              bedrooms={unit.bedrooms}
              bathrooms={unit.bathrooms}
              area={unit.area}
              floor={unit.floor}
              view={unit.view}
              priceLabel={unit.priceLabel}
              image={unit.floorPlanMedia?.[0]?.url ?? project.image}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] py-16 text-center text-[13px] font-black text-muted-foreground">
          لا توجد وحدات مرتبطة بهذا المشروع حتى الآن.
        </div>
      )}
      {project.canEdit ? (
        <div className="flex justify-center border-t border-[color:color-mix(in_srgb,var(--workspace-border)_45%,transparent)] pt-6">
          <Link
            href={`/ws/projects/${project.id}/units/create`}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-[13px] font-black text-background transition hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            إضافة وحدة داخل المشروع
          </Link>
        </div>
      ) : null}
    </section>
  );
}
