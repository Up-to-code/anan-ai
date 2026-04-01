"use client";

import type { RefObject } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { ConversationDetail } from "@/server/contracts/inbox";
import InboxMessageItem from "./InboxMessageItem";

/**
 * WHY:   The thread panel needs one scrollable list that stays focused on reading and message hierarchy.
 * WHAT:  Renders the ordered conversation messages and exposes a bottom anchor for auto-scroll behavior.
 * HOW:   Delegates each row to `InboxMessageItem` and keeps the list padding consistent across mobile and desktop.
 */
export default function InboxMessageList({
  conversation,
  currentUserId,
  endRef,
  onRespondToConversationOffer,
}: {
  conversation: ConversationDetail;
  currentUserId: string;
  endRef: RefObject<HTMLDivElement | null>;
  onRespondToConversationOffer: (input: {
    offerId: string;
    status: "accepted" | "rejected";
  }) => Promise<{ ok: true } | void | null>;
}) {
  const { locale, direction } = useWebLocale();
  const latestOutgoingMessageId =
    [...conversation.messages]
      .reverse()
      .find((message) => message.senderUserId === currentUserId)?.id ?? null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--workspace-canvas)] px-4 py-5 sm:px-6" dir={direction}>
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="rounded-full border border-[color:color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[var(--workspace-panel)] px-3 py-1 text-[11px] font-bold text-[var(--workspace-muted)]">
            {latestOutgoingMessageId
              ? locale === "fr"
                ? "Conversation active"
                : locale === "en"
                  ? "Active conversation"
                  : "محادثة نشطة"
              : locale === "fr"
                ? "Debut de la conversation"
                : locale === "en"
                  ? "Start of conversation"
                  : "بداية المحادثة"}{" "}
            · {conversation.messages.length} {locale === "fr" ? "messages" : locale === "en" ? "messages" : "رسالة"}
          </div>
        </div>
        {conversation.messages.map((message) => (
          <InboxMessageItem
            key={message.id}
            currentUserId={currentUserId}
            message={message}
            latestOutgoingMessageId={latestOutgoingMessageId}
            otherParticipantLastReadAt={conversation.otherParticipantLastReadAt ?? null}
            onRespondToConversationOffer={onRespondToConversationOffer}
          />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
