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
  latestOutgoingMessageId,
  message,
  otherParticipantLastReadAt,
  onRespondToConversationOffer,
}: {
  currentUserId: string;
  latestOutgoingMessageId: string | null;
  message: ConversationMessage;
  otherParticipantLastReadAt: number | null;
  onRespondToConversationOffer: (input: {
    offerId: string;
    status: "accepted" | "rejected";
  }) => Promise<{ ok: true } | void | null>;
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
  const isLatestOutgoingMessage = isMe && latestOutgoingMessageId === message.id;
  const isSeenByRecipient = Boolean(
    isLatestOutgoingMessage &&
      otherParticipantLastReadAt &&
      otherParticipantLastReadAt >= message.createdAt,
  );
  const seenTimeLabel = isSeenByRecipient
    ? new Date(otherParticipantLastReadAt as number).toLocaleTimeString("ar-SA", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const deliveryLabel = isOptimistic
    ? "جاري الإرسال"
    : isSeenByRecipient
      ? `شوهد ${seenTimeLabel}`
      : isLatestOutgoingMessage
        ? "تم الإرسال"
        : null;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] sm:max-w-[75%] ${
          offerCardMetadata || collaborationMetadata
            ? ""
            : `px-4 py-2.5 ${isMe
              ? "rounded-[22px] rounded-tl-md bg-[var(--workspace-bubble-self)] text-[var(--workspace-bubble-self-foreground)] shadow-sm"
              : "rounded-[22px] rounded-tr-md border border-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)] bg-[var(--workspace-panel)] text-[var(--workspace-bubble-other-foreground)] shadow-sm"
            }`
        } ${isOptimistic ? "opacity-80" : ""}`}
      >
        {offerCardMetadata ? (
          <InboxOfferEventCard
            body={message.body}
            isMe={isMe}
            metadata={offerCardMetadata}
            onRespondToConversationOffer={onRespondToConversationOffer}
          />
        ) : collaborationMetadata ? (
          <InboxCollaborationCard isMe={isMe} metadata={collaborationMetadata} />
        ) : (
          <div className="text-sm font-medium leading-7">{message.body}</div>
        )}

        <div
          className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-bold ${isMe ? "text-[var(--workspace-bubble-self-muted)]" : "text-[var(--workspace-bubble-other-muted)]"
            }`}
        >
          <Clock3 className="h-2.5 w-2.5" />
          <span>{timeLabel}</span>
          {deliveryLabel ? <span>• {deliveryLabel}</span> : null}
        </div>
      </div>
    </div>
  );
}
