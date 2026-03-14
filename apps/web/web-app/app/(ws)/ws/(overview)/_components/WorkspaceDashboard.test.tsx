import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/shared/InstitutionalChatInput", () => ({
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

describe("WorkspaceDashboard", () => {
  it("renders a centered landing state before the first message", () => {
    const markup = renderToStaticMarkup(<WorkspaceDashboard initialThread={null} />);

    expect(markup).toContain("كيف يمكنني مساعدتك؟");
    expect(markup).toContain("data-slot=\"ai-motion-logo\"");
    expect(markup).toContain("data-slot=\"chat-input\"");
    expect(markup).toContain("data-layout=\"landing\"");
    expect(markup).not.toContain("السياق");
    expect(markup).not.toContain("الإشعارات");
    expect(markup).not.toContain("التحكم");
  });

  it("renders the conversation stream inline when messages exist", () => {
    const markup = renderToStaticMarkup(
      <WorkspaceDashboard
        initialThread={{
          id: "thread-1",
          title: "anan pro",
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
    expect(markup).toContain("استكمل العمل من آخر نقطة وصلت إليها داخل هذه المحادثة.");
    expect(markup).toContain("data-slot=\"ag-ui-turn\"");
    expect(markup).toContain("data-layout=\"thread\"");
    expect(markup).not.toContain("كيف يمكنني مساعدتك؟");
  });
});
