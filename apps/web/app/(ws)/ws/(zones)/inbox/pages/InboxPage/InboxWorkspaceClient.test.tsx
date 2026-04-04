import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { useRouter } = vi.hoisted(() => ({
  useRouter: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter,
}));

vi.mock("@/app/_components/WebLocaleProvider", () => ({
  useWebLocale: () => ({ direction: "rtl", isRtl: true }),
}));

vi.mock("./components/InboxSidebar", () => ({
  default: () => <div data-slot="inbox-sidebar">Sidebar</div>,
}));

vi.mock("./InboxThreadView", () => ({
  default: () => <div data-slot="inbox-thread-view">Thread</div>,
}));

vi.mock("./components/InboxStates", () => ({
  InboxThreadEmptyState: () => <div data-slot="inbox-empty-state">Empty</div>,
  InboxThreadLoadingState: () => <div data-slot="inbox-loading-state">Loading</div>,
}));

vi.mock("./useInboxBusinessActions", () => ({
  useInboxBusinessActions: () => ({
    businessActionError: null,
    clearBusinessActionError: vi.fn(),
    isBusinessActionPending: false,
    postInboxIntent: vi.fn(),
    runBusinessAction: async <T,>(action: () => Promise<T>) => action(),
  }),
}));

vi.mock("./useRealtimeInbox", () => ({
  useRealtimeInbox: () => ({
    activeConversationId: null,
    archivedConversations: [],
    conversation: null,
    conversations: [],
    handleSetConversationArchived: vi.fn(),
    handleSelectConversation: vi.fn(),
    handleSendMessage: vi.fn(),
    handleStartConversation: vi.fn(async () => null),
    isArchivingConversation: false,
    isLiveConversationLoading: false,
    isShowingArchived: false,
    isSending: false,
    isSearching: false,
    search: "",
    searchResults: [],
    sendError: null,
    setShowArchived: vi.fn(),
    setSearch: vi.fn(),
  }),
}));

import InboxWorkspaceClient from "./InboxWorkspaceClient";

beforeEach(() => {
  useRouter.mockReset();
  useRouter.mockReturnValue({ refresh: vi.fn() });
});

it("uses a flex-height shell instead of Safari-sensitive viewport-unit math", () => {
  const markup = renderToStaticMarkup(
    <InboxWorkspaceClient
      canUseBusinessActions={false}
      currentUserId="user-1"
      dealOptions={[]}
      initialConversations={[]}
      initialConversation={null}
      initialSelectedConversationId={null}
      hasConversationRoute={false}
      incomingInvites={[]}
      projectOptions={[]}
    />,
  );

  expect(markup).toContain("data-slot=\"inbox-sidebar\"");
  expect(markup).toContain("data-slot=\"inbox-empty-state\"");
  expect(markup).toContain("flex h-full min-h-0 w-full flex-1 basis-0 overflow-hidden bg-[var(--workspace-shell)]");
  expect(markup).toContain("relative h-full min-h-0 min-w-0 flex-1 basis-0 flex-col overflow-hidden bg-[var(--workspace-canvas)]");
  expect(markup).toContain("flex h-full w-full min-h-0 flex-1 basis-0 flex-col");
  expect(markup).not.toContain("100svh");
});
