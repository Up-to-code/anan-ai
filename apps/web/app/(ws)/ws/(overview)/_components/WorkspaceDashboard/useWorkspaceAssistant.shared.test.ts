import { expect, it } from "vitest";
import { buildWorkspaceAssistantHref } from "./useWorkspaceAssistant.shared";

it("builds a thread URL by replacing draft state and preserving unrelated params", () => {
  expect(
    buildWorkspaceAssistantHref({
      pathname: "/ws",
      search: "newThread=1&tab=signals",
      hash: "#section",
      threadId: "thread-A",
    }),
  ).toBe("/ws?tab=signals&threadId=thread-A#section");
});

it("builds a draft URL by removing threadId and keeping the rest of the query", () => {
  expect(
    buildWorkspaceAssistantHref({
      pathname: "/ws",
      search: "threadId=thread-A&tab=signals",
      threadId: null,
      newThread: true,
    }),
  ).toBe("/ws?tab=signals&newThread=1");
});
