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
  archived: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
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
    <div className="min-h-full bg-[#f6f3ee] px-4 py-6 text-right dark:bg-slate-950 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-none sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-stone-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${publicationTone[project.publicationState]}`}
                >
                  {publicationLabels[project.publicationState]}
                </span>
                <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {isSharedReadOnly ? "مشاهدة مشتركة" : "إدارة المشروع"}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </span>
                <span className="text-slate-300">•</span>
                <span>{project.priceLabel}</span>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{summary}</p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/ws/inbox"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-stone-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
              >
                <MessageSquareMore className="h-4 w-4" />
                فتح المحادثات
              </Link>
              {project.canEdit ? (
                <Link
                  href={`/ws/projects/${project.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-stone-500 hover:text-stone-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-slate-100"
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
              <section className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                <div className="text-xs font-black tracking-[0.16em] text-stone-500 dark:text-slate-400">ملخص سريع</div>
                <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{project.summary}</p>
              </section>

              <section className="rounded-[24px] border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-xs font-black tracking-[0.16em] text-stone-500 dark:text-slate-400">حقائق المشروع</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {factItems.map((fact) => (
                    <div
                      key={fact.label}
                      className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-slate-400">
                        <fact.icon className="h-4 w-4" />
                        {fact.label}
                      </div>
                      <div className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">{fact.value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {project.amenities.length > 0 ? (
                <section className="rounded-[24px] border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs font-black tracking-[0.16em] text-stone-500 dark:text-slate-400">المزايا والخدمات</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-semibold text-stone-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
          <section className="rounded-[28px] border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-slate-100">الوصف الكامل</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{project.summary}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="text-xs font-black tracking-[0.16em] text-stone-500 dark:text-slate-400">الوصول والتصاريح</div>
            {project.permit.canShowPrivatePanel ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <div className="text-sm font-black text-emerald-900 dark:text-emerald-200">تصريح خاص بهذه المحادثة</div>
                  <p className="mt-2 text-sm leading-6 text-emerald-900/85 dark:text-emerald-200/85">
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
                        className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-stone-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {file.name}
                        </span>
                        <ArrowLeft className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {isSharedReadOnly
                  ? "تمت مشاركة هذا المشروع للقراءة فقط. أي مستندات خاصة إضافية تظهر فقط عندما تكون مرفقة بالمحادثة المصرح بها."
                  : "المستندات الخاصة لا تظهر هنا بشكل عام. إذا تمت مشاركتها مع طرف محدد فستظهر له فقط من خلال رابط المشروع القادم من المحادثة."}
              </div>
            )}
          </section>
        </section>

        <section className="rounded-[28px] border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-slate-100">الوحدات المعروضة</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">تفاصيل الوحدات المرتبطة بهذا المشروع.</p>
            </div>
          </div>
          {project.units.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {project.units.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-black text-slate-950 dark:text-slate-100">{unit.label}</div>
                    <div className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-black text-stone-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      {unit.priceLabel}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
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
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              لا توجد وحدات مفصلة حالياً.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
