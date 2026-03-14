import Link from "next/link";
import PropertyCard from "../../../_components/Visuals/PropertyCard";
import type { WorkspaceProject } from "../projectTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";

/**
 * WHY:   Project detail should reflect the real persisted property without promising unsupported local broker controls.
 * WHAT:  Renders the project card, units, publication status, and links into the real collaboration surfaces.
 * HOW:   Uses shared property visuals and points users to team/inbox flows for collaboration tasks.
 */
export default function ProjectDetailPage({ project }: { project: WorkspaceProject }) {
  return (
    <div className="flex min-h-full flex-col pb-12">
      <ZonePageIntro eyebrow="تفاصيل المشروع" title={project.title} description={project.summary} />

      <div className="grid gap-8 px-6 py-6 lg:grid-cols-[1fr_0.4fr] lg:px-8 lg:py-8">
        <div className="space-y-8">
          <PropertyCard
            image={project.image}
            title={project.title}
            location={project.location}
            priceLabel={project.priceLabel}
            summary={project.summary}
            specs={[
              { label: "الغرف", value: project.specs.rooms },
              { label: "الحمامات", value: project.specs.baths },
              { label: "المساحة", value: project.specs.area },
              { label: "الحالة", value: project.specs.status },
            ]}
            brokers={project.brokers}
            density="flexible"
          />

          <section className="border border-slate-200 bg-white p-6">
            <h2 className="mb-6 text-xl font-black text-slate-950">الوحدات المعروضة</h2>
            {project.units.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {project.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="border-b-2 border-slate-900 pb-1 text-sm font-black text-slate-900">
                        {unit.label}
                      </span>
                      <span className="bg-blue-50 px-2 py-1 text-xs font-black tracking-widest text-blue-700">
                        {unit.priceLabel}
                      </span>
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold tracking-widest text-slate-500">
                      <span>{unit.bedrooms} نوم</span>
                      <span>{unit.bathrooms} دورة</span>
                      <span>{unit.area}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-500">لا توجد وحدات مفصلة حالياً.</div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6">
            <div className="text-xs font-black tracking-[0.22em] text-blue-700">حالة النشر</div>
            <div className="mt-2 text-2xl font-black text-slate-950">
              {project.publicationState === "published"
                ? "منشور"
                : project.publicationState === "draft"
                  ? "مسودة"
                  : "مؤرشف"}
            </div>
          </section>

          <section className="border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6">
            <div className="text-xs font-black tracking-[0.22em] text-blue-700">التعاون</div>
            <div className="mt-3 text-sm font-medium leading-6 text-slate-600">
              إدارة الوسطاء والدعوات تتم من الفريق والمحادثات الحقيقية حتى تبقى الملكية والتنبيهات متزامنة.
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/ws/settings/invite"
                className="inline-flex items-center justify-center border border-blue-600 bg-blue-600 px-4 py-3 text-[10px] font-black tracking-[0.18em] text-white transition hover:border-slate-950 hover:bg-slate-950"
              >
                دعوة عضو
              </Link>
              <Link
                href="/ws/inbox"
                className="inline-flex items-center justify-center border border-slate-200 bg-white px-4 py-3 text-[10px] font-black tracking-[0.18em] text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                فتح المحادثات
              </Link>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6">
            <div className="text-xs font-black tracking-[0.22em] text-slate-400">إجراءات</div>
            <div className="mt-4 grid gap-3">
              <Link
                href={`/ws/projects/${project.id}/edit`}
                className="inline-flex items-center justify-center border border-slate-200 bg-white px-4 py-3 text-[10px] font-black tracking-[0.18em] text-slate-700 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
              >
                تعديل المشروع
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
