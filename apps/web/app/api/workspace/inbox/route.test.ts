import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { DomainError } from "@/server/contracts/errors";

const {
  bootstrapInboxOfferConversation,
  createInboxPrivateOfferInConversation,
  getInboxConversation,
  listInboxConversations,
  resolveInboxConversation,
  shareInboxDealInConversation,
  shareInboxFileInConversation,
  shareInboxProjectInConversation,
  sendInboxMessage,
} = vi.hoisted(() => ({
  bootstrapInboxOfferConversation: vi.fn(),
  createInboxPrivateOfferInConversation: vi.fn(),
  getInboxConversation: vi.fn(),
  listInboxConversations: vi.fn(),
  resolveInboxConversation: vi.fn(),
  shareInboxDealInConversation: vi.fn(),
  shareInboxFileInConversation: vi.fn(),
  shareInboxProjectInConversation: vi.fn(),
  sendInboxMessage: vi.fn(),
}));

vi.mock("@/server/domains/inbox/service", () => ({
  bootstrapInboxOfferConversation,
  createInboxPrivateOfferInConversation,
  getInboxConversation,
  listInboxConversations,
  resolveInboxConversation,
  shareInboxDealInConversation,
  shareInboxFileInConversation,
  shareInboxProjectInConversation,
  sendInboxMessage,
}));

import { GET, POST } from "./route";

describe("/api/workspace/inbox", () => {
  beforeEach(() => {
    bootstrapInboxOfferConversation.mockReset();
    createInboxPrivateOfferInConversation.mockReset();
    getInboxConversation.mockReset();
    listInboxConversations.mockReset();
    resolveInboxConversation.mockReset();
    shareInboxDealInConversation.mockReset();
    shareInboxFileInConversation.mockReset();
    shareInboxProjectInConversation.mockReset();
    sendInboxMessage.mockReset();
  });

  it("returns one conversation when conversationId is provided", async () => {
    getInboxConversation.mockResolvedValue({ id: "conversation-1", unreadCount: 0, messages: [] });

    const response = await GET(
      new NextRequest("http://localhost/api/workspace/inbox?conversationId=conversation-1"),
    );

    expect(getInboxConversation).toHaveBeenCalledWith("conversation-1");
    expect(response.status).toBe(200);
  });

  it("creates a direct conversation when intent=resolve", async () => {
    resolveInboxConversation.mockResolvedValue("conversation-2");

    const response = await POST(
      new Request("http://localhost/api/workspace/inbox", {
        method: "POST",
        body: JSON.stringify({ intent: "resolve", targetUserId: "user-2" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ conversationId: "conversation-2" });
  });

  it("returns a stable invalid-json error", async () => {
    const response = await POST(
      new Request("http://localhost/api/workspace/inbox", {
        method: "POST",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_REQUEST",
      message: "Request body must be valid JSON",
      status: 400,
    });
  });

  it("bootstraps an offer conversation when intent=offerBootstrap", async () => {
    bootstrapInboxOfferConversation.mockResolvedValue({
      conversationId: "conversation-3",
      starterMessageCreated: true,
    });

    const response = await POST(
      new Request("http://localhost/api/workspace/inbox", {
        method: "POST",
        body: JSON.stringify({ intent: "offerBootstrap", offerId: "offer-1" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      conversationId: "conversation-3",
      starterMessageCreated: true,
    });
  });

  it("serializes domain failures", async () => {
    sendInboxMessage.mockRejectedValue(
      new DomainError({
        code: "FORBIDDEN",
        message: "Messaging is disabled",
        status: 403,
      }),
    );

    const response = await POST(
      new Request("http://localhost/api/workspace/inbox", {
        method: "POST",
        body: JSON.stringify({ targetUserId: "user-2", body: "Hello" }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "FORBIDDEN",
      message: "Messaging is disabled",
      status: 403,
    });
  });

  it("shares a file card when intent=shareFile", async () => {
    shareInboxFileInConversation.mockResolvedValue({
      conversationId: "conversation-1",
      messageId: "message-1",
    });

    const response = await POST(
      new Request("http://localhost/api/workspace/inbox", {
        method: "POST",
        body: JSON.stringify({
          intent: "shareFile",
          conversationId: "conversation-1",
          file: {
            key: "file-1",
            url: "https://files.example.com/file.pdf",
            name: "Scope.pdf",
          },
          note: "تفاصيل الاتفاق",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(shareInboxFileInConversation).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      file: {
        key: "file-1",
        url: "https://files.example.com/file.pdf",
        name: "Scope.pdf",
      },
      note: "تفاصيل الاتفاق",
    });
    expect(response.status).toBe(201);
  });

  it("creates a private offer when intent=createPrivateOffer", async () => {
    createInboxPrivateOfferInConversation.mockResolvedValue({
      offerId: "offer-1",
      conversationId: "conversation-2",
      starterMessageCreated: true,
      notification: null,
    });

    const response = await POST(
      new Request("http://localhost/api/workspace/inbox", {
        method: "POST",
        body: JSON.stringify({
          intent: "createPrivateOffer",
          conversationId: "conversation-2",
          propertyId: "property-1",
          price: 1250000,
          message: "عرض مخصص",
          description: "للشريك الحالي فقط",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(createInboxPrivateOfferInConversation).toHaveBeenCalledWith({
      conversationId: "conversation-2",
      propertyId: "property-1",
      price: 1250000,
      message: "عرض مخصص",
      description: "للشريك الحالي فقط",
    });
    expect(response.status).toBe(201);
  });
});
