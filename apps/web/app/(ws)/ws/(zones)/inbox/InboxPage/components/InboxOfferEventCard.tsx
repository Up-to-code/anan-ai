"use client";

import { ArrowUpLeft } from "lucide-react";
import type { OfferEventMetadata } from "@/server/contracts/inbox";

function formatOfferPrice(value: number) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ر.س`;
}

/**
 * WHY:   Offer-event messages carry structured business context that should stay readable inside chat.
 * WHAT:  Renders the compact card treatment for offer-event messages in the inbox thread.
 * HOW:   Surfaces the offer title, organization details, price, visibility, and deep link using the existing metadata contract.
 */
export default function InboxOfferEventCard({
  body,
  isMe,
  metadata,
}: {
  body: string;
  isMe: boolean;
  metadata: OfferEventMetadata;
}) {
  return (
    <div className={`space-y-3 border px-4 py-4 ${isMe ? "border-white/20 bg-white/10" : "border-slate-200 bg-white"}`}>
      <div className="space-y-1">
        <div className={`text-xs font-bold ${isMe ? "text-blue-100" : "text-blue-700"}`}>بطاقة عرض</div>
        <div className="text-sm font-black leading-6">{metadata.offerTitle}</div>
      </div>

      <div className={`text-xs font-medium ${isMe ? "text-blue-100" : "text-slate-600"}`}>
        {metadata.authorName} · {metadata.organizationName}
      </div>

      <div className={`flex flex-wrap gap-2 text-xs font-bold ${isMe ? "text-white" : "text-slate-700"}`}>
        <span>{formatOfferPrice(metadata.price)}</span>
        <span>•</span>
        <span>{metadata.visibility === "public" ? "عرض عام" : "عرض خاص"}</span>
      </div>

      <div className={`text-sm font-medium leading-6 ${isMe ? "text-blue-50" : "text-slate-600"}`}>{body}</div>

      <a
        href={metadata.href}
        className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold transition ${
          isMe
            ? "border-white/25 text-white hover:bg-white/10"
            : "border-slate-200 text-slate-800 hover:border-blue-200 hover:text-blue-700"
        }`}
      >
        <ArrowUpLeft className="h-3.5 w-3.5" />
        افتح العرض
      </a>
    </div>
  );
}
