"use client";

import type { RefObject } from "react";
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
}: {
  conversation: ConversationDetail;
  currentUserId: string;
  endRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-white px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {conversation.messages.map((message) => (
          <InboxMessageItem key={message.id} currentUserId={currentUserId} message={message} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
