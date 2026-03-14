import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import type { ConversationSummary } from "@/server/contracts/inbox";
import InboxSidebar from "./InboxSidebar";

const conversations: ConversationSummary[] = [
  {
    id: "conversation-1",
    directKey: "auth-a__auth-b",
    updatedAt: Date.now(),
    unreadCount: 3,
    lastMessage: null,
    lastMessagePreview: "آخر رسالة",
    otherUser: {
      id: "auth-b",
      name: "User B",
      email: "b@example.com",
      username: "user-b",
      role: "broker",
      brokerId: "broker-1",
      redId: null,
      organizationName: "Elite Brokers",
      organizationType: "broker",
      membershipState: "member",
      conversationId: "conversation-1",
    },
  },
];

const invites: IncomingOrganizationInvite[] = [
  {
    id: "invite-1",
    token: "token-1",
    email: "invite@example.com",
    role: "member",
    organizationName: "Elite Brokers",
    organizationType: "broker",
    inviterName: "Ahmed",
    inviterAuthUserId: "auth-c",
    canMessage: true,
    conversationId: null,
    expiresAt: Date.now(),
  },
];

describe("InboxSidebar", () => {
  it("renders unread conversation counts", () => {
    const html = renderToStaticMarkup(
      <InboxSidebar
        conversations={conversations}
        activeId={null}
        invites={[]}
        onAcceptInvite={() => {}}
        onCancelInvite={() => {}}
        onInviteMessage={() => {}}
        onSearchChange={() => {}}
        onSelect={() => {}}
        onStartConversation={() => {}}
        search=""
        searchResults={[]}
      />,
    );

    expect(html).toContain(">3<");
    expect(html).toContain("آخر رسالة");
    expect(html).toContain("Elite Brokers");
  });

  it("renders the empty search state for unmatched queries", () => {
    const html = renderToStaticMarkup(
      <InboxSidebar
        conversations={conversations}
        activeId={null}
        invites={[]}
        onAcceptInvite={() => {}}
        onCancelInvite={() => {}}
        onInviteMessage={() => {}}
        onSearchChange={() => {}}
        onSelect={() => {}}
        onStartConversation={() => {}}
        search="zzz"
        searchResults={[]}
      />,
    );

    expect(html).toContain("لا توجد نتائج مطابقة لهذا البحث.");
  });

  it("renders compact invite actions above the conversation list", () => {
    const html = renderToStaticMarkup(
      <InboxSidebar
        conversations={conversations}
        activeId={null}
        invites={invites}
        onAcceptInvite={() => {}}
        onCancelInvite={() => {}}
        onInviteMessage={() => {}}
        onSearchChange={() => {}}
        onSelect={() => {}}
        onStartConversation={() => {}}
        search=""
        searchResults={[]}
      />,
    );

    expect(html).toContain("الدعوات الواردة");
    expect(html).toContain("Elite Brokers");
    expect(html).toContain("قبول");
    expect(html).toContain("مراسلة");
  });

  it("renders organization context in search results", () => {
    const html = renderToStaticMarkup(
      <InboxSidebar
        conversations={conversations}
        activeId={null}
        invites={[]}
        onAcceptInvite={() => {}}
        onCancelInvite={() => {}}
        onInviteMessage={() => {}}
        onSearchChange={() => {}}
        onSelect={() => {}}
        onStartConversation={() => {}}
        search="elite"
        searchResults={[
          {
            id: "auth-c",
            name: "Developer C",
            email: "c@example.com",
            username: "developer-c",
            role: "developer",
            brokerId: null,
            redId: "red-1",
            organizationName: "Palm Hills",
            organizationType: "developer",
            membershipState: "pending-invite",
            conversationId: null,
          },
        ]}
      />,
    );

    expect(html).toContain("Palm Hills");
    expect(html).toContain("دعوة معلقة");
  });
});
