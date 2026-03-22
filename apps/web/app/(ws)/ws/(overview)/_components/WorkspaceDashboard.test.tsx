import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const { usePathname, useSearchParams, useQuery } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
  useSearchParams,
}));

vi.mock("convex/react", () => ({
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
  usePathname.mockReturnValue("/ws");
  useSearchParams.mockReturnValue(new URLSearchParams());
  useQuery.mockReturnValue(undefined);
});

it("renders a chat-first landing state before the first message", () => {
  const markup = renderToStaticMarkup(<WorkspaceDashboard initialThread={null} />);

  expect(markup).toContain("data-slot=\"assistant-surface\"");
  expect(markup).toContain("data-slot=\"assistant-landing-panel\"");
  expect(markup).toContain("data-slot=\"ai-motion-logo\"");
  expect(markup).toContain("data-slot=\"chat-input\"");
  expect(markup).toContain("data-layout=\"landing\"");
  expect(markup).toContain("data-slot=\"landing-composer-dock\"");
  expect(markup).toContain("مساعد عنان");
  expect(markup).toContain("ما هي أكثر المناطق طلبًا هذا الشهر؟");
  expect(markup).not.toContain("كيف يمكنني مساعدتك؟");
  expect(markup).not.toContain("السياق");
  expect(markup).not.toContain("الإشعارات");
  expect(markup).not.toContain("التحكم");
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
    />,
  );

  expect(markup).toContain("hello");
  expect(markup).toContain("world");
  expect(markup).toContain("data-slot=\"ag-ui-turn\"");
  expect(markup).toContain("data-layout=\"thread\"");
  expect(markup).toContain("data-slot=\"assistant-surface\"");
  expect(markup).toContain("data-slot=\"thread-composer-dock\"");
  expect(markup).not.toContain("data-slot=\"assistant-landing-panel\"");
});
