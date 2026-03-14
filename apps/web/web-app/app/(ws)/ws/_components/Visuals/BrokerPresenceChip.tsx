"use client";

import { useState } from "react";
import type { PersonBadge, PersonCardType, PersonRelation } from "../../_lib/entities";
import { cn } from "@/lib/utils";

export type BrokerPresence = {
  id: string;
  name: string;
  avatarLabel: string;
  avatarImage: string;
  personType?: PersonCardType;
  badges?: PersonBadge[];
  state: "client-linked" | "qualified" | "idle";
  title?: string;
  city?: string;
  projectTitle?: string | null;
  unitLabel?: string | null;
  clientName?: string | null;
  summary?: string;
  relation?: PersonRelation | null;
};

const STATE_STYLES: Record<BrokerPresence["state"], string> = {
  "client-linked": "border-blue-200 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] text-blue-700",
  qualified: "border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5_0%,#ffffff_100%)] text-emerald-700",
  idle: "border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-slate-600",
};

/**
 * WHY:   Workspace cards need a compact visual broker token with richer detail on hover or tap.
 * WHAT:  Renders a broker avatar chip plus a lightweight summary panel that opens on hover, focus, or click.
 * HOW:   Keeps the interaction local with small client state while exposing all relation metadata through props.
 */
export default function BrokerPresenceChip({
  broker,
  className,
}: {
  broker: BrokerPresence;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-3 border px-3 py-2.5 text-right transition hover:-translate-y-0.5",
          STATE_STYLES[broker.state],
        )}
      >
        <div className="relative">
          <img
            src={broker.avatarImage}
            alt={broker.name}
            className="h-10 w-10 rounded-none object-cover"
          />
          <span className="absolute -bottom-1 -left-1 h-3 w-3 rounded-none border border-white bg-blue-600" />
        </div>
        <span className="min-w-0">
          <span className="block truncate text-xs font-black text-slate-950">{broker.name}</span>
          <span className="block truncate text-[11px] font-bold text-slate-500">
            {broker.relation?.unit?.label
              ? `الوحدة: ${broker.relation.unit.label}`
              : broker.clientName
                ? `عميل: ${broker.clientName}`
                : "بدون عميل"}
          </span>
        </span>
        {broker.badges?.includes("verified") ? (
          <span className="border border-blue-200 bg-white px-1.5 py-1 text-[9px] font-black tracking-[0.18em] text-blue-700">
            موثق
          </span>
        ) : null}
      </button>

      <div
        className={cn(
          "absolute top-full z-20 mt-2 w-72 border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_20px_48px_rgba(15,23,42,0.10)] transition",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
        )}
      >
        <div className="flex items-start gap-3">
          <img
            src={broker.avatarImage}
            alt={broker.name}
            className="h-14 w-14 rounded-none object-cover"
          />
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-950">{broker.name}</div>
            <div className="text-xs font-bold text-slate-500">{broker.title ?? "وسيط معتمد"}</div>
            <div className="mt-1 text-[11px] font-black tracking-[0.2em] text-blue-700">
              {broker.city ?? "الرياض"}
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm font-medium leading-6 text-slate-600">
          <div>المشروع: {broker.relation?.project?.title ?? broker.projectTitle ?? "غير مرتبط"}</div>
          <div>الوحدة: {broker.relation?.unit?.label ?? broker.unitLabel ?? "على مستوى المشروع"}</div>
          <div>العميل: {broker.clientName ?? "غير مرتبط"}</div>
          <div>{broker.summary ?? "يراجع فرص المشروع الحالية وحالة العميل المرتبط."}</div>
        </div>
      </div>
    </div>
  );
}
