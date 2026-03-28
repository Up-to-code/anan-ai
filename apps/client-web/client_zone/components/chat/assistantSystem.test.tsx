import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import type { AssistantMessage, Locale } from "@/client_zone/lib/types";
import { LocaleProvider } from "@/client_zone/components/LocaleProvider";
import { getDictionary } from "@/client_zone/i18n/dictionaries";
import { AssistantTurn } from "./AssistantTurn";
import { ChatConversation } from "./ChatConversation";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { ChatMessage } from "./ChatMessage";
import { ChatPromptInput } from "./ChatPromptInput";
import { ThreadWelcome } from "./ThreadWelcome";

function renderWithLocale(node: ReactNode, locale: Locale = "en") {
  return renderToStaticMarkup(
    <LocaleProvider locale={locale} dictionary={getDictionary(locale)}>
      {node}
    </LocaleProvider>,
  );
}

describe("client assistant system UI", () => {
  it("renders the welcome state with centered suggestion chips", () => {
    const markup = renderWithLocale(
      <ThreadWelcome
        suggestions={[
          { id: "search", label: "Find me an apartment", prompt: "Find me an apartment" },
        ]}
        onSelect={() => {}}
      />,
    );

    expect(markup).toContain("How can I help with your property search today?");
    expect(markup).toContain("Find me an apartment");
    expect(markup).toContain("justify-center");
  });

  it("keeps user and assistant turns in the same shared conversation system", () => {
    const assistantMessage: AssistantMessage = {
      id: "assistant-1",
      role: "assistant",
      text: "## Best next step\nI found a strong shortlist for you.",
      uiTurn: {
        objective: "client_assistant",
        targetZone: "client_web",
        cards: [
          {
            id: "status-1",
            componentId: "execution_result",
            props: {
              title: "Shortlist ready",
              description: "The assistant prepared a public-client shortlist.",
              status: "done",
            },
          },
        ],
      },
    };

    const markup = renderWithLocale(
      <ChatConversation>
        <ChatMessage role="user">
          <p>Find me a ready unit in Riyadh.</p>
        </ChatMessage>
        <AssistantTurn message={assistantMessage} />
      </ChatConversation>,
    );

    expect(markup).toContain("Find me a ready unit in Riyadh.");
    expect(markup).toContain("Anan");
    expect(markup).toContain("Shortlist ready");
    expect(markup).toContain("max-w-4xl");
  });

  it("renders the history drawer open state with the active thread highlighted", () => {
    const markup = renderWithLocale(
      <ChatHistorySidebar
        open
        isAuthenticated
        activeThreadId="thread-1"
        recentThreads={[
          {
            id: "thread-1",
            title: "Mortgage options",
            createdAt: 1,
            updatedAt: 1,
            preview: "Compare banks and monthly payments",
          },
        ]}
        onSelectHistoryThread={() => {}}
        onClose={() => {}}
      />,
    );

    expect(markup).toContain("translate-x-0");
    expect(markup).toContain("Mortgage options");
    expect(markup).toContain("Signed in");
  });

  it("renders the sticky composer shell with the shared chat input slot", () => {
    const markup = renderWithLocale(
      <ChatPromptInput
        value={"Hello\nNeed mortgage support"}
        onChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(markup).toContain("data-slot=\"chat-input\"");
    expect(markup).toContain("Need mortgage support");
    expect(markup).toContain("rounded-[32px]");
  });
});
