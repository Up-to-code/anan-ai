"use client";

import { useEffect, useRef } from "react";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { ConversationDetail } from "@/server/contracts/inbox";
import InboxComposer from "./components/InboxComposer";
import InboxMessageList from "./components/InboxMessageList";
import InboxThreadHeader from "./components/InboxThreadHeader";

/**
 * WHY:   The inbox needs a small thread orchestrator that keeps reading, identity, and reply actions in one place.
 * WHAT:  Composes the active thread header, message list, and composer for a selected conversation.
 * HOW:   Owns only the scroll-to-bottom behavior while delegating rendering details to focused subcomponents.
 */
export default function InboxThreadView({
  canUseBusinessActions = false,
  conversation,
  currentUserId,
  dealOptions,
  isSending,
  onCreatePrivateOffer,
  onBack,
  onShareDeal,
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
  dealOptions: Array<{
    id: string;
    title: string;
    stage: "new" | "contacted" | "negotiation" | "won" | "lost";
    value?: number;
    contactName?: string | null;
  }>;
  isSending?: boolean;
  onCreatePrivateOffer: (input: {
    propertyId: string;
    price: number;
    message?: string;
    description?: string;
    attachments?: UploadedFileReference[];
  }) => Promise<void | null>;
  onBack?: () => void;
  onShareDeal: (dealId: string, note?: string) => Promise<void>;
  onShareFile: (file: UploadedFileReference, note?: string) => Promise<void>;
  onShareProject: (propertyId: string, note?: string) => Promise<void>;
  onSend: (message: string) => Promise<void>;
  projectOptions: Array<{
    id: string;
    title: string;
    location: string;
    imageUrl?: string | null;
    price?: number;
  }>;
  sendError?: string | null;
  showBackButton?: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  return (
    <div className="flex h-full flex-col bg-white">
      <InboxThreadHeader
        conversation={conversation}
        onBack={onBack}
        showBackButton={showBackButton}
      />
      <InboxMessageList conversation={conversation} currentUserId={currentUserId} endRef={messagesEndRef} />
      <InboxComposer
        canUseBusinessActions={canUseBusinessActions}
        dealOptions={dealOptions}
        isSending={isSending}
        onCreatePrivateOffer={onCreatePrivateOffer}
        onSend={onSend}
        onShareDeal={onShareDeal}
        onShareFile={onShareFile}
        onShareProject={onShareProject}
        projectOptions={projectOptions}
        sendError={sendError}
      />
    </div>
  );
}
