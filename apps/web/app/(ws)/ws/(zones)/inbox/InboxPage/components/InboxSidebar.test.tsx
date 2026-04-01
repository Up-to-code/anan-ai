import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";
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

function renderInboxSidebar(element: React.ReactNode) {
  return renderToStaticMarkup(
    <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
      {element}
    </WebLocaleProvider>,
  );
}

it("renders unread conversation counts", () => {
  const html = renderInboxSidebar(
    <InboxSidebar
      conversations={conversations}
      activeId={null}
      archivedCount={0}
      invites={[]}
      isShowingArchived={false}
      onAcceptInvite={() => {}}
      onCancelInvite={() => {}}
      onInviteMessage={() => {}}
      onSearchChange={() => {}}
      onSelect={() => {}}
      onStartConversation={() => {}}
      onToggleCollapsed={() => {}}
      onToggleShowArchived={() => {}}
      search=""
      searchResults={[]}
    />,
  );

  expect(html).toContain(">3<");
  expect(html).toContain("آخر رسالة");
  expect(html).toContain("Elite Brokers");
});

it("renders the empty search state for unmatched queries", () => {
  const html = renderInboxSidebar(
    <InboxSidebar
      conversations={conversations}
      activeId={null}
      archivedCount={0}
      invites={[]}
      isShowingArchived={false}
      onAcceptInvite={() => {}}
      onCancelInvite={() => {}}
      onInviteMessage={() => {}}
      onSearchChange={() => {}}
      onSelect={() => {}}
      onStartConversation={() => {}}
      onToggleCollapsed={() => {}}
      onToggleShowArchived={() => {}}
      search="zzz"
      searchResults={[]}
    />,
  );

  expect(html).toContain("لا توجد نتائج مطابقة لبحثك.");
});

it("renders compact invite actions above the conversation list", () => {
  const html = renderInboxSidebar(
    <InboxSidebar
      conversations={conversations}
      activeId={null}
      archivedCount={0}
      invites={invites}
      isShowingArchived={false}
      onAcceptInvite={() => {}}
      onCancelInvite={() => {}}
      onInviteMessage={() => {}}
      onSearchChange={() => {}}
      onSelect={() => {}}
      onStartConversation={() => {}}
      onToggleCollapsed={() => {}}
      onToggleShowArchived={() => {}}
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
  const html = renderInboxSidebar(
    <InboxSidebar
      conversations={conversations}
      activeId={null}
      archivedCount={0}
      invites={[]}
      isShowingArchived={false}
      onAcceptInvite={() => {}}
      onCancelInvite={() => {}}
      onInviteMessage={() => {}}
      onSearchChange={() => {}}
      onSelect={() => {}}
      onStartConversation={() => {}}
      onToggleCollapsed={() => {}}
      onToggleShowArchived={() => {}}
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

it("renders the archived filter box when archived conversations exist", () => {
  const html = renderInboxSidebar(
    <InboxSidebar
      conversations={conversations}
      activeId={null}
      archivedCount={2}
      invites={[]}
      isShowingArchived={false}
      onAcceptInvite={() => {}}
      onCancelInvite={() => {}}
      onInviteMessage={() => {}}
      onSearchChange={() => {}}
      onSelect={() => {}}
      onStartConversation={() => {}}
      onToggleCollapsed={() => {}}
      onToggleShowArchived={() => {}}
      search=""
      searchResults={[]}
    />,
  );

  expect(html).toContain("المؤرشف");
  expect(html).toContain(">2<");
});
