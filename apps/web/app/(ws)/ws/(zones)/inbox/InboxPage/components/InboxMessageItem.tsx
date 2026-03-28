"use client";

import { Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
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
        className={cn(
          "min-w-0 max-w-[92%] sm:max-w-[75%] transition-all",
          offerCardMetadata || collaborationMetadata
            ? ""
            : cn(
                "px-5 py-3.5 shadow-sm",
                isMe
                  ? "rounded-3xl rounded-tr-sm bg-foreground text-background"
                  : "rounded-3xl rounded-tl-sm border border-border bg-card text-foreground"
              ),
          isOptimistic && "opacity-60"
        )}
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
          <div className="whitespace-pre-wrap break-words text-sm font-medium leading-7 [overflow-wrap:anywhere]">
            {message.body}
          </div>
        )}

        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
            isMe ? "text-background/60" : "text-muted-foreground/60"
          )}
        >
          <Clock3 className="h-3 w-3" />
          <span>{timeLabel}</span>
          {deliveryLabel ? <span className="opacity-80">• {deliveryLabel}</span> : null}
        </div>
      </div>
    </div>
  );
}
