import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BrandEmptyState from "../../../../_components/WorkspaceBrand/BrandEmptyState";
import PersonCard, {
  brokerPresenceToPersonCard,
} from "../../../../_components/Visuals/PersonCard";
import PropertyCard from "../../../../_components/Visuals/PropertyCard";
import type { CrmClientRecord } from "../../types/crmTypes";
import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";

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
  overdue: { label: "متابعة متأخرة", toneClassName: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  scheduled: { label: "موعد مجدول", toneClassName: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  none: { label: "بدون متابعة", toneClassName: "border-border bg-muted/20 text-muted-foreground" },
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
  editHref,
}: {
  client: CrmClientRecord;
  nowTimestamp: number;
  onFollowUpSubmit?: (formData: FormData) => Promise<void>;
  editHref?: string;
}) {
  const stageLabel = STAGE_LABELS[client.stage] ?? client.stage;
  const followUpStatus = getFollowUpStatus(client.nextFollowUpAt, nowTimestamp);

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-10 lg:px-10">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">إدارة الصفقات</div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{client.name}</h1>
          <p className="max-w-xl text-[13px] font-medium text-muted-foreground leading-relaxed">{client.notes}</p>
          <div className="text-[12px] font-black text-blue-700">{client.relationLabel}</div>
        </div>
        <div className="flex items-center gap-3">
          {client.project ? (
            <Link
              href={`/ws/offers/create?mode=collaboration_case&propertyId=${client.project.id}&clientName=${encodeURIComponent(client.name)}&clientPhone=${encodeURIComponent(client.linkedClient?.phone ?? "")}&clientBudget=${encodeURIComponent(client.budgetLabel)}&clientNeed=${encodeURIComponent(client.preference)}`}
              className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-5 text-[13px] font-bold text-foreground transition hover:border-foreground/30 hover:bg-muted/10"
            >
              إنشاء حالة تعاون
            </Link>
          ) : null}
          {editHref ? (
            <Link
              href={editHref}
              className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-5 text-[13px] font-bold text-foreground transition hover:border-foreground/30 hover:bg-muted/10"
            >
              تعديل الصفقة
            </Link>
          ) : null}
          <Link
            href="/ws/crm"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-[13px] font-bold text-foreground transition hover:border-foreground/30 hover:bg-muted/10"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للصفقات
          </Link>
        </div>
      </div>

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
                { label: "نوع الربط", value: client.relationLabel },
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

        <aside className="space-y-6">
          {/* Stage panel */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              المرحلة الحالية
            </div>
            <div className="mt-3 text-2xl font-black text-foreground">{stageLabel}</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{
                  width: STAGE_PROGRESS_WIDTH[client.stage] ?? "5%",
                }}
              />
            </div>
          </section>

          {/* Budget panel */}
          {client.budgetLabel ? (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                الميزانية
              </div>
              <div className="mt-3 text-xl font-bold text-foreground">{client.budgetLabel}</div>
            </section>
          ) : null}

          {/* Follow-up panel */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              المتابعة القادمة
            </div>
            <div className="mt-3 text-sm font-bold text-foreground">{formatFollowUpLabel(client.nextFollowUpAt)}</div>
            <div
              className={`mt-3 inline-flex rounded-xl border px-3 py-1.5 text-[11px] font-bold tracking-wide ${FOLLOW_UP_STATUS_UI[followUpStatus].toneClassName}`}
            >
              {FOLLOW_UP_STATUS_UI[followUpStatus].label}
            </div>
            <form action={onFollowUpSubmit} className="mt-6 space-y-3">
              <input
                type="datetime-local"
                name="nextFollowUpAt"
                required
                defaultValue={toDateTimeLocalValue(client.nextFollowUpAt)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-[13px] font-bold text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!onFollowUpSubmit}
                className="w-full rounded-xl bg-foreground py-3 text-[13px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-50"
              >
                حفظ المتابعة
              </button>
            </form>
          </section>

          {/* Broker panel */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              الوسيط المرتبط
            </div>
            <div className="mt-4">
              {client.broker ? (
                <div className="flex items-center gap-3">
                  <PersonCard person={brokerPresenceToPersonCard(client.broker)} compact />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center">
                  <p className="text-sm font-bold text-muted-foreground">لم يتم تعيين وسيط لهذا العميل بعد.</p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
