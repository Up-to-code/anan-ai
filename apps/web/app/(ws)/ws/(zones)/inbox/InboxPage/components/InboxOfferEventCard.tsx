"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { ArrowUpLeft, Check, Clock3, FileText, MapPin, Shield, X } from "lucide-react";
import { Id } from "@convex/dataModel";
import { api } from "@/lib/convexApi";
import type { OfferEventMetadata } from "@/server/contracts/inbox";
import type { OfferLiveState } from "@/server/contracts/offers";

function formatOfferPrice(value: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ر.س`;
}

function statusLabel(status: OfferLiveState["status"]) {
  if (status === "accepted") return "تم القبول";
  if (status === "rejected") return "تم الرفض";
  return "بانتظار الرد";
}

function statusClassName(status: OfferLiveState["status"]) {
  if (status === "accepted") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (status === "rejected") return "border-rose-500/30 bg-rose-500/10 text-rose-200";
  return "border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_12%,transparent)] text-[var(--workspace-highlight)]";
}

function buildFallbackState(metadata: OfferEventMetadata): OfferLiveState {
  return {
    id: metadata.offerId,
    propertyId: metadata.propertyId,
    price: metadata.price,
    status: "pending",
    publicationState: "published",
    visibility: metadata.visibility,
    recipientAuthUserId: metadata.recipientAuthUserId,
    sourceConversationId: undefined,
    message: metadata.offerTitle,
    description: undefined,
    senderName: metadata.authorName,
    attachments: [],
    property: null,
    href: metadata.href,
    propertyTitle: metadata.offerTitle,
    propertyAddress: "تفاصيل العقار داخل صفحة العرض",
    propertyImageUrl: null,
    isOwner: false,
    isRecipient: false,
    canEditDraft: false,
    canPublish: false,
    canRespond: false,
  };
}

export default function InboxOfferEventCard({
  body,
  isMe,
  metadata,
  onRespondToConversationOffer,
}: {
  body: string;
  isMe: boolean;
  metadata: OfferEventMetadata;
  onRespondToConversationOffer: (input: {
    offerId: string;
    status: "accepted" | "rejected";
  }) => Promise<{ ok: true } | void | null>;
}) {
  const [pendingAction, setPendingAction] = useState<"accepted" | "rejected" | null>(null);
  const liveOffer = useQuery(api.shared_logic.offers.getOfferLiveState, {
    offerId: metadata.offerId as Id<"offers">,
  }) as OfferLiveState | null | undefined;
  const state = liveOffer ?? buildFallbackState(metadata);
  const messageSummary = state.description ?? body;

  const handleRespond = async (status: "accepted" | "rejected") => {
    try {
      setPendingAction(status);
      await onRespondToConversationOffer({
        offerId: metadata.offerId,
        status,
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div
      className={`space-y-4 rounded-[24px] border p-4 shadow-sm ${
        isMe
          ? "border-[color:color-mix(in_srgb,var(--workspace-border)_56%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_84%,var(--workspace-panel))] text-[var(--workspace-bubble-self-foreground)]"
          : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-bubble-other-foreground)]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className={isMe ? "text-[var(--workspace-bubble-self-muted)]" : "text-[var(--workspace-highlight)]"}>عرض خاص</span>
            <span className={`inline-flex items-center gap-1 border px-2 py-1 ${statusClassName(state.status)}`}>
              <Clock3 className="h-3 w-3" />
              {statusLabel(state.status)}
            </span>
          </div>
          <div className="text-base font-black leading-6">{state.propertyTitle}</div>
          <div className={`flex flex-wrap items-center gap-3 text-xs font-medium ${isMe ? "text-[var(--workspace-bubble-self-muted)]" : "text-[var(--workspace-bubble-other-muted)]"}`}>
            <span>{metadata.authorName}</span>
            <span>{metadata.organizationName}</span>
          </div>
        </div>
        <div className={`rounded-2xl border px-3 py-2 text-right ${isMe ? "border-[color:color-mix(in_srgb,var(--workspace-border)_52%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_74%,var(--workspace-panel))]" : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)]"}`}>
          <div className={`text-[11px] font-bold ${isMe ? "text-[var(--workspace-bubble-self-muted)]" : "text-[var(--workspace-bubble-other-muted)]"}`}>القيمة المقترحة</div>
          <div className="mt-1 text-base font-black">{formatOfferPrice(state.price)}</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className={`space-y-3 rounded-2xl border p-3 ${isMe ? "border-[color:color-mix(in_srgb,var(--workspace-border)_52%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_74%,var(--workspace-panel))]" : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)]"}`}>
          <div className={`flex flex-wrap items-center gap-3 text-xs font-medium ${isMe ? "text-[var(--workspace-bubble-self-muted)]" : "text-[var(--workspace-bubble-other-muted)]"}`}>
            <span className="inline-flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              خاص للطرف المحدد
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {state.propertyAddress}
            </span>
          </div>
          <div className={`text-sm leading-6 ${isMe ? "text-[var(--workspace-bubble-self-foreground)]" : "text-[var(--workspace-bubble-other-foreground)]"}`}>
            {messageSummary || "لا يوجد وصف إضافي لهذا العرض."}
          </div>
        </div>
        <div className={`min-w-[132px] rounded-2xl border p-3 text-xs font-medium ${isMe ? "border-[color:color-mix(in_srgb,var(--workspace-border)_52%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_74%,var(--workspace-panel))] text-[var(--workspace-bubble-self-muted)]" : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-muted)]"}`}>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            المرفقات
          </div>
          <div className="mt-2 text-sm font-black text-inherit">{state.attachments?.length ?? 0}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {state.canRespond ? (
          <>
            <button
              type="button"
              onClick={() => void handleRespond("accepted")}
              disabled={pendingAction !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 px-3 py-2 text-xs font-bold text-[var(--primary-foreground)] transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              {pendingAction === "accepted" ? "جاري التنفيذ" : "قبول"}
            </button>
            <button
              type="button"
              onClick={() => void handleRespond("rejected")}
              disabled={pendingAction !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              {pendingAction === "rejected" ? "جاري التنفيذ" : "رفض"}
            </button>
          </>
        ) : null}
        <a
          href={state.href}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            isMe
              ? "border-[color:color-mix(in_srgb,var(--workspace-border)_52%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-bubble-self)_74%,var(--workspace-panel))] text-[var(--workspace-bubble-self-foreground)] hover:brightness-110"
              : "border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)] hover:bg-[var(--workspace-accent-soft)]"
          }`}
        >
          <ArrowUpLeft className="h-3.5 w-3.5" />
          افتح العرض
        </a>
      </div>
    </div>
  );
}
