import { expect, it, vi } from "vitest";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

import InboxConversationPage from "./page";

it("redirects legacy conversation routes to the canonical inbox query param URL", async () => {
  await InboxConversationPage({
    params: Promise.resolve({ conversationId: "conversation-1" }),
  });

  expect(redirect).toHaveBeenCalledWith("/ws/inbox?conversationId=conversation-1");
});
