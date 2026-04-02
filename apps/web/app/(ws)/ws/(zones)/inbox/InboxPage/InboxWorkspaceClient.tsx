"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PanelLeftOpen } from "lucide-react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
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
  initialConversations,
  initialConversation,
  initialSelectedConversationId,
  initialStartUserId = null,
  hasConversationRoute,
  incomingInvites,
  projectOptions,
}: InboxWorkspaceClientProps) {
  const { direction, isRtl } = useWebLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
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
    archivedConversations,
    conversation,
    conversations,
    handleSetConversationArchived,
    handleSelectConversation,
    handleSendMessage,
    handleStartConversation,
    isArchivingConversation,
    isLiveConversationLoading,
    isShowingArchived,
    isSending,
    isSearching,
    search,
    searchResults,
    sendError,
    setShowArchived,
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

  const handleCreatePrivateOfferDraft = async (input: {
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
        intent: "createPrivateOfferDraft",
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

      return result;
    });
  };

  const handlePublishConversationOffer = async (offerId: string) => {
    if (!conversation) {
      return null;
    }

    return runBusinessAction(async () => {
      const result = await postInboxIntent<OfferActionResult>({
        intent: "publishConversationOffer",
        conversationId: conversation.id,
        offerId,
      });

      if (result.conversationId && result.conversationId !== conversation.id) {
        handleShowConversation(result.conversationId);
      }

      return result;
    });
  };

  const handleRespondToConversationOffer = async (input: {
    offerId: string;
    status: "accepted" | "rejected";
  }) => {
    if (!conversation) {
      return null;
    }

    return runBusinessAction(async () => {
      return postInboxIntent<{ ok: true }>({
        intent: "respondToConversationOffer",
        conversationId: conversation.id,
        offerId: input.offerId,
        status: input.status,
      });
    });
  };

  return (
    <div
      className="flex h-full min-h-0 w-full flex-1 basis-0 overflow-hidden bg-[var(--workspace-shell)]"
      dir={direction}
    >
      <div
        className={cn(
          "h-full min-h-0 min-w-0 flex-col bg-[var(--workspace-sidebar)] md:flex md:h-full md:w-[340px] md:shrink-0 xl:w-[380px]",
          isRtl ? "border-l" : "border-r",
          "border-[color:var(--workspace-border)]",
          isThreadPaneVisible ? "hidden md:flex" : "flex w-full",
          isDesktopSidebarCollapsed && "md:hidden",
        )}
      >
        <InboxSidebar
          conversations={conversations}
          activeId={activeConversationId}
          archivedCount={archivedConversations.length}
          invites={pendingInvites}
          isShowingArchived={isShowingArchived}
          isSearching={isSearching}
          onAcceptInvite={(invite) => void handleAcceptInvite(invite)}
          onCancelInvite={(inviteId) => void handleCancelInvite(inviteId)}
          onInviteMessage={(invite) => void handleInviteMessage(invite)}
          onSearchChange={setSearch}
          onSelect={handleShowConversation}
          onStartConversation={handleCreateConversation}
          onToggleCollapsed={() => setIsDesktopSidebarCollapsed(true)}
          onToggleShowArchived={setShowArchived}
          search={search}
          searchResults={searchResults}
        />
      </div>

      <div
        className={cn(
          "relative h-full min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden bg-[var(--workspace-canvas)]",
          isThreadPaneVisible ? "flex" : "hidden md:flex",
        )}
      >
        {isDesktopSidebarCollapsed ? (
          <button
            type="button"
            onClick={() => setIsDesktopSidebarCollapsed(false)}
            className={cn(
              "absolute top-4 z-20 hidden items-center gap-2 rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-3 py-2 text-[12px] font-bold text-[var(--workspace-muted)] shadow-sm transition hover:text-foreground md:inline-flex",
              isRtl ? "right-4" : "left-4",
            )}
          >
            <PanelLeftOpen className="h-4 w-4" />
            {isRtl ? "فتح القائمة" : "Open inbox"}
          </button>
        ) : null}
        <div className="flex h-full w-full min-h-0 flex-1 basis-0 flex-col">
          {conversation ? (
            <InboxThreadView
              key={conversation.id}
              canUseBusinessActions={canUseBusinessActions}
              conversation={conversation}
              currentUserId={currentUserId}
              isArchivingConversation={isArchivingConversation}
              isSidebarCollapsed={isDesktopSidebarCollapsed}
              isSending={isSending || isPending || isBusinessActionPending}
              onCreatePrivateOfferDraft={handleCreatePrivateOfferDraft}
              onBack={() => setIsMobileThreadVisible(false)}
              onPublishConversationOffer={handlePublishConversationOffer}
              onRespondToConversationOffer={handleRespondToConversationOffer}
              onSetConversationArchived={handleSetConversationArchived}
              onShareFile={handleShareFile}
              onShareProject={handleShareProject}
              onSend={handleSendMessage}
              onToggleSidebarCollapsed={() => setIsDesktopSidebarCollapsed((current) => !current)}
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
