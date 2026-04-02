import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { ChatMessageArea, ChatMessageAreaContent } from "./chat-message-area";

it("keeps the chat transcript flexible without forcing full-height overflow", () => {
  const markup = renderToStaticMarkup(
    <ChatMessageArea data-testid="chat-area">
      <div>messages</div>
    </ChatMessageArea>,
  );

  expect(markup).toContain("relative min-h-0 flex-1 basis-0");
  expect(markup).not.toContain("overflow-y-auto");
});

it("bottom-aligns short chat transcripts above the floating composer", () => {
  const markup = renderToStaticMarkup(
    <ChatMessageArea>
      <ChatMessageAreaContent data-testid="chat-content">
        <div>messages</div>
      </ChatMessageAreaContent>
    </ChatMessageArea>,
  );

  expect(markup).toContain("h-full min-h-0 overflow-y-auto");
  expect(markup).toContain("mx-auto flex min-h-full w-full max-w-2xl flex-col justify-end py-2");
});
