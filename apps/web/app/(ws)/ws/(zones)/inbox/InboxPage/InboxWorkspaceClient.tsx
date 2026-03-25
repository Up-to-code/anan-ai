"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { OfferActionResult } from "@/server/contracts/offers";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import InboxSidebar from "./components/InboxSidebar";
import { InboxThreadEmptyState, InboxThreadLoadingState } from "./components/InboxStates";
import InboxThreadView from "./InboxThreadView";
import { useInboxBusinessActions } from "./useInboxBusinessActions";
import type { InboxWorkspaceClientProps } from "./InboxWorkspaceClient.types";
import { useRealtimeInbox } from "./useRealtimeInbox";

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
  initialStartUserId = null,
  hasConversationRoute,
  incomingInvites,
  projectOptions,
}: InboxWorkspaceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingInvites, setPendingInvites] = useState(incomingInvites);
  const [isMobileThreadVisible, setIsMobileThreadVisible] = useState(
    () => hasConversationRoute || Boolean(initialStartUserId && initialStartUserId !== currentUserId),
  );
  const [isResolvingStartConversation, setIsResolvingStartConversation] = useState(
    () => Boolean(initialStartUserId && initialStartUserId !== currentUserId && !hasConversationRoute),
  );
  const startUserIdToResolveRef = useRef<string | null>(initialStartUserId);
  const {
    businessActionError,
    clearBusinessActionError,
    isBusinessActionPending,
    postInboxIntent,
    runBusinessAction,
  } = useInboxBusinessActions();
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
    const startUserIdToResolve = startUserIdToResolveRef.current;
    if (!startUserIdToResolve || hasConversationRoute || startUserIdToResolve === currentUserId) {
      startUserIdToResolveRef.current = null;
      return;
    }

    startUserIdToResolveRef.current = null;
    startTransition(() => {
      void handleStartConversation(startUserIdToResolve).finally(() => {
        setIsResolvingStartConversation(false);
      });
    });
  }, [currentUserId, handleStartConversation, hasConversationRoute, router, startTransition]);
  const isThreadPaneVisible = hasConversationRoute || isResolvingStartConversation || isMobileThreadVisible;

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
    clearBusinessActionError();
    setIsMobileThreadVisible(true);
    startTransition(() => {
      handleSelectConversation(conversationId);
    });
  };

  const handleCreateConversation = (targetUserId: string) => {
    clearBusinessActionError();
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
    <div className="flex h-[calc(100svh-65px)] lg:h-[calc(100svh-73px)] w-full overflow-hidden bg-white">
      <div
        className={cn(
          "min-w-0 border-l border-slate-200 bg-white md:flex md:w-[310px] md:shrink-0 lg:w-[340px]",
          isThreadPaneVisible ? "hidden md:flex" : "flex w-full",
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
          isThreadPaneVisible ? "flex" : "hidden md:flex",
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
              showBackButton={isThreadPaneVisible}
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
