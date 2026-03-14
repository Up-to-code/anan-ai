import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { PersonBadge, PersonCardType, PersonRelation } from "../../_lib/entities";
import type { BrokerPresence } from "./BrokerPresenceChip";

/**
 * WHY:   Offers and CRM now need one primary person card instead of overloading project cards for every relationship.
 * WHAT:  Renders a compact broker/client card with badges, stage, and linked project or unit context.
 * HOW:   Accepts a serializable person payload so both server pages and client boards can reuse the same card shell.
 */
export default function PersonCard({
  person,
  footer,
  compact = true,
}: {
  person: {
    id: string;
    type: PersonCardType;
    name: string;
    title?: string;
    avatarImage?: string;
    avatarLabel: string;
    location?: string;
    summary: string;
    stageLabel?: string;
    badges?: PersonBadge[];
    relation?: PersonRelation | null;
  };
  footer?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <article className={`border border-slate-200 bg-white ${compact ? "w-full max-w-[300px]" : "w-full max-w-[340px]"}`}>
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {person.avatarImage ? (
              <img src={person.avatarImage} alt={person.name} className="h-14 w-14 rounded-none object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-none bg-slate-100 text-lg font-black text-slate-500">
                {person.avatarLabel}
              </div>
            )}
            {person.badges?.includes("verified") ? (
              <div className="absolute -bottom-1 -left-1 border border-blue-200 bg-blue-50 p-1 text-blue-700">
                <ShieldCheck className="h-3 w-3" />
              </div>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-950">{person.name}</h3>
              {person.badges?.includes("vip") ? (
                <span className="border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-black tracking-[0.16em] text-amber-700">
                  VIP
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs font-bold text-slate-500">
              {person.title ?? (person.type === "broker" ? "وسيط معتمد" : "عميل نشط")}
            </div>
            {person.location ? <div className="mt-1 text-[11px] font-medium text-blue-700">{person.location}</div> : null}
          </div>
        </div>

        <p className="text-sm font-medium leading-6 text-slate-600">{person.summary}</p>

        <div className="grid gap-2">
          <div className="border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">الارتباط</div>
            <div className="mt-1 text-sm font-black text-slate-950">
              {person.relation?.project?.title ?? "بدون مشروع"}
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-500">
              {person.relation?.unit?.label ?? "على مستوى المشروع"}
            </div>
          </div>
          <div className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2">
            <div>
              <div className="text-[10px] font-black tracking-[0.18em] text-slate-400">الحالة</div>
              <div className="mt-1 text-sm font-black text-blue-700">{person.stageLabel ?? "قيد المتابعة"}</div>
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-[10px] font-black tracking-[0.16em]">
                {person.type === "broker" ? "وسيط" : "عميل"}
              </span>
            </div>
          </div>
        </div>

        {footer ? <div>{footer}</div> : null}
      </div>
    </article>
  );
}

/**
 * WHY:   Existing broker presence data should be promotable into a full person card without repeating field mapping everywhere.
 * WHAT:  Converts a broker-presence chip payload into a `PersonCard`-compatible object.
 * HOW:   Uses optional relation fields when available and falls back to the legacy project title fields.
 */
export function brokerPresenceToPersonCard(broker: BrokerPresence) {
  return {
    id: broker.id,
    type: (broker.personType ?? "broker") as PersonCardType,
    name: broker.name,
    title: broker.title,
    avatarImage: broker.avatarImage,
    avatarLabel: broker.avatarLabel,
    location: broker.city,
    summary: broker.summary ?? "يراجع الفرص الحالية والارتباطات المرتبطة به.",
    stageLabel: broker.state === "client-linked" ? "مرتبط بعميل" : broker.state === "qualified" ? "مؤهل" : "بدون عميل",
    badges: broker.badges,
    relation:
      broker.relation ?? {
        project: broker.projectTitle
          ? { id: broker.projectTitle, title: broker.projectTitle, location: broker.city ?? "الرياض" }
          : null,
        unit: broker.unitLabel ? { id: broker.unitLabel, label: broker.unitLabel } : null,
      },
  };
}
