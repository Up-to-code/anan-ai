"use client";

import { useEffect, useRef, useState } from "react";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { ConversationDetail } from "@/server/contracts/inbox";
import type { OfferActionResult } from "@/server/contracts/offers";
import InboxComposer from "./components/InboxComposer";
import type { ComposerProjectOption, InboxShareAction } from "./components/InboxComposerActions";
import InboxMessageList from "./components/InboxMessageList";
import InboxThreadHeader from "./components/InboxThreadHeader";

/**
 * WHY:   The inbox needs one thread orchestrator that keeps identity, reading, and reply actions in sync.
 * WHAT:  Composes the active thread header, message list, and simplified composer for one selected conversation.
 * HOW:   Owns scroll-to-bottom and the shared action state so header actions and the composer stay aligned.
 */
export default function InboxThreadView({
  canUseBusinessActions = false,
  conversation,
  currentUserId,
  isSending,
  onCreatePrivateOfferDraft,
  onBack,
  onPublishConversationOffer,
  onRespondToConversationOffer,
  onShareFile,
  onShareProject,
  onSend,
  projectOptions,
  sendError,
  showBackButton = false,
}: {
  canUseBusinessActions?: boolean;
  conversation: ConversationDetail;
  currentUserId: string;
  isSending?: boolean;
  onCreatePrivateOfferDraft: (input: {
    propertyId: string;
    price: number;
    message?: string;
    description?: string;
    attachments?: UploadedFileReference[];
  }) => Promise<OfferActionResult | void | null>;
  onBack?: () => void;
  onPublishConversationOffer: (offerId: string) => Promise<OfferActionResult | void | null>;
  onRespondToConversationOffer: (input: {
    offerId: string;
    status: "accepted" | "rejected";
  }) => Promise<{ ok: true } | void | null>;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
  onSend: (message: string) => Promise<void>;
  projectOptions: ComposerProjectOption[];
  sendError?: string | null;
  showBackButton?: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeShareAction, setActiveShareAction] = useState<InboxShareAction | null>(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    return () => clearTimeout(timerId);
  }, [conversation.messages.length]);

  useEffect(() => {
    setActiveShareAction(null);
  }, [conversation.id]);

  return (
    <div className="flex h-full flex-col bg-[var(--workspace-canvas)] text-foreground">
      <InboxThreadHeader
        canCreateOffer={canUseBusinessActions && projectOptions.length > 0}
        canShareProjects={projectOptions.length > 0}
        canUseBusinessActions={canUseBusinessActions}
        conversation={conversation}
        onBack={onBack}
        onOpenShareAction={setActiveShareAction}
        showBackButton={showBackButton}
      />
      <InboxMessageList
        conversation={conversation}
        currentUserId={currentUserId}
        endRef={messagesEndRef}
        onRespondToConversationOffer={onRespondToConversationOffer}
      />
      <InboxComposer
        activeShareAction={activeShareAction}
        canUseBusinessActions={canUseBusinessActions}
        conversation={conversation}
        isSending={isSending}
        onCreatePrivateOfferDraft={onCreatePrivateOfferDraft}
        onPublishConversationOffer={onPublishConversationOffer}
        onSend={onSend}
        onShareActionChange={setActiveShareAction}
        onShareFile={onShareFile}
        onShareProject={onShareProject}
        projectOptions={projectOptions}
        sendError={sendError}
      />
    </div>
  );
}
