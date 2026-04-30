"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarClock,
  ChevronDown,
  Eye,
  FileText,
  MapPin,
  MessageSquareMore,
  MoreHorizontal,
  Ruler,
  ShieldCheck,
  Trash2,
  WalletCards,
} from "lucide-react";
import { AgDeleteConfirmModal } from "@/app/(ws)/ws/public";
import { LocationPreview } from "@anan/location-map/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkspaceProjectUnitDetail } from "../../types/projectTypes";
import type { ProjectMutationActionResult } from "../ProjectsPage/actionTypes";
import { PROJECT_SUMMARY_MAX_CHARS, truncateProjectText } from "../../shared/lib/projectUi";

type UnitDetailTab = "summary" | "details" | "media";

const statusLabels: Record<string, string> = {
  available: "متاحة",
  reserved: "محجوزة",
  sold: "مباعة",
  draft: "مسودة",
};

const tabs: Array<{ value: UnitDetailTab; label: string }> = [
  { value: "summary", label: "الملخص" },
  { value: "details", label: "البيانات" },
  { value: "media", label: "الصور" },
];

const actionItemClassName =
  "flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] font-black text-foreground focus:bg-[var(--workspace-elevated)]";
const UNIT_DETAIL_VALUE_MAX_CHARS = 72;

function formatHandover(value?: number) {
  if (!value) return "غير محدد";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" }).format(new Date(value));
}

function UnitMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards;
  label: string;
  value: string;
}) {
  return (
    <div className="border-l border-[color:var(--workspace-border)] px-4 py-3 text-right last:border-l-0">
      <Icon className="mb-3 mr-auto h-4 w-4 text-[var(--workspace-muted)]" />
      <div className="text-[11px] font-black text-[var(--workspace-muted)]">{label}</div>
      <div className="mt-1 truncate text-xl font-black text-foreground" title={value}>
        {value}
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  const [expanded, setExpanded] = useState(false);
  const normalizedValue = value.trim();
  const canExpand = normalizedValue.length > UNIT_DETAIL_VALUE_MAX_CHARS;
  const visibleValue = expanded ? normalizedValue : truncateProjectText(normalizedValue, UNIT_DETAIL_VALUE_MAX_CHARS);

  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-b border-[color:var(--workspace-border)] py-3 text-right last:border-b-0">
      <span className="text-[12px] font-bold text-[var(--workspace-muted)]">{label}</span>
      <div className="min-w-0">
        <span
          className={`block min-w-0 text-[13px] font-black text-foreground ${expanded ? "whitespace-pre-wrap leading-7" : "truncate"}`}
          title={value}
        >
          {visibleValue}
        </span>
        {canExpand ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="mt-1 text-[11px] font-black text-[var(--workspace-muted)] underline-offset-4 hover:text-foreground hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? "إخفاء" : "عرض المزيد"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DescriptionBlock({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false);
  const normalizedValue = value.trim();
  const canExpand = normalizedValue.length > PROJECT_SUMMARY_MAX_CHARS;
  const visibleValue = expanded ? normalizedValue : truncateProjectText(normalizedValue);

  return (
    <div className="mb-4 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 text-right">
      <div className="text-[12px] font-black text-[var(--workspace-muted)]">الوصف</div>
      <p className="mt-2 whitespace-pre-wrap text-[13px] font-black leading-7 text-foreground" title={value}>
        {visibleValue}
      </p>
      {canExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-3 inline-flex h-8 items-center rounded-full border border-[color:var(--workspace-border)] px-3 text-[11px] font-black text-foreground transition hover:bg-[var(--workspace-elevated)]"
          aria-expanded={expanded}
        >
          {expanded ? "إغلاق" : "عرض المزيد"}
        </button>
      ) : null}
    </div>
  );
}

function FlatSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-[color:var(--workspace-border)] pt-5">
      <h2 className="text-right text-base font-black text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function UnitActionsMenu({
  unit,
  canEdit,
  isPending,
  onDelete,
}: {
  unit: WorkspaceProjectUnitDetail;
  canEdit: boolean;
  isPending: boolean;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(
          <button
            type="button"
            disabled={isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--workspace-panel)] text-foreground transition hover:bg-[var(--workspace-elevated)] disabled:opacity-60"
            aria-label="إجراءات الوحدة"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      />
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(19rem,calc(100vw-1rem))] rounded-[18px] bg-[var(--workspace-panel)] p-2 shadow-2xl ring-1 ring-black/5"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-2 text-right text-[11px] font-black text-[var(--workspace-muted)]">
            إجراءات الوحدة
          </DropdownMenuLabel>
          {canEdit ? (
            <DropdownMenuItem render={<Link href={`/ws/projects/${unit.projectId}/units/${unit.id}/edit`} />} className={actionItemClassName}>
              <span className="min-w-0 flex-1">تعديل الوحدة</span>
              <FileText className="h-4 w-4 text-[var(--workspace-muted)]" />
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem render={<Link href="/ws/inbox" />} className={actionItemClassName}>
            <span className="min-w-0 flex-1">فتح محادثة</span>
            <MessageSquareMore className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/ws/projects/${unit.projectId}/analytics`} />} className={actionItemClassName}>
            <span className="min-w-0 flex-1">أداء المشروع</span>
            <Eye className="h-4 w-4 text-[var(--workspace-muted)]" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {canEdit ? (
          <>
            <DropdownMenuSeparator className="my-2 bg-[var(--workspace-border)]" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                nativeButton
                render={<button type="button" />}
                className="flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-3 py-2.5 text-right text-[13px] font-black text-rose-300 focus:bg-rose-500/10"
                onClick={onDelete}
              >
                <span className="min-w-0 flex-1">حذف الوحدة</span>
                <Trash2 className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * WHY:   Unit detail is an operations screen, so it should be flat, scannable, and action-safe.
 * WHAT:  Renders unit identity, metrics, local tabs, expandable details, media, and one dropdown action menu.
 * HOW:   Keeps all hooks top-level and all navigation as links except delete recovery.
 */
export default function UnitDetailPage({
  unit,
  canEdit = false,
  onDeleteUnit,
}: {
  unit: WorkspaceProjectUnitDetail;
  canEdit?: boolean;
  onDeleteUnit?: () => Promise<ProjectMutationActionResult>;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UnitDetailTab>("summary");
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const statusLabel = statusLabels[unit.status ?? ""] ?? unit.status ?? "غير محدد";
  const heroImage = unit.galleryImages[0]?.url ?? unit.projectImage;
  const gallery = unit.galleryImages.length > 0 ? unit.galleryImages.slice(0, 6) : [{ key: "project-cover", url: unit.projectImage, name: unit.projectTitle }];
  const unitKindLabel = unit.unitKind === "unit_type" ? "نموذج وحدة" : "وحدة مستقلة";
  const unitLocation = unit.locationDetails ?? unit.projectLocationDetails;
  const canExpandSummary = unit.summary.trim().length > PROJECT_SUMMARY_MAX_CHARS;
  const summaryText = showFullSummary ? unit.summary.trim() : truncateProjectText(unit.summary);
  const metrics = [
    { icon: WalletCards, label: "السعر", value: unit.priceLabel ?? "غير محدد" },
    { icon: Ruler, label: "المساحة", value: unit.area ?? "غير محدد" },
    { icon: BedDouble, label: "الغرف", value: typeof unit.bedrooms === "number" ? `${unit.bedrooms} غرف` : "غير محدد" },
    { icon: Bath, label: "الحمامات", value: typeof unit.bathrooms === "number" ? `${unit.bathrooms} حمامات` : "غير محدد" },
  ];
  const primaryFacts = [
    { label: "المشروع", value: unit.projectTitle },
    { label: "الموقع", value: unitLocation?.label ?? unit.projectLocation },
    { label: "الإطلالة", value: unit.view ?? "غير محدد" },
    { label: "الدور", value: unit.floor ?? "غير محدد" },
    { label: "خطة الدفع", value: unit.paymentPlanLabel ?? "غير محدد" },
    { label: "الجاهزية", value: unit.readinessLabel },
  ];
  const extraFacts = [
    { label: "التسليم", value: formatHandover(unit.handoverAt) },
    { label: "الامتثال", value: unit.complianceLabel ?? "غير محدد" },
    { label: "رخصة الإعلان", value: unit.adLicenseLabel ?? "غير محدد" },
  ];

  return (
    <main className="min-h-full bg-background pb-24" dir="rtl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--workspace-border)] pb-4">
          <Link
            href={`/ws/projects/${unit.projectId}/units`}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-3 text-[12px] font-black text-foreground transition hover:bg-[var(--workspace-elevated)]"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للوحدات
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--workspace-panel)] px-3 py-1 text-[11px] font-black text-foreground">{unitKindLabel}</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-300">{statusLabel}</span>
            <UnitActionsMenu
              unit={unit}
              canEdit={Boolean(canEdit && onDeleteUnit)}
              isPending={isPending}
              onDelete={() => setDeleteOpen(true)}
            />
          </div>
        </div>

        {actionError ? (
          <div className="border-y border-rose-500/25 bg-rose-500/10 px-4 py-3 text-right text-[13px] font-black text-rose-300">
            {actionError}
          </div>
        ) : null}

        <section className="grid gap-5 border-b border-[color:var(--workspace-border)] pb-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-xl bg-[var(--workspace-panel)]">
            <img src={heroImage} alt={unit.label} className="aspect-[4/3] h-full w-full object-cover" />
          </div>
          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-2 text-[12px] font-bold text-[var(--workspace-muted)]">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{unitLocation?.label ?? unit.projectLocation}</span>
            </div>
            <h1 className="mt-2 truncate text-3xl font-black tracking-tight text-foreground" title={unit.label}>
              {unit.label}
            </h1>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-muted-foreground" title={unit.summary}>
              {summaryText}
            </p>
            {canExpandSummary ? (
              <button
                type="button"
                onClick={() => setShowFullSummary((current) => !current)}
                className="mt-2 text-[12px] font-black text-foreground underline-offset-4 hover:underline"
                aria-expanded={showFullSummary}
              >
                {showFullSummary ? "إخفاء الوصف" : "عرض الوصف كاملاً"}
              </button>
            ) : null}
            <div className="mt-5 grid border-y border-[color:var(--workspace-border)] sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <UnitMetric key={metric.label} {...metric} />
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-2 border-b border-[color:var(--workspace-border)] pb-3" dir="rtl">
          {tabs.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`h-9 px-1 text-[12px] font-black transition ${
                  active ? "border-b-2 border-foreground text-foreground" : "text-[var(--workspace-muted)] hover:text-foreground"
                }`}
              >
                <span className="px-3">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "summary" ? (
          <FlatSection title="ملخص الوحدة">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <DescriptionBlock value={unit.summary} />
                <div className="mb-4">
                  <LocationPreview value={unitLocation} title="موقع الوحدة" compact />
                </div>
                {primaryFacts.map((fact) => (
                  <DataRow key={fact.label} label={fact.label} value={fact.value} />
                ))}
                {showMoreDetails ? extraFacts.map((fact) => <DataRow key={fact.label} label={fact.label} value={fact.value} />) : null}
                <button
                  type="button"
                  onClick={() => setShowMoreDetails((current) => !current)}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-[color:var(--workspace-border)] px-4 text-[12px] font-black text-foreground transition hover:bg-[var(--workspace-elevated)]"
                  aria-expanded={showMoreDetails}
                >
                  {showMoreDetails ? "إخفاء التفاصيل" : "تفاصيل أكثر"}
                  <ChevronDown className={`h-4 w-4 transition ${showMoreDetails ? "rotate-180" : ""}`} />
                </button>
              </div>
              <div className="border-t border-[color:var(--workspace-border)] pt-4 text-right lg:border-t-0 lg:border-r lg:pr-5">
                <div className="flex items-center justify-end gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h2 className="text-base font-black text-foreground">قراءة سريعة</h2>
                </div>
                <p className="mt-3 text-[13px] leading-7 text-muted-foreground">
                  {unit.priceLabel && unit.area
                    ? "السعر والمساحة واضحان. الوحدة جاهزة للمقارنة أو الإرسال مع فريق المبيعات."
                    : "استكمل السعر والمساحة حتى تصبح الوحدة أكثر وضوحاً في المقارنة والعروض."}
                </p>
                <div className="mt-4 border-t border-[color:var(--workspace-border)] pt-4">
                  <CalendarClock className="mb-2 mr-auto h-4 w-4 text-[var(--workspace-muted)]" />
                  <div className="text-[11px] font-black text-[var(--workspace-muted)]">التسليم</div>
                  <div className="mt-1 text-[14px] font-black text-foreground">{formatHandover(unit.handoverAt)}</div>
                </div>
              </div>
            </div>
          </FlatSection>
        ) : null}

        {activeTab === "details" ? (
          <FlatSection title="كل البيانات">
            <DescriptionBlock value={unit.summary} />
            <div className="mb-5">
              <LocationPreview value={unitLocation} title="موقع الوحدة" compact />
            </div>
            <div className="grid gap-x-10 md:grid-cols-2">
              {[...primaryFacts, ...extraFacts].map((fact) => (
                <DataRow key={fact.label} label={fact.label} value={fact.value} />
              ))}
            </div>
          </FlatSection>
        ) : null}

        {activeTab === "media" ? (
          <FlatSection title="صور ومخططات الوحدة">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image) => (
                <a
                  key={image.key}
                  href={image.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-xl bg-[var(--workspace-panel)]"
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </a>
              ))}
            </div>
          </FlatSection>
        ) : null}
      </div>

      <AgDeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          if (!onDeleteUnit) return;
          startTransition(async () => {
            setActionError(null);
            const result = await onDeleteUnit();
            if (!result.ok) {
              setActionError(result.message);
              setDeleteOpen(false);
              return;
            }
            setDeleteOpen(false);
            router.push(`/ws/projects/${unit.projectId}/units`);
            router.refresh();
          });
        }}
        title={`حذف الوحدة: ${unit.label}`}
        description="سيتم حذف الوحدة من هذا المشروع فقط، ولن يتم حذف المشروع."
        confirmLabel="حذف الوحدة"
      />
    </main>
  );
}
