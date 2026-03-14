import BrandEmptyState from "../../../_components/WorkspaceBrand/BrandEmptyState";
import PersonCard, {
  brokerPresenceToPersonCard,
} from "../../../_components/Visuals/PersonCard";
import PropertyCard from "../../../_components/Visuals/PropertyCard";
import type { CrmClientRecord } from "../crmTypes";
import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";

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
  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro eyebrow="إدارة العملاء" title={client.name} description={client.notes} />

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
              stageLabel: client.stage,
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
                { label: "المرحلة", value: client.stage },
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
          <section className="border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
            <div className="text-xs font-black tracking-[0.22em] text-blue-700">المرحلة الحالية</div>
            <div className="mt-3 text-2xl font-black text-slate-950">{client.stage}</div>
          </section>
          <section className="border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
            <div className="text-xs font-black tracking-[0.22em] text-blue-700">الوسيط</div>
            <div className="mt-4">
              {client.broker ? (
                <PersonCard person={brokerPresenceToPersonCard(client.broker)} compact />
              ) : (
                <BrandEmptyState title="بدون وسيط" description="لم يتم تعيين وسيط لهذا العميل بعد." />
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
