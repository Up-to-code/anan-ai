type FilterAdminUserRelevantDataArgs = {
  assistantThreads: any[];
  assistantMessages: any[];
  inboxMessages: any[];
  knowledgeResearch: any[];
  searchLogs: any[];
  notifications: any[];
  conversationParticipants: any[];
  conversations: any[];
  orders: any[];
  deals: any[];
  relevantUserIds: Set<string>;
  currentBrokerId: string | null;
  currentRedId: string | null;
  profile: any | null;
};

function filterRelevantOrders(args: FilterAdminUserRelevantDataArgs) {
  return args.orders.filter(
    (item) =>
      args.relevantUserIds.has(item.userId) ||
      (args.currentRedId ? String(item.REDId ?? "") === args.currentRedId : false),
  );
}

function filterRelevantDeals(args: FilterAdminUserRelevantDataArgs) {
  return args.deals.filter(
    (item) =>
      (args.currentBrokerId ? String(item.brokerId ?? "") === args.currentBrokerId : false) ||
      (args.currentRedId ? String(item.REDId ?? "") === args.currentRedId : false) ||
      (args.profile ? String(item.assignedTo ?? "") === String(args.profile._id) : false),
  );
}

export function filterAdminUserRelevantData(args: FilterAdminUserRelevantDataArgs) {
  const relevantUserIds = args.relevantUserIds;

  const threadRows = args.assistantThreads.filter((thread) => relevantUserIds.has(thread.userId));
  const threadIds = new Set(threadRows.map((thread) => String(thread._id)));

  const participantRows = args.conversationParticipants.filter((item) => relevantUserIds.has(item.userId));
  const conversationIdSet = new Set(participantRows.map((item) => String(item.conversationId)));
  const relevantConversations = args.conversations.filter((item) => conversationIdSet.has(String(item._id)));

  const relevantAssistantMessages = args.assistantMessages.filter((message) => threadIds.has(String(message.threadId)));
  const relevantInboxMessages = args.inboxMessages.filter(
    (message) =>
      conversationIdSet.has(String(message.conversationId)) ||
      relevantUserIds.has(message.senderUserId) ||
      relevantUserIds.has(message.recipientUserId)
  );
  const relevantResearch = args.knowledgeResearch.filter((item) => relevantUserIds.has(item.userId));
  const relevantSearchLogs = args.searchLogs.filter((item) => item.userId && relevantUserIds.has(item.userId));
  const relevantNotifications = args.notifications.filter((item) => relevantUserIds.has(item.userId));
  const relevantOrders = filterRelevantOrders(args);
  const relevantDeals = filterRelevantDeals(args);

  return {
    conversationIdSet,
    participantRows,
    relevantAssistantMessages,
    relevantConversations,
    relevantDeals,
    relevantInboxMessages,
    relevantNotifications,
    relevantOrders,
    relevantResearch,
    relevantSearchLogs,
    threadRows,
  };
}
