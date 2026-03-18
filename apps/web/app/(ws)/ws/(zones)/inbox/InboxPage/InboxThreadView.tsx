"use client";

import { useEffect, useRef, useState } from "react";
import { FileUp, Building2, Handshake, Tag } from "lucide-react";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { ConversationDetail } from "@/server/contracts/inbox";
import ChatActionBar from "@/app/(ws)/ws/_components/Chat/ChatActionBar";
import InboxComposer from "./components/InboxComposer";
import InboxMessageList from "./components/InboxMessageList";
import InboxThreadHeader from "./components/InboxThreadHeader";

/**
 * WHY:   The inbox needs a small thread orchestrator that keeps reading, identity, and reply actions in one place.
 * WHAT:  Composes the active thread header, message list, icon+label action bar, and composer for a selected conversation.
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
  const [, setActiveAction] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const businessActions = canUseBusinessActions
    ? [
        {
          key: "file",
          icon: FileUp,
          label: "ملف",
          onClick: () => setActiveAction((prev) => (prev === "file" ? null : "file")),
        },
        {
          key: "project",
          icon: Building2,
          label: "مشروع",
          disabled: projectOptions.length === 0,
          onClick: () => setActiveAction((prev) => (prev === "project" ? null : "project")),
        },
        {
          key: "deal",
          icon: Handshake,
          label: "صفقة",
          disabled: dealOptions.length === 0,
          onClick: () => setActiveAction((prev) => (prev === "deal" ? null : "deal")),
        },
        {
          key: "offer",
          icon: Tag,
          label: "عرض خاص",
          disabled: projectOptions.length === 0,
          onClick: () => setActiveAction((prev) => (prev === "offer" ? null : "offer")),
        },
      ]
    : [];

  return (
    <div className="flex h-full flex-col bg-white">
      <InboxThreadHeader
        conversation={conversation}
        onBack={onBack}
        showBackButton={showBackButton}
      />
      <InboxMessageList conversation={conversation} currentUserId={currentUserId} endRef={messagesEndRef} />
      {businessActions.length > 0 ? (
        <ChatActionBar actions={businessActions} />
      ) : null}
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
