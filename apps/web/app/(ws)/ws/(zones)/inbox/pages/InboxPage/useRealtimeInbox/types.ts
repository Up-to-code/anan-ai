"use client";

import type {
  ConversationDetail,
  ConversationSummary,
  UserConversationTarget,
} from "@/server/contracts/inbox";

export type UseRealtimeInboxArgs = {
  currentUserId: string;
  initialConversations: ConversationSummary[];
  initialConversation: ConversationDetail | null;
  initialSelectedConversationId: string | null;
  hasConversationRoute: boolean;
};

export type UseRealtimeInboxResult = {
  activeConversationId: string | null;
  conversation: ConversationDetail | null;
  conversations: ConversationSummary[];
  archivedConversations: ConversationSummary[];
  isArchivingConversation: boolean;
  isLiveConversationLoading: boolean;
  isShowingArchived: boolean;
  isSending: boolean;
  isSearching: boolean;
  search: string;
  searchResults: UserConversationTarget[];
  sendError: string | null;
  setShowArchived: (value: boolean) => void;
  setSearch: (value: string) => void;
  handleSetConversationArchived: (conversationId: string, archived: boolean) => Promise<void>;
  handleSelectConversation: (conversationId: string) => void;
  handleStartConversation: (targetUserId: string) => Promise<void>;
  handleSendMessage: (body: string) => Promise<void>;
};

