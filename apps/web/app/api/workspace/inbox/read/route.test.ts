import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { markInboxConversationRead } = vi.hoisted(() => ({
  markInboxConversationRead: vi.fn(),
}));

vi.mock("@/server/domains/inbox/service", () => ({
  markInboxConversationRead,
}));

import { POST } from "./route";

describe("POST /api/workspace/inbox/read", () => {
  beforeEach(() => {
    markInboxConversationRead.mockReset();
  });

  it("marks a conversation as read", async () => {
    const response = await POST(
      new Request("http://localhost/api/workspace/inbox/read", {
        method: "POST",
        body: JSON.stringify({ conversationId: "conversation-1" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(markInboxConversationRead).toHaveBeenCalledWith({ conversationId: "conversation-1" });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns a stable invalid-argument error", async () => {
    const response = await POST(
      new Request("http://localhost/api/workspace/inbox/read", {
        method: "POST",
        body: JSON.stringify({ conversationId: "" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "INVALID_ARGUMENT",
      status: 400,
    });
  });

  it("serializes domain failures", async () => {
    markInboxConversationRead.mockRejectedValue(
      new DomainError({
        code: "NOT_FOUND",
        message: "Conversation not found",
        status: 404,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/workspace/inbox/read", {
        method: "POST",
        body: JSON.stringify({ conversationId: "conversation-1" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      code: "NOT_FOUND",
      message: "Conversation not found",
      status: 404,
    });
  });
});
