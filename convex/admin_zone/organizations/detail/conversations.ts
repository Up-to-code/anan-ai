export function buildOrganizationConversationSummaries(args: {
  participantRows: any[];
  organizationConversations: any[];
  organizationInboxMessages: any[];
  profiles: any[];
}) {
  return args.participantRows
    .map((participant) => {
      const conversation = args.organizationConversations.find(
        (item) => String(item._id) === String(participant.conversationId)
      );
      const otherProfile = args.profiles.find((item) => item.authUserId === participant.otherUserId) ?? null;
      const messages = args.organizationInboxMessages
        .filter((item) => String(item.conversationId) === String(participant.conversationId))
        .sort((left, right) => right.createdAt - left.createdAt);

      return {
        id: String(participant.conversationId),
        otherUserId: participant.otherUserId,
        otherUserName: otherProfile?.name ?? otherProfile?.email ?? "مستخدم",
        otherUserRole: otherProfile?.role ?? null,
        unreadCount: participant.unreadCount,
        messagesCount: messages.length,
        lastMessagePreview: conversation?.lastMessagePreview ?? messages[0]?.body ?? "لا توجد رسائل",
        updatedAt: conversation?.updatedAt ?? messages[0]?.createdAt ?? 0,
      };
    })
    .sort((left, right) => right.updatedAt - left.updatedAt);
}

