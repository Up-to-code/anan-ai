"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { ConversationDetail, ConversationSummary } from "@/server/contracts/inbox";
import type { OfferActionResult } from "@/server/contracts/offers";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import InboxSidebar from "./components/InboxSidebar";
import { InboxThreadEmptyState, InboxThreadLoadingState } from "./components/InboxStates";
import InboxThreadView from "./InboxThreadView";
import { useRealtimeInbox } from "./useRealtimeInbox";

type InboxProjectOption = {
  id: string;
  title: string;
  location: string;
  imageUrl?: string | null;
  price?: number;
};

type InboxDealOption = {
  id: string;
  title: string;
  stage: "new" | "contacted" | "negotiation" | "won" | "lost";
  value?: number;
  contactName?: string | null;
};

type InboxWorkspaceClientProps = {
  canUseBusinessActions: boolean;
  currentUserId: string;
  dealOptions: InboxDealOption[];
  initialConversations: ConversationSummary[];
  initialConversation: ConversationDetail | null;
  initialSelectedConversationId: string | null;
  hasConversationRoute: boolean;
  incomingInvites: IncomingOrganizationInvite[];
  projectOptions: InboxProjectOption[];
};

/**
 * WHY:   The inbox page needs one coordinator that binds realtime data, invite actions, and responsive thread visibility.
 * WHAT:  Renders the full workspace inbox experience from existing server data and client subscriptions.
 * HOW:   Delegates list and thread rendering to local subcomponents while preserving the current realtime inbox hooks and routes.
 */
