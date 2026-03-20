"use client";

import { Clock3 } from "lucide-react";
import {
  dealShareMetadataSchema,
  fileShareMetadataSchema,
  inviteEventMetadataSchema,
  offerEventMetadataSchema,
  projectShareMetadataSchema,
  roleEventMetadataSchema,
  type ConversationMessage,
} from "@/server/contracts/inbox";
import InboxCollaborationCard from "./InboxCollaborationCard";
import InboxOfferEventCard from "./InboxOfferEventCard";

/**
 * WHY:   Inbox messages need one shared renderer that keeps plain text and business-card payloads visually consistent.
 * WHAT:  Renders a single thread message row with optimistic-send feedback plus offer/collaboration cards when metadata is present.
 * HOW:   Detects the message direction from the current user id and falls back to plain text when metadata is absent or invalid.
 */
export default function InboxMessageItem({
  currentUserId,
  message,
}: {
  currentUserId: string;
  message: ConversationMessage;
}) {
  const isMe = message.senderUserId === currentUserId;
  const isOptimistic = Boolean(
    message.metadata && "optimistic" in message.metadata && message.metadata.optimistic,
  );
  const offerCardMetadata = (() => {
    if (message.type !== "offer_event") {
      return null;
    }

    const parsed = offerEventMetadataSchema.safeParse(message.metadata);
    return parsed.success ? parsed.data : null;
  })();
  const collaborationMetadata = (() => {
    if (message.type === "file_share") {
      const parsed = fileShareMetadataSchema.safeParse(message.metadata);
      return parsed.success ? parsed.data : null;
    }

    if (message.type === "project_share") {
      const parsed = projectShareMetadataSchema.safeParse(message.metadata);
      return parsed.success ? parsed.data : null;
    }

    if (message.type === "deal_share") {
      const parsed = dealShareMetadataSchema.safeParse(message.metadata);
      return parsed.success ? parsed.data : null;
    }

    if (message.type === "invite_event") {
      const parsed = inviteEventMetadataSchema.safeParse(message.metadata);
      return parsed.success ? parsed.data : null;
    }

    if (message.type === "role_event") {
      const parsed = roleEventMetadataSchema.safeParse(message.metadata);
      return parsed.success ? parsed.data : null;
    }

    return null;
  })();
  const timeLabel = new Date(message.createdAt).toLocaleTimeString("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] px-4 py-2.5 sm:max-w-[75%] ${isMe
          ? "rounded-2xl rounded-tl-sm bg-blue-600 text-white shadow-sm"
          : "rounded-2xl rounded-tr-sm bg-slate-100 text-slate-900"
          } ${isOptimistic ? "opacity-80" : ""}`}
      >
        {offerCardMetadata ? (
          <InboxOfferEventCard body={message.body} isMe={isMe} metadata={offerCardMetadata} />
        ) : collaborationMetadata ? (
          <InboxCollaborationCard isMe={isMe} metadata={collaborationMetadata} />
        ) : (
          <div className="text-sm font-medium leading-relaxed">{message.body}</div>
        )}

        <div
          className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-bold ${isMe ? "text-blue-200" : "text-slate-400"
            }`}
        >
          <Clock3 className="h-2.5 w-2.5" />
          <span>{timeLabel}</span>
          {isOptimistic ? <span>• جاري الإرسال</span> : null}
        </div>
      </div>
    </div>
  );
}
