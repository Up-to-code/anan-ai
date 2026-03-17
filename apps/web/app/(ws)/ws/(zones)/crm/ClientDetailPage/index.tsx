import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BrandEmptyState from "../../../_components/WorkspaceBrand/BrandEmptyState";
import PersonCard, {
  brokerPresenceToPersonCard,
} from "../../../_components/Visuals/PersonCard";
import PropertyCard from "../../../_components/Visuals/PropertyCard";
import type { CrmClientRecord } from "../crmTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";

const STAGE_LABELS: Record<string, string> = {
  new: "جديد",
  qualified: "مؤهل",
  contacted: "تم التواصل",
  proposal: "في التفاوض",
  negotiation: "مفاوضة نشطة",
  won: "مغلقة",
  lost: "خسارة",
};

/**
 * WHY:   CRM client detail should make the relationship picture immediately visible.
 * WHAT:  Renders the client stage plus linked project and broker visuals in one screen.
 * HOW:   Uses the shared property and broker visual primitives to keep the detail page consistent with the rest of the workspace.
 */
export default function ClientDetailPage({
  client,
}: {
  client: CrmClientRecord;
}) {
  const stageLabel = STAGE_LABELS[client.stage] ?? client.stage;

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="إدارة العملاء"
        title={client.name}
        description={client.notes}
        actions={
          <Link
            href="/ws/crm"
            className="inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-400"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            العودة للخط
          </Link>
        }
      />

      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
        <div className="space-y-6">
          <PersonCard
            compact={false}
            person={{
              id: client.id,
              type: client.personType,
              name: client.name,
              title: "عميل نشط",
              avatarImage: client.avatarImage,
              avatarLabel: client.avatarLabel,
              location: client.project?.location,
              summary: client.preference,
              stageLabel,
              badges: client.badges,
              relation: {
                project: client.project,
                unit: client.unit,
              },
            }}
          />

          {client.project ? (
            <PropertyCard
              density="detail"
              image={client.project.image}
              title={client.project.title}
              location={client.project.location}
              priceLabel={client.budgetLabel}
              summary={client.preference}
              specs={[
                { label: "المرحلة", value: stageLabel },
                { label: "الطلب", value: client.preference },
                { label: "الميزانية", value: client.budgetLabel },
                { label: "الوحدة", value: client.unit?.label ?? "على مستوى المشروع" },
              ]}
            />
          ) : (
            <BrandEmptyState
              title="بدون مشروع"
              description="هذا العميل غير مرتبط بأي مشروع حتى الآن."
            />
          )}
        </div>

        <aside className="space-y-4">
          {/* Stage panel */}
          <section className="border-2 border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">
              المرحلة الحالية
            </div>
            <div className="mt-3 text-2xl font-black text-slate-950">{stageLabel}</div>
            <div className="mt-2 h-1.5 w-full bg-slate-100">
              <div
                className="h-1.5 bg-blue-600 transition-all"
                style={{
                  width:
                    client.stage === "new" ? "10%" :
                    client.stage === "qualified" ? "35%" :
                    client.stage === "proposal" ? "65%" :
                    client.stage === "won" ? "100%" : "5%",
                }}
              />
            </div>
          </section>

          {/* Budget panel */}
          {client.budgetLabel ? (
            <section className="border-2 border-slate-100 bg-white p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">
                الميزانية
              </div>
              <div className="mt-3 text-xl font-black text-slate-950">{client.budgetLabel}</div>
            </section>
          ) : null}

          {/* Broker panel */}
          <section className="border-2 border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">
              الوسيط
            </div>
            <div className="mt-4">
              {client.broker ? (
                <PersonCard person={brokerPresenceToPersonCard(client.broker)} compact />
              ) : (
                <BrandEmptyState
                  title="بدون وسيط"
                  description="لم يتم تعيين وسيط لهذا العميل بعد."
                />
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
