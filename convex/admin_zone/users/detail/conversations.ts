type BuildConversationSummariesArgs = {
  participantRows: any[];
  relevantConversations: any[];
  relevantInboxMessages: any[];
  profiles: any[];
  users: any[];
};

export function buildConversationSummaries(args: BuildConversationSummariesArgs) {
  return args.participantRows
    .map((participant) => {
      const conversation = args.relevantConversations.find(
        (item) => String(item._id) === String(participant.conversationId)
      );
      const otherProfile =
        args.profiles.find((item) => item.authUserId === participant.otherUserId) ?? null;
      const otherChannelUser =
        args.users.find(
          (item) =>
            item.userId === participant.otherUserId || item.email === otherProfile?.email
        ) ?? null;
      const messages = args.relevantInboxMessages
        .filter((item) => String(item.conversationId) === String(participant.conversationId))
        .sort((left, right) => right.createdAt - left.createdAt);
      return {
        id: String(participant.conversationId),
        otherUserId: participant.otherUserId,
        otherUserName:
          otherProfile?.name ??
          otherChannelUser?.displayName ??
          otherChannelUser?.name ??
          otherProfile?.email ??
          "مستخدم",
        otherUserRole: otherProfile?.role ?? null,
        unreadCount: participant.unreadCount,
        messagesCount: messages.length,
        lastMessagePreview:
          conversation?.lastMessagePreview ?? messages[0]?.body ?? "لا توجد رسائل",
        updatedAt: conversation?.updatedAt ?? messages[0]?.createdAt ?? 0,
      };
    })
    .sort((left, right) => right.updatedAt - left.updatedAt);
}
