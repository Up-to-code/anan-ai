import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { usePathname, useSearchParams, useConvexAuth, useQuery } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useConvexAuth: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useSearchParams,
}));

vi.mock("convex/react", () => ({
  useConvexAuth,
  useQuery,
}));

vi.mock("../../_components/Chat/InstitutionalChatInput", () => ({
  default: ({
    value,
    isSending,
    layout,
  }: {
    value: string;
    isSending?: boolean;
    layout?: "landing" | "thread";
  }) => (
    <div data-slot="chat-input" data-layout={layout}>
      input:{value}:{isSending ? "sending" : "idle"}:{layout}
    </div>
  ),
}));

vi.mock("../../_components/Chat/MessageRow", () => ({
  default: ({
    content,
    children,
  }: {
    content: string;
    children?: React.ReactNode;
  }) => (
    <div data-slot="message-row">
      <span>{content}</span>
      {children}
    </div>
  ),
}));

vi.mock("../../_components/Chat/TypingIndicator", () => ({
  default: ({ text }: { text: string }) => <div data-slot="typing-indicator">{text}</div>,
}));

vi.mock("../../_components/Chat/AgUiTurnRenderer", () => ({
  default: () => <div data-slot="ag-ui-turn">ag-ui</div>,
}));

vi.mock("../../_components/AIMotion", () => ({
  AIMotionLogo: () => <div data-slot="ai-motion-logo">logo</div>,
}));

import WorkspaceDashboard from "./WorkspaceDashboard";

beforeEach(() => {
  usePathname.mockReset();
  usePathname.mockReturnValue("/ws");
  useSearchParams.mockReset();
  useSearchParams.mockReturnValue(new URLSearchParams());
  useConvexAuth.mockReset();
  useConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
  useQuery.mockReset();
  useQuery.mockReturnValue(undefined);
});

it("renders a chat-first landing state before the first message", () => {
  const markup = renderToStaticMarkup(
    <WorkspaceDashboard
      initialThread={null}
      initialRouteState={{ requestedThreadId: null, unavailableThreadId: null }}
      user={{ id: "user-1", name: "Ahmed", email: "ahmed@example.com" }}
    />,
  );

  expect(markup).toContain("data-slot=\"assistant-surface\"");
  expect(markup).toContain("data-slot=\"assistant-landing-panel\"");
  expect(markup).toContain("data-slot=\"ai-motion-logo\"");
  expect(markup).toContain("data-slot=\"chat-input\"");
  expect(markup).toContain("data-layout=\"landing\"");
  expect(markup).toContain("data-slot=\"landing-composer-dock\"");
  expect(markup).toContain("relative flex h-full min-h-0 min-w-0 w-full flex-1 basis-0 flex-col overflow-hidden bg-background text-foreground");
  expect(markup).toContain("relative flex h-full min-h-0 min-w-0 w-full flex-1 basis-0 flex-col overflow-hidden");
  expect(markup).toContain("flex h-full min-h-0 min-w-0 w-full flex-1 basis-0 items-center justify-center bg-background");
  expect(markup).toContain("كيف يمكنني مساعدتك اليوم؟");
  expect(markup).toContain("حلّل حركة السوق العقاري في الرياض هذا الأسبوع");
  expect(markup).not.toContain("opacity:0");
  expect(markup).not.toContain("السياق");
  expect(markup).not.toContain("الإشعارات");
  expect(markup).not.toContain("التحكم");
});

it("renders an inline unavailable-thread notice for invalid direct links", () => {
  const markup = renderToStaticMarkup(
    <WorkspaceDashboard
      initialThread={null}
      initialRouteState={{ requestedThreadId: "missing-thread", unavailableThreadId: "missing-thread" }}
      user={{ id: "user-1", name: "Ahmed", email: "ahmed@example.com" }}
    />,
  );

  expect(markup).toContain("data-slot=\"assistant-unavailable-thread\"");
  expect(markup).toContain("تعذر العثور على المحادثة المطلوبة");
  expect(markup).toContain("بدء محادثة جديدة");
});

it("renders the conversation stream inline when messages exist", () => {
  const markup = renderToStaticMarkup(
    <WorkspaceDashboard
      initialThread={{
        id: "thread-1",
        title: "anan workspace",
        messages: [
          {
            id: "message-1",
            role: "user",
            content: "hello",
            createdAt: 1,
          },
          {
            id: "message-2",
            role: "assistant",
            content: "world",
            createdAt: 2,
            uiTurn: {
              version: "1",
              title: "Turn",
              subtitle: null,
              cards: [],
            },
          },
        ],
      }}
      initialRouteState={{ requestedThreadId: "thread-1", unavailableThreadId: null }}
      user={{ id: "user-1", name: "Ahmed", email: "ahmed@example.com" }}
    />,
  );

  expect(markup).toContain("hello");
  expect(markup).toContain("world");
  expect(markup).toContain("data-slot=\"ag-ui-turn\"");
  expect(markup).toContain("data-layout=\"thread\"");
  expect(markup).toContain("data-slot=\"assistant-surface\"");
  expect(markup).toContain("assistant-composer-dock-safe-area relative grid h-full min-h-0 min-w-0 w-full flex-1 basis-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden");
  expect(markup).toContain("relative z-0 min-h-0 px-4");
  expect(markup).toContain("data-slot=\"thread-composer-dock\"");
  expect(markup).toContain("data-slot=\"thread-composer-shell\"");
  expect(markup).toContain("--assistant-composer-height:128px");
  expect(markup).toContain("--assistant-scroll-button-gap:14px");
  expect(markup).toContain("--assistant-content-end-gap:28px");
  expect(markup).toContain("pb-6 sm:pb-8");
  expect(markup).not.toContain("opacity:0");
  expect(markup).not.toContain("data-slot=\"assistant-landing-panel\"");
});
