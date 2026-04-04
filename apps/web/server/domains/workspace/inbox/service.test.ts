import { describe, expect, it, vi } from "vitest";
import type { InboxRepository } from "@/server/infrastructure/convex/messaging/inbox";
import { shareInboxFileInConversation } from "@/server/domains/workspace/inbox/service";

const { mockAttachOrganizationAssets } = vi.hoisted(() => ({
  mockAttachOrganizationAssets: vi.fn(async () => undefined),
}));

vi.mock("@/server/infrastructure/convex/organizations/assets", () => ({
  convexOrganizationAssetsRepository: {
    attachOrganizationAssets: mockAttachOrganizationAssets,
  },
}));

describe("shareInboxFileInConversation", () => {
  it("attaches the file to the conversation and sends a file_share message", async () => {
    const repository: InboxRepository = {
      list: vi.fn(),
      getUnreadSummary: vi.fn(),
      get: vi.fn(async () => ({
        id: "conversation-1",
        otherUser: {
          id: "recipient-1",
          role: "developer",
          brokerId: null,
          redId: "red-1",
          organizationType: "developer",
          organizationName: "Dev Org",
        },
      }) as any),
      hasProjectShareAccess: vi.fn(),
      resolve: vi.fn(),
      bootstrapOffer: vi.fn(),
      send: vi.fn(async () => ({ conversationId: "conversation-1", messageId: "message-1" })),
      markRead: vi.fn(),
      setArchived: vi.fn(),
      searchTargets: vi.fn(),
    };

    const dependencies = {
      requireSession: vi.fn(async () => ({
        token: "token-1",
        context: { userId: "sender-1", email: "sender@example.com" },
        profile: null,
      })),
      getWorkspaceBehavior: vi.fn(async () => ({
        audience: "broker",
        ownerContext: { ownerType: "broker", ownerId: "broker-1" },
        primaryOrganization: { id: "broker-1", type: "broker", name: "Broker Org" },
        user: { name: "Sender", email: "sender@example.com" },
      })),
      repository,
    } as any;

    await shareInboxFileInConversation(
      {
        conversationId: "conversation-1",
        file: {
          key: "file-1",
          url: "https://files.test/file-1.png",
          name: "file-1.png",
        },
        note: "Shared file",
      },
      dependencies,
    );

    expect(mockAttachOrganizationAssets).toHaveBeenCalledWith("token-1", {
      keys: ["file-1"],
      attachedEntityType: "conversation",
      attachedEntityId: "conversation-1",
      visibilityScope: "organization",
    });
    expect(repository.send).toHaveBeenCalledWith("token-1", expect.objectContaining({
      conversationId: "conversation-1",
      type: "file_share",
      metadata: expect.objectContaining({
        file: expect.objectContaining({ key: "file-1" }),
        href: "https://files.test/file-1.png",
      }),
    }));
  });
});
