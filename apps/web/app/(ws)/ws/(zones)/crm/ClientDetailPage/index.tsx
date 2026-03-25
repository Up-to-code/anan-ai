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

function toDateTimeLocalValue(timestamp?: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatFollowUpLabel(timestamp?: number): string {
  if (!timestamp) return "لا يوجد موعد متابعة";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function getFollowUpStatus(
  nextFollowUpAt: number | undefined,
  nowTimestamp: number,
): "none" | "overdue" | "scheduled" {
  if (!nextFollowUpAt) return "none";
  return nextFollowUpAt < nowTimestamp ? "overdue" : "scheduled";
}

const STAGE_PROGRESS_WIDTH: Record<string, string> = {
  new: "10%",
  qualified: "35%",
  proposal: "65%",
  won: "100%",
};

const FOLLOW_UP_STATUS_UI: Record<
  ReturnType<typeof getFollowUpStatus>,
  { label: string; toneClassName: string }
> = {
  overdue: { label: "متابعة متأخرة", toneClassName: "border-rose-200 bg-rose-50 text-rose-700" },
  scheduled: { label: "موعد مجدول", toneClassName: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  none: { label: "بدون متابعة", toneClassName: "border-slate-200 bg-slate-50 text-slate-500" },
};

/**
 * WHY:   CRM client detail should make the relationship picture immediately visible.
 * WHAT:  Renders the client stage plus linked project and broker visuals in one screen.
 * HOW:   Uses the shared property and broker visual primitives to keep the detail page consistent with the rest of the workspace.
 */
export default function ClientDetailPage({
  client,
  nowTimestamp,
  onFollowUpSubmit,
}: {
  client: CrmClientRecord;
  nowTimestamp: number;
  onFollowUpSubmit?: (formData: FormData) => Promise<void>;
}) {
  const stageLabel = STAGE_LABELS[client.stage] ?? client.stage;
  const followUpStatus = getFollowUpStatus(client.nextFollowUpAt, nowTimestamp);

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="إدارة الصفقات"
        title={client.name}
        description={client.notes}
        actions={
          <Link
            href="/ws/crm"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            العودة للصفقات
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
              priceLabel={client.project.priceLabel}
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
                  width: STAGE_PROGRESS_WIDTH[client.stage] ?? "5%",
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

          {/* Follow-up panel */}
          <section className="border-2 border-slate-100 bg-white p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-700">
              المتابعة القادمة
            </div>
            <div className="mt-3 text-sm font-black text-slate-900">{formatFollowUpLabel(client.nextFollowUpAt)}</div>
            <div
              className={`mt-2 inline-flex border px-2 py-1 text-[10px] font-black tracking-[0.18em] ${FOLLOW_UP_STATUS_UI[followUpStatus].toneClassName}`}
            >
              {FOLLOW_UP_STATUS_UI[followUpStatus].label}
            </div>
            <form action={onFollowUpSubmit} className="mt-4 space-y-3">
              <input
                type="datetime-local"
                name="nextFollowUpAt"
                required
                defaultValue={toDateTimeLocalValue(client.nextFollowUpAt)}
                className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
              />
              <button
                type="submit"
                disabled={!onFollowUpSubmit}
                className="w-full border border-slate-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 transition hover:border-blue-600 hover:text-blue-700 disabled:opacity-60"
              >
                حفظ المتابعة
              </button>
            </form>
          </section>

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
