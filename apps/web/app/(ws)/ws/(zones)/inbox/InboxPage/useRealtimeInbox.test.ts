import { describe, expect, it } from "vitest";
import { getInboxAutoSelectedConversationId } from "./useRealtimeInbox";

describe("getInboxAutoSelectedConversationId", () => {
  it("auto-selects the first conversation only when no active conversation exists", () => {
    expect(
      getInboxAutoSelectedConversationId({
        activeConversationId: null,
        conversations: [{ id: "conversation-1" }, { id: "conversation-2" }],
        hasConversationRoute: false,
      }),
    ).toBe("conversation-1");
  });

  it("does not override a user-selected conversation", () => {
    expect(
      getInboxAutoSelectedConversationId({
        activeConversationId: "conversation-2",
        conversations: [{ id: "conversation-1" }, { id: "conversation-2" }],
        hasConversationRoute: false,
      }),
    ).toBeNull();
  });

  it("does not auto-select while a route-pinned conversation is active", () => {
    expect(
      getInboxAutoSelectedConversationId({
        activeConversationId: null,
        conversations: [{ id: "conversation-1" }],
        hasConversationRoute: true,
      }),
    ).toBeNull();
  });

  it("does not auto-select again after the initial default pick has already been resolved", () => {
    expect(
      getInboxAutoSelectedConversationId({
        activeConversationId: null,
        conversations: [{ id: "conversation-1" }, { id: "conversation-2" }],
        hasConversationRoute: false,
        hasInitializedAutoSelection: true,
      }),
    ).toBeNull();
  });
});