export default function InboxWorkspaceClient({
  canUseBusinessActions,
  currentUserId,
  dealOptions,
  initialConversations,
  initialConversation,
  initialSelectedConversationId,
  hasConversationRoute,
  incomingInvites,
  projectOptions,
}: InboxWorkspaceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [businessActionError, setBusinessActionError] = useState<string | null>(null);
  const [isBusinessActionPending, setIsBusinessActionPending] = useState(false);
  const [pendingInvites, setPendingInvites] = useState(incomingInvites);
  const [isMobileThreadVisible, setIsMobileThreadVisible] = useState(hasConversationRoute);
  const {
    activeConversationId,
    conversation,
    conversations,
    handleSelectConversation,
    handleSendMessage,
    handleStartConversation,
    isLiveConversationLoading,
    isSending,
    isSearching,
    search,
    searchResults,
    sendError,
    setSearch,
  } = useRealtimeInbox({
    currentUserId,
    initialConversations,
    initialConversation,
    initialSelectedConversationId,
    hasConversationRoute,
  });

  useEffect(() => {
    if (hasConversationRoute) {
      setIsMobileThreadVisible(true);
    }
  }, [hasConversationRoute]);

  useEffect(() => {
    if (!activeConversationId) {
      setIsMobileThreadVisible(false);
    }
  }, [activeConversationId]);

  const handleAcceptInvite = async (invite: IncomingOrganizationInvite) => {
    const response = await fetch("/api/workspace/incoming-invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: invite.token }),
    });
    if (!response.ok) {
      return;
    }

    setPendingInvites((current) => current.filter((entry) => entry.id !== invite.id));
    router.refresh();
  };

  const handleCancelInvite = async (inviteId: string) => {
    const response = await fetch(`/api/workspace/incoming-invites/${inviteId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      return;
    }

    setPendingInvites((current) => current.filter((entry) => entry.id !== inviteId));
  };

  const handleShowConversation = (conversationId: string) => {
    setBusinessActionError(null);
    setIsMobileThreadVisible(true);
    startTransition(() => {
      handleSelectConversation(conversationId);
    });
  };

  const handleCreateConversation = (targetUserId: string) => {
    setBusinessActionError(null);
    setIsMobileThreadVisible(true);
    startTransition(() => {
      void handleStartConversation(targetUserId);
    });
  };

  const handleInviteMessage = async (invite: IncomingOrganizationInvite) => {
    setIsMobileThreadVisible(true);

    if (invite.conversationId) {
      startTransition(() => {
        handleSelectConversation(invite.conversationId!);
      });
      return;
    }

    await handleStartConversation(invite.inviterAuthUserId);
  };

  const postInboxIntent = async <TResult,>(body: Record<string, unknown>) => {
    const response = await fetch("/api/workspace/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message ?? "تعذر تنفيذ الإجراء.");
    }

    return response.json() as Promise<TResult>;
  };

  const runBusinessAction = async (action: () => Promise<void>) => {
    setBusinessActionError(null);
    setIsBusinessActionPending(true);

    try {
      await action();
    } catch (error) {
      setBusinessActionError(error instanceof Error ? error.message : "تعذر تنفيذ هذا الإجراء الآن.");
      throw error;
    } finally {
      setIsBusinessActionPending(false);
    }
  };

  const handleShareFile = async (file: UploadedFileReference, note?: string) => {
    if (!conversation) {
      return;
    }

    await runBusinessAction(async () => {
      await postInboxIntent({
        intent: "shareFile",
        conversationId: conversation.id,
        file,
        note,
      });
    });
  };

  const handleShareProject = async (propertyId: string, note?: string) => {
    if (!conversation) {
      return;
    }

    await runBusinessAction(async () => {
      await postInboxIntent({
        intent: "shareProject",
        conversationId: conversation.id,
        propertyId,
        note,
      });
    });
  };

  const handleShareDeal = async (dealId: string, note?: string) => {
    if (!conversation) {
      return;
    }

    await runBusinessAction(async () => {
      await postInboxIntent({
        intent: "shareDeal",
        conversationId: conversation.id,
        dealId,
        note,
      });
    });
  };

  const handleCreatePrivateOffer = async (input: {
    propertyId: string;
    price: number;
    message?: string;
    description?: string;
    attachments?: UploadedFileReference[];
  }) => {
    if (!conversation) {
      return null;
    }

    return runBusinessAction(async () => {
      const result = await postInboxIntent<OfferActionResult>({
        intent: "createPrivateOffer",
        conversationId: conversation.id,
        propertyId: input.propertyId,
        price: input.price,
        message: input.message,
        description: input.description,
        attachments: input.attachments ?? [],
      });

      if (result.conversationId && result.conversationId !== conversation.id) {
        handleShowConversation(result.conversationId);
      }
    });
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <div
        className={cn(
          "min-w-0 border-l border-slate-200 bg-white md:flex md:w-[310px] md:shrink-0 lg:w-[340px]",
          isMobileThreadVisible ? "hidden md:flex" : "flex w-full",
        )}
      >
        <InboxSidebar
          conversations={conversations}
          activeId={activeConversationId}
          invites={pendingInvites}
          isSearching={isSearching}
          onAcceptInvite={(invite) => void handleAcceptInvite(invite)}
          onCancelInvite={(inviteId) => void handleCancelInvite(inviteId)}
          onInviteMessage={(invite) => void handleInviteMessage(invite)}
          onSearchChange={setSearch}
          onSelect={handleShowConversation}
          onStartConversation={handleCreateConversation}
          search={search}
          searchResults={searchResults}
        />
      </div>

      <div
        className={cn(
          "min-w-0 flex-1 bg-white",
          isMobileThreadVisible ? "flex" : "hidden md:flex",
        )}
      >
        <div className="flex h-full w-full flex-col">
          {conversation ? (
            <InboxThreadView
              canUseBusinessActions={canUseBusinessActions}
              conversation={conversation}
              currentUserId={currentUserId}
              dealOptions={dealOptions}
              isSending={isSending || isPending || isBusinessActionPending}
              onCreatePrivateOffer={handleCreatePrivateOffer}
              onBack={() => setIsMobileThreadVisible(false)}
              onShareDeal={handleShareDeal}
              onShareFile={handleShareFile}
              onShareProject={handleShareProject}
              onSend={handleSendMessage}
              projectOptions={projectOptions}
              sendError={businessActionError || sendError}
              showBackButton={isMobileThreadVisible}
            />
          ) : isLiveConversationLoading ? (
            <InboxThreadLoadingState />
          ) : (
            <InboxThreadEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
