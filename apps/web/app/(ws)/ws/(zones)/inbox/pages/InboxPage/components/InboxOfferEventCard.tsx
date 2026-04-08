"use client";

import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { ArrowUpLeft, Check, Clock3, FileText, MapPin, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiUnsafe } from "@/lib/convexApi";
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
  if (status === "accepted") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (status === "rejected") return "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400";
  return "border-foreground/10 bg-foreground/5 text-foreground";
}

function buildFallbackState(metadata: OfferEventMetadata): OfferLiveState {
  return {
    id: metadata.offerId,
    packageId: metadata.offerId,
    type: metadata.visibility === "public" ? "open_offer" : "private_offer",
    stage: metadata.visibility === "public" ? "open" : "targeted",
    propertyId: metadata.propertyId,
    price: metadata.price,
    status: "pending",
    publicationState: "published",
    visibility: metadata.visibility,
    recipientAuthUserId: metadata.recipientAuthUserId ?? null,
    sourceConversationId: null,
    message: metadata.offerTitle,
    description: null,
    senderName: metadata.authorName,
    propertyGallery: [],
    propertySummary: null,
    commissionText: null,
    permitStatus: null,
    productStatus: null,
    allowedAudience: "both",
    attachments: [],
    clientContext: null,
    primaryOrganization: null,
    participants: [],
    property: null,
    href: metadata.href,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    propertyTitle: metadata.offerTitle,
    propertyAddress: "تفاصيل العقار داخل صفحة العرض",
    propertyImageUrl: null,
    isOwner: false,
    isRecipient: false,
    canEditDraft: false,
    canPublish: false,
    canArchive: false,
    canRespond: false,
    allowedActions: {
      isInventoryOwner: false,
      isClientOwner: false,
      isExecutionPartner: false,
      canEditDraft: false,
      canPublish: false,
      canArchive: false,
      canEngage: false,
      canRespond: false,
      canMarkAgreed: false,
      canCloseWon: false,
      canCloseLost: false,
    },
    activity: [],
  };
}

/**
 * WHY:   Inbox offer cards should still render when the live offer query is loading or the case is no longer directly accessible.
 * WHAT:  Shows the conversation-embedded offer snapshot and upgrades to live case state when available.
 * HOW:   Falls back to message metadata, then reads the new offers 2.0 live state through the unsafe Convex API bridge.
 */
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
  const { isAuthenticated, isLoading } = useConvexAuth();
  const liveOffer = useQuery(
    (apiUnsafe["shared_logic/offers"] as { getOfferLiveState: unknown }).getOfferLiveState as never,
    (!isLoading && isAuthenticated ? { offerId: metadata.offerId } : "skip") as never,
  ) as OfferLiveState | null | undefined;
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
      className={cn(
        "space-y-6 rounded-3xl border p-6 shadow-sm transition-all",
        isMe
          ? "border-foreground/10 bg-foreground/5 text-foreground"
          : "border-border bg-card text-foreground"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            <span className={isMe ? "text-foreground/60" : "text-muted-foreground"}>عرض خاص</span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 tracking-normal", statusClassName(state.status))}>
              <Clock3 className="h-3 w-3" />
              {statusLabel(state.status)}
            </span>
          </div>
          <div className="text-lg font-black tracking-tight leading-tight">{state.propertyTitle}</div>
          <div className={cn("flex flex-wrap items-center gap-3 text-[13px] font-medium", isMe ? "text-foreground/60" : "text-muted-foreground")}>
            <span>{metadata.authorName}</span>
            {metadata.organizationName ? <span className="opacity-40">/</span> : null}
            <span>{metadata.organizationName}</span>
          </div>
        </div>
        <div className={cn(
          "rounded-2xl border px-5 py-3 text-right shadow-sm",
          isMe ? "border-foreground/20 bg-foreground/10" : "border-border bg-muted/30"
        )}>
          <div className={cn("text-[11px] font-bold uppercase tracking-wider", isMe ? "text-foreground/60" : "text-muted-foreground")}>القيمة المقترحة</div>
          <div className="mt-1 text-xl font-black tabular-nums">{formatOfferPrice(state.price)}</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className={cn(
          "space-y-4 rounded-2xl border p-5 shadow-inner-sm",
          isMe ? "border-foreground/10 bg-foreground/5" : "border-border bg-muted/20"
        )}>
          <div className={cn("flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-wide", isMe ? "text-foreground/50" : "text-muted-foreground/60")}>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              عرض حصري
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {state.propertyAddress}
            </span>
          </div>
          <div className={cn("text-[13px] font-medium leading-relaxed", isMe ? "text-foreground/90" : "text-foreground")}>
            {messageSummary || "لا يوجد وصف إضافي لهذا العرض."}
          </div>
        </div>
        <div className={cn(
          "flex flex-col justify-center min-w-[140px] rounded-2xl border p-5 text-center shadow-inner-sm",
          isMe ? "border-foreground/10 bg-foreground/5 text-foreground/50" : "border-border bg-muted/20 text-muted-foreground"
        )}>
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            المرفقات
          </div>
          <div className="mt-2 text-2xl font-black text-foreground">{state.attachments?.length ?? 0}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {state.canRespond ? (
          <>
            <button
              type="button"
              onClick={() => void handleRespond("accepted")}
              disabled={pendingAction !== null}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-[13px] font-bold text-background transition-all hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {pendingAction === "accepted" ? "جاري التنفيذ" : "قبول"}
            </button>
            <button
              type="button"
              onClick={() => void handleRespond("rejected")}
              disabled={pendingAction !== null}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 text-[13px] font-bold text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              {pendingAction === "rejected" ? "جاري التنفيذ" : "رفض"}
            </button>
          </>
        ) : null}
        <a
          href={state.href}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-[13px] font-bold transition-all",
            isMe
              ? "border-foreground/20 bg-foreground/10 text-foreground hover:bg-foreground/20"
              : "border-border bg-card text-foreground hover:bg-muted"
          )}
        >
          <ArrowUpLeft className="h-4 w-4" />
          افتح العرض
        </a>
      </div>
    </div>
  );
}
