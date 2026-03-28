import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { getRedOffersSnapshot } from "./developer";

describe("red offers server functions", () => {
  it("loads the developer offers snapshot after session validation", async () => {
    const repository = {
      getQueues: vi.fn(async () => ({
        audience: "developer" as const,
        queues: [
          {
            key: "open_inventory" as const,
            label: "Open Inventory Offers",
            description: "Developer-owned inventory packages currently open.",
            items: [{ id: "offer-1", propertyId: "property-1", price: 1, status: "pending" as const }],
          },
        ],
        sent: [{ id: "offer-1", propertyId: "property-1", price: 1, status: "pending" as const }],
        received: [],
        marketplace: [],
      })),
      create: vi.fn(async () => ({ offerId: "offer-1", conversationId: null, starterMessageCreated: false, notification: null })),
      publish: vi.fn(async () => ({ ok: true as const })),
      respond: vi.fn(async () => undefined),
      apply: vi.fn(async () => ({ offerId: "offer-1", conversationId: null, starterMessageCreated: false, notification: null })),
    };

    const snapshot = await getRedOffersSnapshot({
      requireDeveloper: vi.fn(async () => ({
        token: "token",
        context: { userId: "user-1", role: "developer", redId: "red-1", isActive: true },
        profile: null,
      })),
      repository,
    });

    expect(snapshot.sent).toHaveLength(1);
    expect(repository.getQueues).toHaveBeenCalledWith("token");
  });
});
